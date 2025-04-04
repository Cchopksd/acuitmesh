"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { destroyUserToken } from "../utils/token";
import { MenuSquareIcon, X } from "lucide-react";

const menu = [
  { name: "Backlog", navigation: "/backlog" },
  { name: "Board", navigation: "/board" },
  { name: "Reports", navigation: "/reports" },
  { name: "Releases", navigation: "/releases" },
  { name: "Components", navigation: "/components" },
  { name: "Issues", navigation: "/issues" },
  { name: "Repository", navigation: "/repository" },
  { name: "Add Item", navigation: "/add-item" },
  { name: "Settings", navigation: "/settings" },
];

const hideList = ["/login", "/register"];

export default function Sidebar({
  userInfo,
}: {
  userInfo: { id: string; email: string; name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (hideList.includes(pathname)) return null;

  const handleLogout = async () => {
    await destroyUserToken();
    window.location.href = "/board";
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed ${
          isOpen ? "top-4 right-4" : "top-4 left-4"
        } z-50 bg-white p-2 rounded-md shadow-md focus:outline-none focus:ring transition-transform`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}>
        {isOpen ? <X /> : <MenuSquareIcon />}
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed md:relative bg-gray-100 text-black w-64 h-screen overflow-y-auto top-0 left-0 z-40 flex flex-col p-6 gap-6 transition-transform duration-300 ease-in-out shadow-lg 
                   ${
                     isOpen
                       ? "translate-x-0"
                       : "-translate-x-full md:translate-x-0"
                   }`}>
        {/* User Info */}
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="w-12 h-12 relative rounded-full overflow-hidden">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
              alt="User Avatar"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">{userInfo.name}</h2>
            <p className="text-sm text-gray-500">Software Project</p>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2">
          {menu.map((item, idx) => (
            <li key={idx}>
              <a
                href={item.navigation}
                onClick={() => isOpen && setIsOpen(false)}
                className={`block p-3 rounded-md font-semibold transition-colors text-sm
                  ${
                    pathname === item.navigation
                      ? "bg-blue-200 text-blue-900"
                      : "text-gray-700 hover:bg-gray-300"
                  }`}
                aria-current={
                  pathname === item.navigation ? "page" : undefined
                }>
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto p-3 rounded-md text-red-600 font-semibold bg-red-100 hover:bg-red-200 focus:outline-none focus:ring">
          Logout
        </button>
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
