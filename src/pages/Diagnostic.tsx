import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  order_number: number;
}

const diagnosticQuestions: Question[] = [
  {
    id: "1",
    question_text: "¿Cuánta experiencia tienes vendiendo productos o servicios?",
    question_type: "radio",
    options: ["Ninguna experiencia", "He vendido algunas veces", "Vendo regularmente", "Tengo un negocio establecido"],
    order_number: 1,
  },
  {
    id: "2",
    question_text: "¿Tienes un plan escrito de tu negocio?",
    question_type: "radio",
    options: ["No, solo tengo ideas", "Tengo algunas notas", "Tengo un plan básico", "Tengo un plan completo y detallado"],
    order_number: 2,
  },
  {
    id: "3",
    question_text: "¿Conoces quiénes son tus clientes ideales?",
    question_type: "radio",
    options: ["No lo tengo claro", "Tengo una idea general", "Sí, tengo clara mi audiencia", "Sí, y he validado con ellos"],
    order_number: 3,
  },
  {
    id: "4",
    question_text: "¿Llevas un control de tus ingresos y gastos?",
    question_type: "radio",
    options: ["No llevo registro", "Lo hago mentalmente", "Tengo anotaciones básicas", "Uso herramientas de control financiero"],
    order_number: 4,
  },
  {
    id: "5",
    question_text: "¿Usas redes sociales o plataformas digitales para tu negocio?",
    question_type: "radio",
    options: ["No las uso", "Las uso ocasionalmente", "Tengo presencia activa", "Tengo estrategia digital definida"],
    order_number: 5,
  },
];

const Diagnostic = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    checkUser();
  }, [navigate]);

  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [diagnosticQuestions[currentQuestion].id]: value,
    });
  };

  const handleNext = () => {
    if (!answers[diagnosticQuestions[currentQuestion].id]) {
      toast({
        title: "Por favor selecciona una respuesta",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitDiagnostic();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateRoute = () => {
    let score = 0;
    Object.values(answers).forEach((answer) => {
      const index = diagnosticQuestions.find(q => 
        q.options.includes(answer)
      )?.options.indexOf(answer) || 0;
      score += index;
    });
    
    const maxScore = diagnosticQuestions.length * 3;
    const percentage = (score / maxScore) * 100;
    
    // Determinar ruta y etapa del negocio basado en el puntaje
    let route: string;
    let businessStage: string;
    
    if (percentage <= 33) {
      route = "pre";
      businessStage = "idea";
    } else if (percentage <= 66) {
      route = "pre";
      businessStage = "pre-incubacion";
    } else {
      route = "inc";
      businessStage = "incubacion";
    }
    
    return { route, businessStage };
  };

  const submitDiagnostic = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { route, businessStage } = calculateRoute();
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          assigned_route: route,
          business_stage: businessStage 
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      const stageText = businessStage === "idea" 
        ? "Idea" 
        : businessStage === "pre-incubacion" 
        ? "Pre-incubación" 
        : "Incubación";

      toast({
        title: "¡Diagnóstico completado!",
        description: `Has sido asignado a la ruta de ${route === "pre" ? "Pre-incubadora" : "Incubadora"} - Etapa: ${stageText}`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al guardar diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = diagnosticQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Diagnóstico Inicial</h1>
          <p className="text-muted-foreground font-body">
            Responde honestamente para obtener la mejor ruta de aprendizaje
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-lg">
                Pregunta {currentQuestion + 1} de {diagnosticQuestions.length}
              </CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardDescription className="text-base font-body">
              {currentQ.question_text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-body"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={handleNext} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : currentQuestion === diagnosticQuestions.length - 1 ? (
                  "Finalizar"
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Diagnostic;