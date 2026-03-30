import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Collections", to: "/collections" },
    { label: "Sale", to: "/sale" },
    { label: "New Arrivals", to: "/products?sort=newest" },
  ],
  Support: [
    { label: "FAQ", to: "/faq" },
    { label: "Shipping Policy", to: "/shipping" },
    { label: "Returns", to: "/returns" },
    { label: "Contact Us", to: "/contact" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-primary">●</span> SHOPIFY
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Thoughtfully made goods for people who care about quality and craft.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold">{section}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shopify Demo. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
