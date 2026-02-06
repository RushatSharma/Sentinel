import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
    Shield, 
    Lock, 
    Server, 
    Globe, 
    ArrowRight, 
    Activity, 
    Cpu, 
    Users, 
    FileKey 
} from "lucide-react";

// Assets (Using the ones we know exist in Sentinel)
import LogoWhite from "/LogoWhite.png";
import LogoBlack from "/LogoBlack.png";
import AuthIllustration from "@/assets/AuthBlack.webp"; // Reusing as a placeholder for visuals
import AuthIllustrationWhite from "@/assets/AuthWhite.webp";

// You might want to add specific team/journey images to your assets later
// For now, I'll use placeholders or existing assets to prevent errors

const AboutPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Placeholder Team Data - Replace with real Sentinel team members
  const teamMembers = [
    { name: "Alex Cipher", role: "Lead Security Researcher", avatar: "https://github.com/shadcn.png" },
    { name: "Sarah Firewall", role: "Head of Infrastructure", avatar: "https://github.com/shadcn.png" },
    { name: "Mike Vector", role: "Threat Analyst", avatar: "https://github.com/shadcn.png" },
    { name: "Emily Hash", role: "Cryptography Specialist", avatar: "https://github.com/shadcn.png" },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Vigilance",
      description: "We never sleep so you can. Our heuristic engines monitor your infrastructure 24/7, identifying anomalies before they become breaches.",
    },
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "Privacy First",
      description: "We believe data sovereignty is a human right. Our architecture is designed to protect your information, even from us.",
    },
    {
      icon: <Cpu className="w-8 h-8 text-primary" />,
      title: "Innovation",
      description: "Threats evolve, and so do we. We leverage cutting-edge machine learning to stay ahead of zero-day vulnerabilities.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Transparency",
      description: "No black boxes. We provide clear, actionable insights into your security posture with automated compliance reporting.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        {/* --- Hero Section --- */}
        <section className="pt-20 lg:pt-32 pb-20 lg:pb-24 bg-background">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">

            {/* Logo Animation */}
            <div className="relative mb-8">
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full"></div>
                <img
                src={isDarkMode ? LogoWhite : LogoBlack}
                alt="Sentinel Logo Symbol"
                className="relative w-32 h-32 animate-spin-slow object-contain"
                />
            </div>

            <h3 className="text-primary font-semibold uppercase tracking-wider mb-4">About Sentinel</h3>
            <h1 className="max-w-4xl text-4xl lg:text-5xl font-bold leading-tight">
              Fortifying the Digital Frontier with <span className="text-primary">Intelligent Defense</span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl font-medium text-muted-foreground">
              We aren't just a security tool; we are your digital immune system, designed to neutralize threats before they emerge.
            </p>

            <div className="w-full max-w-4xl border-t border-border pt-10 mt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center group">
                        <Activity className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform"/>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground">99.9%</p>
                        <p className="mt-1 text-sm text-muted-foreground">Threats Blocked</p>
                    </div>
                    <div className="text-center group">
                        <Server className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform"/>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground">10k+</p>
                        <p className="mt-1 text-sm text-muted-foreground">Nodes Protected</p>
                    </div>
                    <div className="text-center group">
                        <Globe className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform"/>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground">24/7</p>
                        <p className="mt-1 text-sm text-muted-foreground">Global Monitoring</p>
                    </div>
                    <div className="text-center group">
                        <FileKey className="w-8 h-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform"/>
                        <p className="text-3xl lg:text-4xl font-bold text-foreground">ISO</p>
                        <p className="mt-1 text-sm text-muted-foreground">Certified Compliant</p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* --- Journey Section --- */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4 space-y-20">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-primary font-semibold uppercase tracking-wide">Our Mission</h3>
              <h2 className="mt-2 text-3xl lg:text-4xl font-bold">The Sentinel Story</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                 Born from a necessity to counter increasingly sophisticated cyber-attacks, Sentinel evolved from a simple port scanner into a comprehensive heuristic defense engine.
              </p>
            </div>
            
            {/* Story Block 1: The Origin */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl p-8 flex items-center justify-center aspect-video shadow-xl border border-border/50">
                    <Shield className="w-32 h-32 text-primary opacity-80" />
               </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">The Origin Protocol</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                   In the early days of decentralized networks, we noticed a critical gap: security tools were reactive, not proactive. They waited for an attack to happen. Sentinel was founded on a different principle—predicting the vector before the breach occurs. Our initial prototype focused on deep packet inspection, laying the groundwork for what would become our core engine.
                </p>
              </div>
            </div>

            {/* Story Block 2: The Evolution */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2">
                 <div className="bg-gradient-to-bl from-primary/20 to-secondary/20 rounded-3xl p-8 flex items-center justify-center aspect-video shadow-xl border border-border/50">
                    <Cpu className="w-32 h-32 text-primary opacity-80" />
                 </div>
              </div>
              <div className="md:order-1 text-right md:text-left">
                <h3 className="text-2xl font-bold mb-4">The Heuristic Revolution</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                   Today, Sentinel isn't just code; it's an intelligent ecosystem. By integrating advanced heuristics and machine learning, we've transitioned from static defense to dynamic immunity. We don't just patch holes; we anticipate where the next fracture will appear, securing infrastructure for enterprise giants and privacy advocates alike.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Team Section --- */}
        <section className="py-20 bg-background text-center">
          <div className="container mx-auto px-4">
            <h3 className="text-primary font-semibold uppercase tracking-wide">The Architects</h3>
            <h2 className="mt-2 text-3xl lg:text-4xl font-bold">Meet the Security Team</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
               Behind every blocked packet and secured port is a team of dedicated researchers, white-hat hackers, and engineers.
            </p>
            
            <div className="mt-16 bg-secondary/30 p-8 rounded-3xl border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="group flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                        src={member.avatar}
                        alt={member.name}
                        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg transform transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-foreground">{member.name}</h3>
                    <p className="text-sm font-medium text-primary mt-1">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- Values Section --- */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h3 className="text-primary font-semibold uppercase tracking-wide">Core Protocols</h3>
                    <h2 className="mt-2 text-3xl lg:text-4xl font-bold">Built on Trust & Logic</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our code is open, our methods are transparent, and our commitment to your security is absolute.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value) => (
                    <div key={value.title} className="bg-secondary/20 p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors duration-300">
                    <div className="mb-6 p-3 bg-background rounded-xl inline-block shadow-sm">{value.icon}</div>
                    <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{value.description}</p>
                    </div>
                ))}
                </div>
            </div>
        </section>

         {/* --- CTA Section --- */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="relative rounded-3xl p-8 md:p-16 overflow-hidden bg-primary text-primary-foreground shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:30px_30px] opacity-20" />
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    
                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="text-center md:text-left space-y-6">
                            <h2 className="text-3xl md:text-5xl font-bold text-white">Secure Your Infrastructure Today</h2>
                            <p className="text-lg md:text-xl text-white/90 max-w-lg">
                                Don't wait for a breach to reveal your vulnerabilities. Run a comprehensive deep scan with Sentinel and harden your defenses immediately.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                                <Link to="/auth">
                                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-14 text-lg w-full sm:w-auto shadow-lg">
                                        Get Protected <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg w-full sm:w-auto">
                                        Talk to Sales
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            {/* Reusing Auth Illustration as generic security visual */}
                            <img
                                src={isDarkMode ? AuthIllustrationWhite : AuthIllustration}
                                alt="Security Shield"
                                className="w-full max-w-sm object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;