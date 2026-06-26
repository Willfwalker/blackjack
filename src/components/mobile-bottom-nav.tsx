"use client";

import Link from "next/link";
import { BookOpen, Dumbbell, House, Spade } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/play", label: "Play", icon: Spade },
  { href: "/tools", label: "Tools", icon: Dumbbell },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`mobile-bottom-link ${active ? "mobile-bottom-link-active" : ""}`}>
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
