const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          Ore<span className="text-gradient-primary">hack</span>
        </span>
        <span className="text-xs text-muted-foreground">by Oregent</span>
      </div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Oregent. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
