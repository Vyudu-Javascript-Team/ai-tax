import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  Upload, 
  User, 
  LogOut, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  PieChart, 
  FileCompare, 
  Briefcase,
  Search,
  Smartphone,
  Video,
  BookOpen,
  Award,
  Share2,
  Users,
  HelpCircle,
  Settings
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/tax-return/new", label: "New Tax Return", icon: FileText },
  { href: "/dashboard/document-upload", label: "Upload Documents", icon: Upload },
  { href: "/dashboard/financial-import", label: "Import Financial Data", icon: DollarSign },
  { href: "/dashboard/tax-calendar", label: "Tax Calendar", icon: Calendar },
  { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/dashboard/tax-savings", label: "Tax Savings", icon: PieChart },
  { href: "/dashboard/tax-comparison", label: "Tax Comparison", icon: FileCompare },
  { href: "/dashboard/expert-consultation", label: "Expert Consultation", icon: Briefcase },
  { href: "/dashboard/mobile-scanner", label: "Mobile Scanner", icon: Smartphone },
  { href: "/dashboard/video-tutorials", label: "Video Tutorials", icon: Video },
  { href: "/dashboard/tax-education", label: "Tax Education", icon: BookOpen },
  { href: "/dashboard/achievements", label: "Achievements", icon: Award },
  { href: "/dashboard/referrals", label: "Referrals", icon: Share2 },
  { href: "/dashboard/team", label: "Team Management", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/support", label: "Support", icon: HelpCircle },
];

const adminNavItems = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: Home },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/tax-returns", label: "Tax Returns", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: PieChart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-100 h-full p-4 flex flex-col">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <nav className="space-y-2 flex-grow overflow-y-auto">
        {filteredNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-gray-200"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 mt-4"
        onClick={() => signOut()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}