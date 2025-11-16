import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Video,
  MapPin,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  category: string;
  image: string;
  videoUrl?: string;
  type: "curso" | "video" | "directorio";
}

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const resources: Resource[] = [
    {
      id: "1",
      title: "Alfabetización Digital Básica",
      description:
        "Aprende a usar WhatsApp Business, Canva y CapCut para promocionar tu negocio. Curso completo paso a paso.",
      level: "Básico",
      category: "digital",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
      type: "curso",
    },
    {
      id: "2",
      title: "Gestión del Negocio Familiar",
      description:
        "Guía completa para administrar un negocio familiar: roles, responsabilidades, finanzas y comunicación.",
      level: "Básico",
      category: "gestion",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
      type: "curso",
    },
    {
      id: "3",
      title: "Ventas Locales y Ferias en Bolivia",
      description:
        "Estrategias para vender en ferias locales, eventos y mercados. Tips específicos para el contexto boliviano.",
      level: "Intermedio",
      category: "ventas",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      type: "curso",
    },
    {
      id: "4",
      title: "Micro-ahorro y Pasanaku Digital",
      description:
        "Aprende a ahorrar y gestionar tus finanzas usando métodos tradicionales bolivianos adaptados a herramientas digitales.",
      level: "Básico",
      category: "finanzas",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
      type: "curso",
    },
    {
      id: "5",
      title: "Historias Reales de Éxito",
      description:
        "Videos inspiradores de jóvenes emprendedores de El Alto, Plan 3000 y otras zonas. Aprende de sus experiencias.",
      level: "Básico",
      category: "inspiracion",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      videoUrl: "#",
      type: "video",
    },
    {
      id: "6",
      title: "Directorio de Recursos Locales",
      description:
        "Encuentra ferias, proveedores baratos, trámites gratis organizados por ciudad. Información actualizada constantemente.",
      level: "Básico",
      category: "directorio",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      type: "directorio",
    },
  ];

  const categories = [
    { id: "all", label: "Todos", icon: BookOpen },
    { id: "digital", label: "Digital", icon: PlayCircle },
    { id: "gestion", label: "Gestión", icon: TrendingUp },
    { id: "ventas", label: "Ventas", icon: DollarSign },
    { id: "finanzas", label: "Finanzas", icon: DollarSign },
    { id: "inspiracion", label: "Inspiración", icon: Video },
    { id: "directorio", label: "Directorio", icon: MapPin },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const handleView = (resource: Resource) => {
    if (resource.type === "video") {
      // Abrir video
      console.log(`Reproduciendo video: ${resource.title}`);
    } else if (resource.type === "directorio") {
      // Abrir directorio
      console.log(`Abriendo directorio: ${resource.title}`);
    } else {
      // Abrir curso
      console.log(`Abriendo curso: ${resource.title}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Biblioteca de Cursos</h1>
        <p className="text-muted-foreground">
          Recursos extra descargables para complementar tu aprendizaje
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleView(resource)}
          >
            {/* Imagen */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <img
                src={resource.image}
                alt={resource.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <Badge
                  className={`bg-background/80 backdrop-blur-sm ${
                    resource.level === "Básico"
                      ? "bg-yellow-500 text-yellow-950"
                      : resource.level === "Intermedio"
                      ? "bg-green-500 text-green-950"
                      : "bg-red-500 text-red-950"
                  }`}
                >
                  {resource.level}
                </Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-16 w-16 text-white" />
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {resource.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(resource);
                }}
              >
                {resource.type === "video" ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Ver Video
                  </>
                ) : resource.type === "directorio" ? (
                  <>
                    <MapPin className="h-4 w-4" />
                    Explorar
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Abrir Curso
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay recursos */}
      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay recursos disponibles en esta categoría
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Courses;
