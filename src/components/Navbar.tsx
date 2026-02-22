'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/batch', label: 'Batch' },
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/inspector', label: 'Inspector' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">SiteCompare</span>
        <div className="flex gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium hover:text-indigo-200 transition-colors ${
                pathname === link.href ? 'text-white border-b-2 border-white' : 'text-indigo-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
