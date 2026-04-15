import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Lectures', href: '#lectures' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">DG</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-lg font-semibold text-foreground">Dr. Dipti Ganatra</span>
            <span className="text-xs text-muted-foreground">Medical Lectures</span>
          </div>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
          <a href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Admin
          </a>
          <a href="#lectures" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
            Book a Lecture
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="container flex flex-col gap-4 py-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
                  {l.label}
                </a>
              ))}
              <a href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
                Admin
              </a>
              <a href="#lectures" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary px-5 py-2 text-center text-sm font-semibold text-primary-foreground">
                Book a Lecture
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
