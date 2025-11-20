'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { AuthModal } from "@/components/auth/auth-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AvatarDropdownMenu,
  AvatarDropdownMenuContent,
  AvatarDropdownMenuGroup,
  AvatarDropdownMenuItem,
  AvatarDropdownMenuLabel,
  AvatarDropdownMenuSeparator,
  AvatarDropdownMenuTrigger,
} from "@/components/ui/avatarDropdownMenu";

const navLinks = [
  { label: "Explore", href: "/" },
  { label: "Countries", href: "/countries" },
];

const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (newTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', newTheme === 'dark');
  }
};

export function Navbar() {
  const { session } = useSupabase();
  const user = session?.user;
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    user?.user_metadata?.picture;

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const firstName =
    fullName.trim().split(" ").filter(Boolean)[0] ?? "My account";
  const avatarFallback = firstName.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="z-50 h-[72px] bg-white/95 backdrop-blur-sm dark:bg-zinc-950/80">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Startup List EU"
              width={30}
              height={30}
              priority
              className="h-[30px] w-[30px] dark:invert"
            />
          </Link>

          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-8 items-center justify-center rounded-full px-0 text-base font-semibold tracking-[0.144px] text-zinc-900 dark:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          {session ? (
            <>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
              <Link
                href="/saved"
                aria-label="Saved"
                className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-zinc-900 hover:text-zinc-900 dark:text-zinc-50 dark:hover:text-zinc-50"
              >
                <BookmarkBorderIcon className="h-[22px] w-[22px]" />
              </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    Saved
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AvatarDropdownMenu>
                <AvatarDropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="cursor-pointer rounded-full focus:outline-none focus-visible:outline-none"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={avatarUrl}
                        alt={user?.email ?? "User avatar"}
                      />
                      <AvatarFallback className="text-sm font-semibold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </AvatarDropdownMenuTrigger>
                <AvatarDropdownMenuContent className="w-56" align="end" sideOffset={10}>
                  <AvatarDropdownMenuLabel className="flex flex-col gap-0">
                    <span className="text-base font-semibold tracking-[0.144px] text-zinc-900 dark:text-zinc-50">
                      {firstName}
                    </span>
                    <span className="text-sm font-[456] tracking-[0.196px] text-zinc-500 dark:text-zinc-400">
                      {user?.email}
                    </span>
                  </AvatarDropdownMenuLabel>
                  <AvatarDropdownMenuSeparator />
                  <div className="flex h-9 items-center justify-between px-2.5">
                    <p className="text-base font-semibold tracking-[0.144px] text-zinc-900 dark:text-zinc-50">
                      Theme
                    </p>
                    <div className="flex h-9 items-center gap-0.5 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                          theme === 'light'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                            : 'bg-transparent text-zinc-600 dark:text-zinc-400'
                        }`}
                        aria-label="Light theme"
                      >
                        <LightIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                          theme === 'dark'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                            : 'bg-transparent text-zinc-600 dark:text-zinc-400'
                        }`}
                        aria-label="Dark theme"
                      >
                        <DarkIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                          theme === 'system'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                            : 'bg-transparent text-zinc-600 dark:text-zinc-400'
                        }`}
                        aria-label="System theme"
                      >
                        <SystemIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <AvatarDropdownMenuSeparator />
                  <AvatarDropdownMenuGroup>
                    <AvatarDropdownMenuItem asChild>
                      <Link href="/saved">Saved</Link>
                    </AvatarDropdownMenuItem>
                    <AvatarDropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </AvatarDropdownMenuItem>
                    <AvatarDropdownMenuItem asChild>
                      <form action="/auth/sign-out" method="post">
                        <button type="submit" className="w-full cursor-pointer text-left">
                          Sign out
                        </button>
                      </form>
                    </AvatarDropdownMenuItem>
                  </AvatarDropdownMenuGroup>
                </AvatarDropdownMenuContent>
              </AvatarDropdownMenu>
            </>
          ) : (
            <AuthModal />
          )}
        </div>
      </div>
    </header>
  );
}

function BookmarkBorderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z" />
    </svg>
  );
}

function LightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zM11 .55h2V3.5h-2zm8.04 2.495l1.408 1.407-1.79 1.79-1.407-1.408zm-1.8 15.115l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 4h2v2.95h-2zm-7.45-.96l1.41 1.41 1.79-1.8-1.41-1.41z" />
    </svg>
  );
}

function DarkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-2V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z" />
    </svg>
  );
}

