"use client";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import MainContent from "../../components/MainContent";
import { SidebarProvider } from "../../components/SidebarContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white min-h-screen">
        <Sidebar />
        <Header />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}