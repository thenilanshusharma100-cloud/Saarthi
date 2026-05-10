import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/saarthi-logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(1200px,95%)]">
      <nav className="glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-soft">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <img src={logo} alt="Saarthi" className="size-10 object-contain" />
          <span>Saarthi</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                path === l.to ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/profile" })}>
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth" })}>
                Log in
              </Button>
              <Button size="sm" className="gradient-sunset border-0 text-white shadow-glow" onClick={() => navigate({ to: "/auth" })}>
                <Sparkles className="size-4" /> Get started
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass rounded-2xl mt-2 p-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-secondary">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-secondary">Profile</Link>
              <button onClick={() => signOut()} className="px-3 py-2 rounded-lg hover:bg-secondary text-left">Sign out</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg gradient-sunset text-white text-center">
              Get started
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
