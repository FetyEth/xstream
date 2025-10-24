"use client";

import { 
  Home, 
  TrendingUp,
  ThumbsUp, 
  History, 
  PlaySquare,
  Upload,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { icon: Home, label: "Home", href: "/browse" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: PlaySquare, label: "Dashboard", href: "/dashboard" },
];

const libraryItems = [
  { icon: History, label: "History", href: "/history" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
  { icon: Users, label: "Subscriptions", href: "/subscriptions" },
];

const creatorItems = [
  { icon: Upload, label: "Upload Video", href: "/upload" },
  // { icon: DollarSignIcon, label: "Advertise", href: "/advertise" }
];

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-[73px] bottom-0 bg-black/40 backdrop-blur-xl border-r border-white/5 hidden md:block transition-all duration-300 z-40`}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 bg-black/60 backdrop-blur-lg border border-white/10 rounded-full p-1 hover:bg-white/10 transition-all duration-300"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-white/70" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-white/70" />
        )}
      </Button>

      <div className="p-4 space-y-6 overflow-y-auto h-full mt-2">
        
        {/* Main Navigation */}
        <div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} font-light ${isActive ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/5'} transition-all duration-300`}
                  title={isCollapsed ? item.label : undefined}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <hr className="border-white/5" />

        {/* Library Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-light text-white/50 mb-3 px-3 uppercase tracking-wider">
              Library
            </h3>
          )}
          <nav className="space-y-1">
            {libraryItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} font-light ${isActive ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/5'} transition-all duration-300`}
                  title={isCollapsed ? item.label : undefined}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <hr className="border-white/5" />

        {/* Creator Tools */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-light text-white/50 mb-3 px-3 uppercase tracking-wider">
              Creator Tools
            </h3>
          )}
          <nav className="space-y-1">
            {creatorItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} font-light ${isActive ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/5'} transition-all duration-300`}
                  title={isCollapsed ? item.label : undefined}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 text-xs text-white/40 font-light">
            <p>© 2025 xStream</p>
            <p>Powered by x402 & Base</p>
          </div>
        )}
      </div>
    </div>
  );
}
