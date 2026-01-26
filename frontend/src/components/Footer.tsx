import { Shield } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Compliance", href: "#compliance" },
    { name: "Reporting", href: "#reporting" },
    { name: "Pricing", href: "#pricing" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Mission", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security", href: "#" },
    { name: "GDPR", href: "#" },
  ],
};

export function Footer() {
  return (
    // Explicitly bg-card with relative positioning to block grid
    <footer className="relative z-10 border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Shield className="h-7 w-7 text-sentinel-blue" />
                <div className="absolute inset-0 blur-lg bg-sentinel-blue/30" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Sentinel
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              Compliance-first security that bridges offensive scanning with 
              defensive remediation.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sentinel Security. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}