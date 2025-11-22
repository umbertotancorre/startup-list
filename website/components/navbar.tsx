'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function Navbar() {
  const { session } = useSupabase();
  const pathname = usePathname();
  const user = session?.user;

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    user?.user_metadata?.picture;

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const firstName =
    fullName.trim().split(" ").filter(Boolean)[0] ?? "My account";
  const avatarFallback = firstName.slice(0, 1).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-[920px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Startup List EU"
              width={28}
              height={28}
              priority
              className="h-[28px] w-[28px]"
            />
          </Link>

          <nav className="flex items-center gap-[10px]">
            {navLinks.map((link) => {
              // For Countries link, also check if we're on a country detail page
              const isActive = link.href === "/countries" 
                ? pathname === link.href || pathname.startsWith("/countries/")
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center justify-center rounded-[8px] px-[12px] py-[9px] text-sm font-semibold leading-[16px] tracking-[0.144px] text-zinc-900 transition-colors ${
                    isActive ? 'bg-[#f2f2f2]' : 'hover:bg-[#f7f7f7]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
              <Link
                href="/saved"
                aria-label="Saved"
                className={`inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-foreground transition-colors ${
                  pathname === "/saved" ? "bg-[#f2f2f2]" : "hover:bg-[#f7f7f7]"
                }`}
              >
                <Image
                  src="/icons/save.svg"
                  alt="Saved"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
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
                    <Avatar className="h-[34px] w-[34px]">
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
                  <AvatarDropdownMenuLabel className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0">
                      <span className="text-base font-medium tracking-[0.144px] text-zinc-900">
                        {firstName}
                      </span>
                      <span className="text-sm font-[456] tracking-[0.196px] text-zinc-500">
                        {user?.email}
                      </span>
                    </div>
                  </AvatarDropdownMenuLabel>
                  <AvatarDropdownMenuSeparator />
                  <AvatarDropdownMenuGroup>
                    <AvatarDropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Image
                          src="/icons/profile.svg"
                          alt="Profile"
                          width={18}
                          height={18}
                          className="size-[18px]"
                        />
                        Profile
                      </Link>
                    </AvatarDropdownMenuItem>
                    <AvatarDropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Image
                          src="/icons/settings.svg"
                          alt="Settings"
                          width={18}
                          height={18}
                          className="size-[18px]"
                        />
                        Settings
                      </Link>
                    </AvatarDropdownMenuItem>
                    <AvatarDropdownMenuItem asChild>
                      <form action="/auth/sign-out" method="post">
                        <button type="submit" className="w-full cursor-pointer text-left">
                          Log out 
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


