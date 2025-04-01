"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const menu = [
  { name: "Backlog", icon: "backlog", navigation: "/backlog" },
  { name: "Board", icon: "board", navigation: "/board" },
  { name: "Reports", icon: "reports", navigation: "/reports" },
  { name: "Releases", icon: "releases", navigation: "/releases" },
  { name: "Components", icon: "components", navigation: "/components" },
  { name: "Issues", icon: "issues", navigation: "/issues" },
  { name: "Repository", icon: "repository", navigation: "/repository" },
  { name: "Add Item", icon: "settings", navigation: "/add-item" },
  { name: "Settings", icon: "settings", navigation: "/settings" },
];

const hideList = ["/login", "/register"];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (hideList.includes(pathname)) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#f1f2f4] p-2 rounded-md shadow-md"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d={isOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <nav
        className={`bg-[#f1f2f4] text-black w-full max-w-64 h-screen overflow-y-auto
                   fixed md:sticky top-0 left-0 z-40 flex flex-col p-4 gap-4 py-8 shadow-md
                   transition-transform duration-300 ease-in-out
                   ${
                     isOpen
                       ? "translate-x-0"
                       : "-translate-x-full md:translate-x-0"
                   }`}>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative rounded-full overflow-hidden">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
              alt="avatar"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
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
              onClick={() => isOpen && setIsOpen(false)} // Only close on mobile
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

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

