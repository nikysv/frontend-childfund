import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Award, Star, Target, TrendingUp, BookOpen, Users } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  unlocked: boolean;
  progress: number;
  unlocked_at?: string;
}

const Achievements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    total_points: 0,
    completion_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAchievements();
      fetchStats();
    }
  }, [userId]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);
  };

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/achievements/user/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setAchievements(data.data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/achievements/stats/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "aprendizaje":
        return <BookOpen className="h-4 w-4" />;
      case "ventas":
        return <TrendingUp className="h-4 w-4" />;
      case "comunidad":
        return <Users className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "aprendizaje":
        return "Aprendizaje";
      case "ventas":
        return "Ventas";
      case "comunidad":
        return "Comunidad";
      default:
        return category;
    }
  };

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando logros...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Logros y Recompensas</h1>
        <p className="text-muted-foreground">
          Desbloquea logros completando acciones en la plataforma
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logros Desbloqueados</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.unlocked} / {stats.total}
            </div>
            <Progress value={stats.completion_percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(stats.completion_percentage)}% completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_points}</div>
            <p className="text-xs text-muted-foreground">Puntos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(achievements.map((a) => a.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Categorías diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Logro</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lockedAchievements.length > 0 ? "1" : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Por desbloquear</p>
          </CardContent>
        </Card>
      </div>

      {/* Logros Desbloqueados */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Logros Desbloqueados ({unlockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="border-2 border-yellow-500 bg-yellow-500/5"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {achievement.name}
                          <Badge className="bg-yellow-500 text-yellow-950">
                            Desbloqueado
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(achievement.category)}
                      <span className="text-sm text-muted-foreground">
                        {getCategoryLabel(achievement.category)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      {achievement.points} pts
                    </Badge>
                  </div>
                  {achievement.unlocked_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Desbloqueado:{" "}
                      {new Date(achievement.unlocked_at).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Logros Bloqueados */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-muted-foreground" />
            Logros por Desbloquear ({lockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="opacity-60 border-dashed"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl grayscale opacity-50">
                        {achievement.icon}
                      </div>
                      <div>
                        <CardTitle>{achievement.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-sm text-muted-foreground">
                          {getCategoryLabel(achievement.category)}
                        </span>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {achievement.points} pts
                      </Badge>
                    </div>
                    {achievement.progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Progreso
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {achievement.progress}%
                          </span>
                        </div>
                        <Progress value={achievement.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No hay logros disponibles aún
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Achievements;

