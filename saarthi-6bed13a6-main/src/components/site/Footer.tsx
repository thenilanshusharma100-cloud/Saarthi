import { Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/saarthi-logo.png";

export function Footer() {
  return (
    <footer className="mt-24 gradient-ocean text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 font-display font-bold text-xl">
            <img src={logo} alt="Saarthi logo" className="size-12 object-contain drop-shadow" />
            <span>Saarthi</span>
          </div>
          <p className="mt-3 text-sm opacity-80 max-w-xs">
            Har Safar Ka Saathi. Your AI travel companion for incredible India — plan smarter, travel better.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/create-trip">Create Trip</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow</h4>
          <div className="flex gap-3">
            <a className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram"><Instagram className="size-4" /></a>
            <a className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Twitter"><Twitter className="size-4" /></a>
            <a className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="YouTube"><Youtube className="size-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-80">
        Designed and developed by CodeThinkers © Saarthi · Made with love for Indian travelers
      </div>
    </footer>
  );
}
