import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, Youtube, Instagram } from "lucide-react";

const socialLinks = [
  {
    href: "https://www.youtube.com/channel/UCMTekJJglOmXvy3AZGjbQYw",
    icon: Youtube,
    label: "YouTube",
    hoverColor: "hover:bg-red-600",
  },
  {
    href: "https://www.instagram.com/vettedtrainers/",
    icon: Instagram,
    label: "Instagram",
    hoverColor: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500",
  },
];

export function VTFooter() {
  const currentYear = new Date().getFullYear();
  const baseUrl = `/website`;

  const navLinks = [
    { href: baseUrl, label: "Home" },
    { href: `${baseUrl}/services`, label: "Services" },
    { href: `${baseUrl}/personal-trainers`, label: "Personal Trainers" },
    { href: `${baseUrl}/about`, label: "About" },
    { href: `${baseUrl}/join-our-team`, label: "Join Our Team" },
  ];

  return (
    <footer className="bg-[#0f0f0f] border-t border-white/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Description */}
          <div>
            <Link href={baseUrl} className="inline-block mb-4">
              <Image
                src="/images/vt/vetted-logo.png"
                alt="Vetted Trainers"
                width={140}
                height={42}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Vetted Trainers is a team of top-notch trainers combining strength training, 
              mobility, and tissue work to optimize your human movement.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-[#252525] rounded-xl transition-all duration-300 group ${social.hoverColor}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
              {/* TikTok - custom icon */}
              <a
                href="https://www.tiktok.com/@vettedtrainers"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#252525] rounded-xl transition-all duration-300 hover:bg-black group"
                aria-label="TikTok"
              >
                <svg
                  className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#50BFF4] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com/?q=5712+Industry+Lane+Unit+E+Frederick+MD+21703"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-[#50BFF4] transition-colors"
                >
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>5712 Industry Lane Unit E, Frederick, MD 21703</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:Tony@vettedtrainers.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#50BFF4] transition-colors"
                >
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span>Tony@vettedtrainers.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+12403970240"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#50BFF4] transition-colors"
                >
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span>(240) 397-0240</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Vetted Trainers. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs">
              Frederick, Maryland&apos;s Premier Personal Training
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
