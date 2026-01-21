import { Home, Mic2, BookOpen, BookText, LogIn, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

interface AppSidebarProps {
  user: any;
  onSignOut: () => void;
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  const menuItems = [
    { title: t("nav.dashboard"), url: "/", icon: Home },
    { title: t("nav.voiceLab"), url: "/pronunciation", icon: Mic2 },
    { title: t("nav.practice"), url: "/practice", icon: BookOpen },
    { title: t("nav.ipaLibrary"), url: "/ipa-library", icon: BookText },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <img src={logo} alt="SpeakRight Logo" className="h-8 w-8 object-contain flex-shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold text-primary whitespace-nowrap">SpeakRight</span>
        )}
      </div>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {user ? (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={onSignOut}
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t("nav.signOut")}</span>}
          </Button>
        ) : (
          <Link to="/auth" className="w-full">
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              className="w-full justify-start gap-3"
            >
              <LogIn className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{t("nav.signIn")}</span>}
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
