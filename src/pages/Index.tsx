import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1
              className="text-5xl md:text-7xl font-bold text-[#1B5E20] drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)] mb-4"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                letterSpacing: "0.02em",
              }}
            >
              SAO
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Sistema de Acompañamiento y Orientación
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto mb-8">
            Tu plataforma para transformar ideas en negocios exitosos.
            Acompañamiento personalizado para jóvenes emprendedores de Bolivia.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="font-semibold"
            >
              Comenzar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Ruta Personalizada</h3>
            <p className="text-sm text-muted-foreground font-body">
              Pre-incubadora o Incubadora según tu nivel de experiencia
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">ERP Financiero</h3>
            <p className="text-sm text-muted-foreground font-body">
              Controla ingresos, gastos y KPIs de tu negocio
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Mentorías</h3>
            <p className="text-sm text-muted-foreground font-body">
              Acceso a mentores expertos y comunidad emprendedora
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">Gamificación</h3>
            <p className="text-sm text-muted-foreground font-body">
              Gana puntos, insignias y certificados por tus logros
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-primary-foreground">
          <h3 className="text-2xl font-bold mb-4">¿Listo para emprender?</h3>
          <p className="text-lg mb-6 opacity-90">
            Únete a cientos de jóvenes emprendedores que ya están construyendo
            su futuro
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
          >
            Crear Cuenta Gratis
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>ChildFund Bolivia - InnovaHack 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
