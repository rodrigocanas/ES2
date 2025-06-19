"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, MountainSnow, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = session
    ? [
        { href: "/posts", label: "Início" }, // leva a /posts se autenticado
        { href: "/aboutus", label: "Sobre Nós" },
        { href: "/quiz", label: "Quiz's" },
        { href: "/profile", label: "Perfil" },
      ]
    : [
        { href: "/", label: "Início" },
        { href: "/aboutus", label: "Sobre Nós" },
        { href: "/login", label: "Login" },
      ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        "border-border/60 bg-background/85 backdrop-blur-lg"
      )}
    >
      <div className="container flex h-16 max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link href={session ? "/posts" : "/"} className="flex items-center space-x-2">
            <MountainSnow className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold sm:inline-block">FindOut</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-grow" />

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center justify-center gap-x-3 text-sm font-medium lg:gap-x-4 xl:gap-x-5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 transition-all duration-200 ease-out lg:px-4",
                  "hover:text-primary",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                  !isActive &&
                    "relative after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:origin-bottom-left hover:after:scale-x-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex flex-grow" />

        {/* AÇÕES À DIREITA */}
        <div className="flex-shrink-0 flex items-center space-x-3">
          <ThemeToggle />
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm"
            >
              Logout
            </Button>
          )}
          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] border-l-0 px-0 sm:w-[320px]">
                <SheetHeader className="border-b px-6 pb-4 pt-2">
                  <SheetTitle>
                    <Link href={session ? "/posts" : "/"} className="flex items-center space-x-2">
                      <MountainSnow className="h-6 w-6 text-primary" />
                      <span className="text-lg font-semibold">FindOut</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <nav className="grid gap-3 px-6 py-4">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "block rounded-md px-3 py-2.5 text-base font-medium",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}

                  {session && (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full text-left px-3 py-2.5 text-base text-red-500"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Logout
                    </Button>
                  )}
                </nav>

                <div className="mt-auto px-6 pb-6">
                  <Separator className="mb-4" />
                  <p className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} FindOut
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
