"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

const menu = [
  { name: "Backlog", icon: "backlog", navigation: "/backlog" },
  { name: "Board", icon: "Board", navigation: "/board" },
  { name: "Reports", icon: "reports", navigation: "/reports" },
  { name: "Releases", icon: "releases", navigation: "/releases" },
  { name: "Components", icon: "Components", navigation: "/components" },
  { name: "Issues", icon: "issues", navigation: "/issues" },
  { name: "Repository", icon: "Repository", navigation: "/repository" },
  { name: "Add Item", icon: "settings", navigation: "/add-item" },
  { name: "Settings", icon: "settings", navigation: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#f1f2f4] text-black w-full max-w-64 h-screen fixed top-0 left-0 flex flex-col p-4 gap-4 py-8 shadow-md">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <Image
          src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
          alt="avatar"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h2 className="font-bold text-lg">Teams in Space</h2>
          <p className="text-sm text-[#a3aabb]">Software project</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1">
        {menu.map((item, idx) => (
          <Link
            key={idx}
            href={item.navigation}
            className={`flex items-center p-3 rounded-md font-semibold transition-colors ${
              pathname === item.navigation
                ? "text-[#00419c] bg-[#e4e9ec] font-bold"
                : "text-[#3c4c70] hover:bg-[#dfe3e8]"
            }`}
            aria-current={pathname === item.navigation ? "page" : undefined}>
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

