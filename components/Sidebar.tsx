import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Calculator,
  FileText,
  BarChart2,
  Book,
  MessageSquare,
  Settings,
  HelpCircle,
  CompareArrowsIcon,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Home className="mr-2 h-4 w-4" />
                Overview
              </Button>
            </Link>
            <Link href="/dashboard/tax-wizard">
              <Button
                variant={pathname === "/dashboard/tax-wizard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Tax Wizard
              </Button>
            </Link>
            <Link href="/dashboard/tax-comparison">
              <Button
                variant={pathname === "/dashboard/tax-comparison" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <CompareArrowsIcon className="mr-2 h-4 w-4" />
                Tax Comparison
              </Button>
            </Link>
            <Link href="/dashboard/tax-library">
              <Button
                variant={pathname === "/dashboard/tax-library" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Book className="mr-2 h-4 w-4" />
                Tax Library
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button
                variant={pathname === "/dashboard/analytics" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/dashboard/team">
              <Button
                variant={pathname === "/dashboard/team" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Team
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Support
          </h2>
          <div className="space-y-1">
            <Link href="/support">
              <Button
                variant={pathname === "/support" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Support
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant={pathname === "/settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/help">
              <Button
                variant={pathname === "/help" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}