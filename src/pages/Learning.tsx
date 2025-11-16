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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Lock, CheckCircle2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  month_number: number;
  duration_weeks: number;
  order_number: number;
  sections?: Section[];
  progress?: number;
  completed_sections?: number;
  total_sections?: number;
}

interface Section {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_number: number;
  completed?: boolean;
}

const Learning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // URL del backend Flask
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Obtener perfil del usuario desde Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("assigned_route")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Obtener cursos desde el backend Flask
      const coursesResponse = await fetch(
        `${API_URL}/api/learning/courses?route_type=${profile.assigned_route}`
      );

      if (!coursesResponse.ok) {
        throw new Error("Error al obtener cursos del servidor");
      }

      const { data: coursesData } = await coursesResponse.json();

      // Obtener secciones y progreso para cada curso
      const coursesWithSections = await Promise.all(
        (coursesData || []).map(async (course: any) => {
          // Obtener secciones del curso
          const sectionsResponse = await fetch(
            `${API_URL}/api/learning/courses/${course.id}/sections`
          );
          const { data: sections } = await sectionsResponse.json();

          // Obtener progreso del usuario en este curso
          const progressResponse = await fetch(
            `${API_URL}/api/learning/progress/${user.id}/course/${course.id}`
          );
          const { data: progressData } = await progressResponse.json();

          // Mapear secciones con su progreso
          const sectionsWithProgress = (sections || []).map((section: any) => {
            const sectionProgress = progressData?.sections_progress?.find(
              (sp: any) => sp.section_id === section.id
            );

            return {
              id: section.id,
              title: section.title,
              description: section.description,
              duration_minutes: section.duration_minutes,
              order_number: section.order_number,
              completed: sectionProgress?.completed || false,
            };
          });

          const totalSections = sectionsWithProgress.length;
          const completedSections = sectionsWithProgress.filter(
            (s) => s.completed
          ).length;
          const progressPercentage =
            totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            month_number: course.month_number,
            duration_weeks: course.duration_weeks,
            order_number: course.order_number,
            sections: sectionsWithProgress,
            total_sections: totalSections,
            completed_sections: completedSections,
            progress: progressPercentage,
          };
        })
      );

      setCourses(coursesWithSections);
    } catch (error: any) {
      toast({
        title: "Error al cargar cursos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseClick = (course: Course, isLocked: boolean) => {
    if (isLocked) {
      toast({
        title: "Módulo bloqueado",
        description:
          "Completa el módulo anterior para desbloquear este contenido",
        variant: "destructive",
      });
      return;
    }
    // Navegar a la vista detallada del curso
    navigate(`/learning/${course.id}`);
  };

  const isCourseUnlocked = (course: Course) => {
    // El primer módulo siempre está desbloqueado
    if (course.order_number === 1) return true;

    // Buscar el curso anterior por order_number (no por índice del array)
    const previousCourse = courses.find(
      (c) => c.order_number === course.order_number - 1
    );

    // El curso está desbloqueado si el anterior está completado al 100%
    return previousCourse && previousCourse.progress === 100;
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalDuration = (sections: Section[] = []) => {
    const totalMinutes = sections.reduce(
      (sum, section) => sum + section.duration_minutes,
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8 min-h-[400px]">
        <div className="animate-pulse text-sm sm:text-base">Cargando cursos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Mis Cursos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explora y completa los módulos de tu ruta de aprendizaje
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
        />
        <BookOpen className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Courses List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-6 sm:py-8 text-center text-muted-foreground text-sm sm:text-base">
              No se encontraron cursos
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => {
            const isUnlocked = isCourseUnlocked(course);
            const isCompleted = course.progress === 100;

            return (
              <Card
                key={course.id}
                className={`transition-all active:scale-[0.98] ${
                  isUnlocked
                    ? "hover:shadow-md cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => handleCourseClick(course, !isUnlocked)}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Icono de estado */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      ) : isUnlocked ? (
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-base sm:text-lg">
                        <span className="text-primary font-semibold text-sm sm:text-base">
                          Módulo {course.order_number}:
                        </span>
                        <span className="break-words">{course.title}</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Información del curso */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>
                        {course.total_sections || 0}{" "}
                        {course.total_sections === 1 ? "sección" : "secciones"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{getTotalDuration(course.sections)}</span>
                    </div>
                  </div>

                  {/* Progreso */}
                  {isUnlocked && (
                    <div className="mt-3 sm:mt-4">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium">Progreso</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {Math.round(course.progress || 0)}%
                        </span>
                      </div>
                      <Progress value={course.progress || 0} className="h-1.5 sm:h-2" />
                    </div>
                  )}

                  {/* Mensaje de bloqueado */}
                  {!isUnlocked && (
                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-muted rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Completa el módulo anterior para desbloquear</span>
                      </p>
                    </div>
                  )}
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Learning;
