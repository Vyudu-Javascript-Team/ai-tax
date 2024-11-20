import { Providers } from "./providers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationBell } from "@/components/NotificationBell";
import { SkipToContent } from "@/components/SkipToContent";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SkipToContent />
          <header>
            <Navbar as="nav" aria-label="Main navigation" className="max-w-[1280px] mx-auto">
              <NavbarBrand>
                <Link href="/" aria-label="AI Tax Prep Home">
                  <p className="font-bold text-inherit">AI Tax Prep</p>
                </Link>
              </NavbarBrand>
              <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                  <Link href="/dashboard">Dashboard</Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/dashboard/tax-wizard">New Tax Return</Link>
                </NavbarItem>
                <NavbarItem>
                  <Link href="/dashboard/document-upload">Upload Documents</Link>
                </NavbarItem>
              </NavbarContent>
              <NavbarContent justify="end">
                <NavbarItem>
                  <NotificationBell />
                </NavbarItem>
                <NavbarItem>
                  <LanguageSelector />
                </NavbarItem>
                <NavbarItem>
                  <ThemeToggle />
                </NavbarItem>
                <NavbarItem>
                  <Button as={Link} color="primary" href="/auth/signin" variant="flat">
                    Sign In
                  </Button>
                </NavbarItem>
              </NavbarContent>
            </Navbar>
          </header>
          <main id="main-content" className="container mx-auto px-4 py-8 max-w-[1280px]">
            {children}
          </main>
          <footer className="bg-gray-100 py-4 mt-8">
            <div className="container mx-auto px-4 max-w-[1280px]">
              <p>&copy; 2023 AI Tax Prep. All rights reserved.</p>
              <nav className="mt-2">
                <Link href="/privacy-policy" className="mr-4">Privacy Policy</Link>
                <Link href="/terms-of-service">Terms of Service</Link>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}