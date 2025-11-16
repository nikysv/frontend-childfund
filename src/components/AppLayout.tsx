import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  LogOut,
  User,
  GraduationCap,
  Trophy,
  Calendar,
  Award,
} from "lucide-react";

interface Profile {
  full_name: string;
  assigned_route: string | null;
  current_month: number;
  total_points: number;
  level: number;
}

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (!data.assigned_route) {
          navigate("/diagnostic");
          return;
        }

        setProfile(data);
      } catch (error: any) {
        toast({
          title: "Error al cargar perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  const routeName =
    profile.assigned_route === "pre" ? "Pre-incubadora" : "Incubadora";

  const mainMenuItems = [
    {
      title: "Inicio",
      icon: Target,
      path: "/dashboard",
    },
    {
      title: "Aprendizaje",
      icon: BookOpen,
      path: "/learning",
    },
    {
      title: "Mi Negocio",
      icon: DollarSign,
      path: "/business",
    },
    {
      title: "KPIs",
      icon: TrendingUp,
      path: "/kpis",
    },
    {
      title: "Mentor",
      icon: Users,
      path: "/mentor",
    },
  ];

  const secondaryMenuItems = [
    {
      title: "Comunidad",
      icon: Users,
      path: "/community",
    },
    {
      title: "Biblioteca de Cursos",
      icon: GraduationCap,
      path: "/courses",
    },
    {
      title: "Calendario",
      icon: Calendar,
      path: "/calendar",
    },
    {
      title: "Logros",
      icon: Trophy,
      path: "/achievements",
    },
    {
      title: "Certificados",
      icon: Award,
      path: "/certifications",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center px-4 py-6 bg-white">
            <h2
              className="text-4xl font-bold text-[#1B5E20] drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                letterSpacing: "0.02em",
              }}
            >
              SAO
            </h2>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      tooltip={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Recursos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      tooltip={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/profile")}
                tooltip="Mi Perfil"
              >
                <User className="w-4 h-4" />
                <span>Mi Perfil</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="px-4 py-3 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nivel {profile.level} • {profile.total_points} pts
                </p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-lg font-semibold">
              {mainMenuItems.find((item) => item.path === location.pathname)
                ?.title ||
                secondaryMenuItems.find(
                  (item) => item.path === location.pathname
                )?.title ||
                "Dashboard"}
            </h1>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
