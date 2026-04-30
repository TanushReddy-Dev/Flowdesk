"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
          FlowDesk
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 min-h-[44px] flex items-center">
                Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="min-h-[44px]">
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => signIn("google")} className="min-h-[44px]">Sign in with Google</Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-4 flex flex-col gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{session.user?.name}</p>
                  <p className="text-xs text-neutral-500">{session.user?.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="min-h-[44px] flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Button variant="outline" className="w-full min-h-[44px]" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button className="w-full min-h-[44px]" onClick={() => signIn("google")}>
              Sign in with Google
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
