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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Edit,
  Save,
  X,
  Trophy,
  DollarSign,
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  business_stage: string;
  assigned_route: string | null;
  current_month: number;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

interface Stats {
  total_achievements: number;
  unlocked_achievements: number;
  total_points: number;
  completed_courses: number;
  total_courses: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    business_name: "",
    bio: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile?.id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        navigate("/auth");
        return;
      }

      setUser(authUser);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        business_name: data.business_name || "",
        bio: data.bio || "",
      });
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

  const fetchStats = async () => {
    if (!profile?.id) return;

    try {
      // Obtener estadísticas de logros
      const achievementsResponse = await fetch(
        `${API_URL}/api/achievements/stats/${profile.id}`
      );
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setStats({
          total_achievements: achievementsData.data.total_achievements || 0,
          unlocked_achievements: achievementsData.data.unlocked_achievements || 0,
          total_points: achievementsData.data.total_points || 0,
          completed_courses: 0, // Se calculará después
          total_courses: 0, // Se calculará después
        });
      }

      // Obtener progreso de cursos
      const progressResponse = await fetch(
        `${API_URL}/api/learning/progress/${profile.id}`
      );
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        const courses = progressData.data?.courses || [];
        const completed = courses.filter(
          (c: any) => c.progress_percentage >= 100
        ).length;
        setStats((prev) => ({
          ...prev!,
          completed_courses: completed,
          total_courses: courses.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          business_name: editForm.business_name,
          bio: editForm.bio,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        ...editForm,
      });
      setIsEditing(false);

      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRouteName = (route: string | null) => {
    if (!route) return "No asignada";
    if (route === "pre") return "Pre-Incubadora";
    if (route === "inc") return "Incubadora";
    return route;
  };

  const getStageName = (stage: string) => {
    const stages: { [key: string]: string } = {
      idea: "Idea",
      "pre-incubacion": "Pre-Incubación",
      incubacion: "Incubación",
      pendiente: "Pendiente",
    };
    return stages[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      idea: "bg-blue-500",
      "pre-incubacion": "bg-yellow-500",
      incubacion: "bg-green-500",
      pendiente: "bg-gray-500",
    };
    return colors[stage] || "bg-gray-500";
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y revisa tu progreso
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Tu información de contacto y perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      El correo no se puede cambiar desde aquí
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="+591 7XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nombre del Negocio</Label>
                    <Input
                      id="business_name"
                      value={editForm.business_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          business_name: e.target.value,
                        })
                      }
                      placeholder="Nombre de tu emprendimiento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      placeholder="Cuéntanos sobre ti y tu emprendimiento"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          full_name: profile.full_name || "",
                          phone: profile.phone || "",
                          business_name: profile.business_name || "",
                          bio: profile.bio || "",
                        });
                      }}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {profile.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                      {profile.business_name && (
                        <p className="text-muted-foreground">
                          {profile.business_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Correo</p>
                        <p className="font-medium">{user?.email || "No disponible"}</p>
                      </div>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    {profile.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Miembro desde
                          </p>
                          <p className="font-medium">
                            {new Date(profile.created_at).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {profile.bio && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Biografía
                        </p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Estado del Emprendimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Emprendimiento</CardTitle>
              <CardDescription>
                Información sobre tu ruta y progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ruta Asignada</p>
                  <p className="text-lg font-semibold">
                    {getRouteName(profile.assigned_route)}
                  </p>
                </div>
                <Badge
                  className={getStageColor(profile.business_stage)}
                  variant="default"
                >
                  {getStageName(profile.business_stage)}
                </Badge>
              </div>
              {profile.assigned_route && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mes Actual
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(profile.current_month / 6) * 100}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      Mes {profile.current_month}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas y Logros */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Logros</span>
                    </div>
                    <span className="font-semibold">
                      {stats.unlocked_achievements}/{stats.total_achievements}
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.total_achievements > 0
                        ? (stats.unlocked_achievements /
                            stats.total_achievements) *
                          100
                        : 0
                    }
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-sm">Puntos</span>
                    </div>
                    <span className="font-semibold">{stats.total_points}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Cursos Completados</span>
                    </div>
                    <span className="font-semibold">
                      {stats.completed_courses}/{stats.total_courses}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/achievements")}
              >
                <Trophy className="h-4 w-4" />
                Ver Mis Logros
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/learning")}
              >
                <BookOpen className="h-4 w-4" />
                Mis Cursos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/business")}
              >
                <DollarSign className="h-4 w-4" />
                Mi Negocio
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/calendar")}
              >
                <Calendar className="h-4 w-4" />
                Mi Calendario
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
