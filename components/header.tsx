"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function Header({ user }: { user: User }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <header className="bg-primary px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 sm:size-9 rounded-lg bg-primary-foreground/20 backdrop-blur-sm">
            <Bookmark className="size-4 sm:size-5 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-primary-foreground">
            Markly
          </span>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full pl-1 pr-3 py-1">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={displayName}
                className="size-7 sm:size-8 rounded-full ring-2 ring-primary-foreground/20"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="size-7 sm:size-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-primary-foreground hidden md:block max-w-[150px] lg:max-w-[200px] truncate">
              {displayName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="size-8 sm:size-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
