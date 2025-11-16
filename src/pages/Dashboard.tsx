import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  TrendingUp,
  Award,
  DollarSign,
  Users,
  MessageCircle,
} from "lucide-react";

interface Profile {
  full_name: string;
  assigned_route: string | null;
  current_month: number;
  total_points: number;
  level: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
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

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  const routeName =
    profile.assigned_route === "pre" ? "Pre-incubadora" : "Incubadora";
  const totalMonths = profile.assigned_route === "pre" ? 6 : 4;
  const routeProgress = (profile.current_month / totalMonths) * 100;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Mentor Banner */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary flex-shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mentor" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                  M
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tu mentor asignado
                </p>
                <h3 className="text-lg sm:text-xl font-bold truncate">Mario González</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Especialista en {routeName}
                </p>
              </div>
            </div>
            <Button
              size="default"
              className="gap-2 w-full sm:w-auto text-sm sm:text-base"
              onClick={() => navigate("/mentor")}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Hablar con Mentor</span>
              <span className="sm:hidden">Mentor</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Tu Progreso</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Mes {profile.current_month} de {totalMonths} - {routeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={routeProgress} className="mb-2 h-2 sm:h-2.5" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {Math.round(routeProgress)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
          onClick={() => navigate("/learning")}
        >
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base">Aprendizaje</h3>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
              Módulos del mes
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
          onClick={() => navigate("/business")}
        >
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 text-accent" />
            <h3 className="font-semibold text-sm sm:text-base">Mi Negocio</h3>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">ERP Financiero</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
          onClick={() => navigate("/kpis")}
        >
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 text-success" />
            <h3 className="font-semibold text-sm sm:text-base">KPIs</h3>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
              Métricas y alertas
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
          onClick={() => navigate("/mentor")}
        >
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 text-warning" />
            <h3 className="font-semibold text-sm sm:text-base">Mentor</h3>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
              Asesoría actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Stats */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            Logros y Puntos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="p-2 sm:p-0">
              <p className="text-xl sm:text-2xl font-bold text-primary">{profile.level}</p>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Nivel</p>
            </div>
            <div className="p-2 sm:p-0">
              <p className="text-xl sm:text-2xl font-bold text-accent">
                {profile.total_points}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Puntos</p>
            </div>
            <div className="p-2 sm:p-0">
              <p className="text-xl sm:text-2xl font-bold text-success">0</p>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Insignias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
