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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Mentor Banner */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mentor" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  M
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tu mentor asignado
                </p>
                <h3 className="text-xl font-bold">Mario González</h3>
                <p className="text-sm text-muted-foreground">
                  Especialista en {routeName}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate("/mentor")}
            >
              <MessageCircle className="h-5 w-5" />
              Hablar con Mentor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle>Tu Progreso</CardTitle>
          <CardDescription>
            Mes {profile.current_month} de {totalMonths} - {routeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={routeProgress} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(routeProgress)}% completado
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/learning")}
        >
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Aprendizaje</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Módulos del mes
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/business")}
        >
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">Mi Negocio</h3>
            <p className="text-xs text-muted-foreground mt-1">ERP Financiero</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/kpis")}
        >
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
            <h3 className="font-semibold">KPIs</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Métricas y alertas
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/mentor")}
        >
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-warning" />
            <h3 className="font-semibold">Mentor</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Asesoría actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Logros y Puntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{profile.level}</p>
              <p className="text-xs text-muted-foreground">Nivel</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {profile.total_points}
              </p>
              <p className="text-xs text-muted-foreground">Puntos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">0</p>
              <p className="text-xs text-muted-foreground">Insignias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
