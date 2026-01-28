"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

export function VTNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const baseUrl = `/website`;
  
  const navLinks = [
    { href: baseUrl, label: "Home" },
    { href: `${baseUrl}/services`, label: "Services" },
    { href: `${baseUrl}/personal-trainers`, label: "Personal Trainers" },
    { href: `${baseUrl}/about`, label: "About" },
    { href: `${baseUrl}/join-our-team`, label: "Join Our Team" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === baseUrl) {
      return pathname === baseUrl;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-[#0f0f0f]"
            : "bg-[#181818]/80 backdrop-blur-sm"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={baseUrl} className="flex items-center gap-3 relative z-10">
              <Image
                src="/images/vt/vetted-logo.png"
                alt="Vetted Trainers"
                width={160}
                height={48}
                className="h-[60px] w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors relative group ${
                    isActive(link.href)
                      ? "text-[#50BFF4]"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#50BFF4] transition-all duration-300 ${
                      isActive(link.href)
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg hover:shadow-[#50BFF4]/20 hover:scale-105"
              >
                Get Vetted!
              </a>
            </div>

            {/* Mobile menu button (hamburger) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 relative z-50"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 mt-1.5 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 mt-1.5 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-[#0f0f0f] transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8">
          {/* Navigation Links */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-4 text-2xl font-bold transition-colors border-b border-white/10 ${
                      isActive(link.href)
                        ? "text-[#50BFF4]"
                        : "text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <div className="mt-auto">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-5 rounded-full font-bold text-center text-xl transition-colors"
            >
              Get Vetted!
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
