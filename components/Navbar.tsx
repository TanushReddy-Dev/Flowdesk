"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
          FlowDesk
        </Link>
        
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => signIn("google")}>Sign in with Google</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
