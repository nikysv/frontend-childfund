import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SoftSkills = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background p-4">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      <h1 className="text-2xl font-bold mb-4">Habilidades Blandas</h1>
      <p className="text-muted-foreground">Próximamente: 12 micro-módulos sobre liderazgo, comunicación y más</p>
    </div>
  );
};

export default SoftSkills;