import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, text = "Loading...", size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      <div className="relative mb-4">
        {/* Outer glow ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-white/20 animate-pulse",
          sizeClasses[size]
        )} />
        
        {/* Rotating border */}
        <div className={cn(
          "absolute inset-0 rounded-full border-3 border-transparent border-t-white/60 animate-spin",
          sizeClasses[size]
        )} style={{ animation: "spin 1.5s linear infinite" }} />
        
        {/* Logo */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl",
          sizeClasses[size]
        )}>
          <Image 
            src="/logo.png" 
            alt="xStream" 
            width={size === "sm" ? 20 : size === "md" ? 28 : 36}
            height={size === "sm" ? 20 : size === "md" ? 28 : 36}
            className="animate-pulse"
          />
        </div>
      </div>
      
      <span className={cn(
        "text-white/70 font-light animate-pulse",
        textSizes[size]
      )}>
        {text}
      </span>
    </div>
  );
}