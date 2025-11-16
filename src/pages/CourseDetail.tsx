import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  FileText,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_number: number;
  completed?: boolean;
  video_url?: string;
  content?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  month_number: number;
  duration_weeks: number;
  order_number: number;
  sections: Section[];
  progress: number;
  completed_sections: number;
  total_sections: number;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Obtener detalles del curso
      const courseResponse = await fetch(
        `${API_URL}/api/learning/courses/${courseId}`
      );
      const { data: courseData } = await courseResponse.json();

      // Obtener secciones del curso
      const sectionsResponse = await fetch(
        `${API_URL}/api/learning/courses/${courseId}/sections`
      );
      const { data: sections } = await sectionsResponse.json();

      // Obtener progreso del usuario
      const progressResponse = await fetch(
        `${API_URL}/api/learning/progress/${user.id}/course/${courseId}`
      );
      const { data: progressData } = await progressResponse.json();

      // Mapear secciones con progreso
      const sectionsWithProgress = (sections || []).map((section: any) => {
        const sectionProgress = progressData?.sections_progress?.find(
          (sp: any) => sp.section_id === section.id
        );

        return {
          ...section,
          completed: sectionProgress?.completed || false,
        };
      });

      const totalSections = sectionsWithProgress.length;
      const completedSections = sectionsWithProgress.filter(
        (s) => s.completed
      ).length;
      const progressPercentage =
        totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

      setCourse({
        ...courseData,
        sections: sectionsWithProgress,
        total_sections: totalSections,
        completed_sections: completedSections,
        progress: progressPercentage,
      });

      // Establecer la primera sección como actual
      if (sectionsWithProgress.length > 0) {
        setCurrentSection(sectionsWithProgress[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error al cargar el curso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSectionUnlocked = (sectionIndex: number) => {
    if (sectionIndex === 0) return true;
    const previousSection = course?.sections[sectionIndex - 1];
    return previousSection?.completed || false;
  };

  const handleSectionClick = (section: Section, index: number) => {
    if (!isSectionUnlocked(index)) {
      toast({
        title: "Sección bloqueada",
        description: "Completa la sección anterior para continuar",
        variant: "destructive",
      });
      return;
    }
    setCurrentSection(section);
  };

  const checkAchievements = async (type: string, value: string | null = null) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    try {
      const response = await fetch(
        `${API_URL}/api/achievements/check/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            value,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.unlocked && data.unlocked.length > 0) {
          data.unlocked.forEach((achievement: any) => {
            toast({
              title: "🎉 ¡Logro Desbloqueado!",
              description: `${achievement.icon} ${achievement.name} - ${achievement.points} puntos`,
              duration: 5000,
            });
          });
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const markSectionAsCompleted = async (sectionId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${API_URL}/api/learning/progress/section`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          section_id: sectionId,
          completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al marcar sección como completada");
      }

      // Recargar datos del curso
      await fetchCourseData();

      // Verificar logros
      await checkAchievements("course_completed", courseId || null);
      await checkAchievements("first_course_completed", null);

      toast({
        title: "Sección completada",
        description: "¡Buen trabajo! Continúa con la siguiente sección.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeModule = async () => {
    if (!course) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      // Marcar todas las secciones como completadas
      for (const section of course.sections) {
        if (!section.completed) {
          await fetch(`${API_URL}/api/learning/progress/section`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              section_id: section.id,
              completed: true,
            }),
          });
        }
      }

      // Recargar datos
      await fetchCourseData();

      // Verificar logros
      await checkAchievements("course_completed", courseId || null);
      await checkAchievements("first_course_completed", null);

      toast({
        title: "¡Módulo Completado!",
        description: "Has completado todos los módulos. ¡Felicitaciones!",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando curso...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Curso no encontrado</p>
            <Button onClick={() => navigate("/learning")} className="mt-4">
              Volver a Mis Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/learning")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Current Lecture */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Módulo {course.order_number}: {course.title}
              </CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Progreso del módulo</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(course.progress)}%
                </span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Current Lecture Display */}
          {currentSection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentSection.title}
                  </CardTitle>
                  {currentSection.completed && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Completado
                    </span>
                  )}
                </div>
                <CardDescription>{currentSection.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <PlayCircle className="h-16 w-16 mx-auto text-primary" />
                    <div>
                      <p className="font-semibold text-lg">
                        {currentSection.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duración: {currentSection.duration_minutes} minutos
                      </p>
                    </div>
                    <Button size="lg" className="gap-2">
                      <PlayCircle className="h-5 w-5" />
                      Iniciar Lección
                    </Button>
                  </div>
                </div>

                {/* Attachments */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Adjuntos</h4>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Material del curso
                  </Button>
                </div>

                {/* Questions & Video Progress (Placeholder) */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Preguntas:</p>
                    <p className="text-lg font-semibold">0 / 8 (0 correctas)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Video:</p>
                    <p className="text-lg font-semibold">0% visto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Upcoming Lectures */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Secciones ({course.completed_sections}/{course.total_sections})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.sections.map((section, index) => {
                const isUnlocked = isSectionUnlocked(index);
                const isCurrent = currentSection?.id === section.id;

                return (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-primary/10 border-primary"
                        : isUnlocked
                        ? "hover:bg-muted cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => handleSectionClick(section, index)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                          section.completed
                            ? "bg-green-600 text-white"
                            : isUnlocked
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {section.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isUnlocked ? (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm ${
                            !isUnlocked && "text-muted-foreground"
                          }`}
                        >
                          {section.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {section.duration_minutes} min
                          </span>
                        </div>
                        {!isUnlocked && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Completa la sección anterior
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

