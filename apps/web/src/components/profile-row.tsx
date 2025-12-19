import { ReactNode } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  isLink?: boolean; // Added to trigger chevron rendering if children is null
}

export function ProfileRow({ 
    icon: Icon, 
    label, 
    description, 
    children, 
    className, 
    onClick,
    isLink 
}: ProfileRowProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ease-out",
        "border border-transparent hover:border-white/10 hover:bg-white/5 hover:shadow-sm",
        onClick || isLink ? "cursor-pointer" : "",
        className
      )}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex items-center gap-5 z-10">
         {Icon && (
             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                <Icon className="w-5 h-5" />
             </div>
         )}
         <div className="flex flex-col gap-0.5">
             <span className="text-foreground/80 group-hover:text-foreground font-medium text-sm tracking-wide transition-colors">
                {label}
             </span>
             {description && (
                <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                    {description}
                </span>
             )}
         </div>
      </div>
      
      <div className="relative flex items-center gap-3 z-10">
        {children}
        {/* Auto-add chevron if it's a link but has no specific right-side content */}
        {(isLink && !children) && (
             <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
        )}
      </div>
    </div>
  )
}