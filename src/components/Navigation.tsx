"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Github, ExternalLink, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  className?: string;
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

export function Navigation({ className, currentPage, setCurrentPage }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "training", label: "Training", href: "/training" },
    { id: "terminal", label: "Terminal", href: "/terminal" },
    { id: "history", label: "History", href: "/history" },
    { id: "docs", label: "Docs", href: "/docs" },
    { id: "about", label: "About", href: "/about" },
    { id: "demo", label: "Tech Demo", href: "/demo" },
  ];

  const externalLinks = [
    {
      icon: Github,
      href: "https://github.com/aptos-labs/aptos-wallet-adapter",
      label: "GitHub",
    },
    {
      icon: ExternalLink,
      href: "https://aptos.dev/",
      label: "Aptos Docs",
    },
  ];

  return (
    <nav className={`bg-background border-b border-border sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-primary text-xl font-bold font-mono hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              <Wallet className="w-6 h-6" />
              COTRAIN
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* External Links & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
            <ThemeToggle />
            <Link href="/demo">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm"
                size="sm"
              >
                Launch Demo
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-muted/50">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4 px-3 py-2">
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="px-3 py-2">
              <Link href="/demo" onClick={() => setIsMenuOpen(false)}>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm w-full"
                  size="sm"
                >
                  Launch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}