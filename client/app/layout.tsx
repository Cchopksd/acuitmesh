import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import StoreProvider from "./StoreProvider";
import { decodeUserToken } from "./utils/token";
import { JwtPayload } from "jwt-decode";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I love my job",
  description: "I love my job",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userInfo = (await decodeUserToken()) as JwtPayload & {
    id: string;
    email: string;
    name: string;
  };
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar userInfo={userInfo} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

