"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Package, Settings, Home, User, LogOut } from "lucide-react";
import { HomeSelector } from "@/components/HomeSelector";

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  // Hide navigation on auth pages
  const isAuthPage = pathname.startsWith('/auth/');
  const showNavigation = status === "authenticated" && !isAuthPage;

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <header className="text-center md:text-left space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Preben Prepper
            </h1>
          </header>

          <div className="flex items-center space-x-2 md:space-x-4">
            {showNavigation && (
              <>
                <HomeSelector />
                <nav className="flex justify-center md:justify-end space-x-1 md:space-x-2">
                  <Button
                    variant={pathname === "/" ? "default" : "outline"}
                    size="sm"
                    asChild
                    className="px-2 md:px-3"
                  >
                    <Link href="/">
                      <Home className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Home</span>
                    </Link>
                  </Button>
                <Button
                  variant={pathname === "/inventory" ? "default" : "outline"}
                  size="sm"
                  asChild
                  className="px-2 md:px-3"
                >
                  <Link href="/inventory">
                    <Package className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Inventory</span>
                  </Link>
                </Button>
                <Button
                  variant={pathname === "/admin" ? "default" : "outline"}
                  size="sm"
                  asChild
                  className="px-2 md:px-3"
                >
                  <Link href="/admin">
                    <Settings className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                </Button>
              </nav>
              </>
            )}
            
            {!isAuthPage && (
              <div className="flex items-center space-x-1 md:space-x-2">
                {status === "loading" ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : status === "authenticated" ? (
                  <>
                    <span className="text-sm text-gray-700 hidden lg:inline">
                      Hello, {session.user?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="px-2 md:px-3"
                    >
                      <LogOut className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <div className="space-x-1 md:space-x-2">
                    <Button variant="outline" size="sm" asChild className="px-2 md:px-3">
                      <Link href="/auth/signin">
                        <User className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Sign In</span>
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="px-2 md:px-3">
                      <Link href="/auth/signup">
                        <span className="hidden sm:inline">Sign Up</span>
                        <span className="sm:hidden">Join</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
