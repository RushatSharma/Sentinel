import ssl
import socket
import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa

def test_tls_version(domain, version):
    """Attempts to connect using a specific TLS version with permissive settings."""
    try:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        context.minimum_version = version
        context.maximum_version = version
        try:
            context.set_ciphers('ALL:@SECLEVEL=0') 
        except:
            context.set_ciphers('ALL')

        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                return True
    except:
        return False

def get_name_attribute(name_obj, oid):
    """Helper to safely extract certificate attributes like CN and O."""
    for attribute in name_obj:
        if attribute.oid == oid:
            return attribute.value
    return None

def analyze_ssl(target):
    domain = target.replace("https://", "").replace("http://", "").split("/")[0]
    
    result = {
        "target": domain,
        "status": "success",
        "grade": "F",
        "cert_details": {},
        "supported_protocols": [],
        "vulnerabilities": []
    }
    
    score = 100

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    try:
        context.set_ciphers('ALL:@SECLEVEL=0') 
    except:
        context.set_ciphers('ALL')

    try:
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                der_cert = ssock.getpeercert(binary_form=True)
                if not der_cert:
                    return {"error": "Failed to retrieve certificate from server."}
                    
                cert_obj = x509.load_der_x509_certificate(der_cert, default_backend())
                
                not_before = cert_obj.not_valid_before
                not_after = cert_obj.not_valid_after
                days_left = (not_after - datetime.datetime.utcnow()).days
                
                issuer_cn = get_name_attribute(cert_obj.issuer, x509.NameOID.COMMON_NAME)
                if not issuer_cn:
                    issuer_cn = get_name_attribute(cert_obj.issuer, x509.NameOID.ORGANIZATION_NAME) or "Unknown Issuer"
                    
                subject_cn = get_name_attribute(cert_obj.subject, x509.NameOID.COMMON_NAME) or "Unknown Subject"
                
                public_key = cert_obj.public_key()
                key_type = "Unknown"
                key_size = getattr(public_key, "key_size", 0)

                if isinstance(public_key, rsa.RSAPublicKey):
                    key_type = "RSA"
                    if key_size < 2048:
                        result["vulnerabilities"].append(f"CRITICAL: Weak RSA Key Size ({key_size}-bit). Minimum required is 2048-bit.")
                        score -= 50
                elif isinstance(public_key, ec.EllipticCurvePublicKey):
                    key_type = "ECDSA (Elliptic Curve)"
                    key_size = public_key.curve.key_size
                
                cipher_tuple = ssock.cipher()
                negotiated_cipher = cipher_tuple[0] if cipher_tuple else "Unknown"
                
                weak_ciphers = ["RC4", "DES", "3DES", "MD5", "NULL", "EXPORT"]
                if any(weak in negotiated_cipher for weak in weak_ciphers):
                    result["vulnerabilities"].append(f"VULNERABILITY: Server negotiated a weak cipher suite: {negotiated_cipher}.")
                    score -= 40

                try:
                    san_ext = cert_obj.extensions.get_extension_for_class(x509.SubjectAlternativeName)
                    sans = san_ext.value.get_values_for_type(x509.DNSName)
                except x509.ExtensionNotFound:
                    sans = []

                result["cert_details"] = {
                    "issuer": issuer_cn,
                    "subject": subject_cn,
                    "valid_from": not_before.strftime("%Y-%m-%d"),
                    "valid_to": not_after.strftime("%Y-%m-%d"),
                    "days_remaining": days_left,
                    "key_type": key_type,
                    "key_size": key_size,
                    "negotiated_cipher": negotiated_cipher,
                    "sans": sans[:10]
                }
                
                if days_left < 0:
                    result["vulnerabilities"].append("CRITICAL: Certificate is completely expired.")
                    score -= 100
                elif days_left < 30:
                    result["vulnerabilities"].append("WARNING: Certificate expires in less than 30 days.")
                    score -= 20

    # --- CRITICAL FIX: GRACEFUL HANDSHAKE FAILURE HANDLING ---
    except ssl.SSLError as e:
        err_str = str(e)
        if "HANDSHAKE_FAILURE" in err_str or "no ciphers" in err_str.lower() or "wrong version number" in err_str.lower():
            result["grade"] = "F"
            result["cert_details"] = {
                "issuer": "Connection Refused (Handshake Failed)",
                "subject": domain,
                "valid_from": "N/A",
                "valid_to": "N/A",
                "days_remaining": 0,
                "key_type": "N/A",
                "key_size": 0,
                "negotiated_cipher": "Failed to Negotiate",
                "sans": []
            }
            result["vulnerabilities"].append(f"CRITICAL: SSL Handshake Failed. The server likely strictly mandates obsolete/insecure ciphers (like RC4) that modern clients flatly refuse to support.")
            return result
        else:
            return {"error": f"SSL Error: {err_str}"}
    except Exception as e:
        return {"error": f"Connection Failed: {str(e)}"}

    # --- PROTOCOL DOWNGRADE TESTS ---
    protocols = {
        "TLS 1.3": ssl.TLSVersion.TLSv1_3,
        "TLS 1.2": ssl.TLSVersion.TLSv1_2,
        "TLS 1.1 (Obsolete)": ssl.TLSVersion.TLSv1_1,
        "TLS 1.0 (Obsolete)": ssl.TLSVersion.TLSv1
    }
    
    for name, version in protocols.items():
        if test_tls_version(domain, version):
            result["supported_protocols"].append(name)
            if "Obsolete" in name:
                result["vulnerabilities"].append(f"VULNERABILITY: Server supports {name}. Susceptible to POODLE/BEAST downgrade attacks.")
                score -= 30

    if score >= 90: result["grade"] = "A"
    elif score >= 70: result["grade"] = "B"
    elif score >= 50: result["grade"] = "C"
    else: result["grade"] = "F"

    if not result["vulnerabilities"]:
        result["vulnerabilities"].append("No critical cryptographic vulnerabilities detected.")

    return result