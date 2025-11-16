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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const KPIs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalVentas: 0,
    ventasAnoAnterior: 0,
    diferencia: 0,
    variacion: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
  const [monthlyVariation, setMonthlyVariation] = useState<any[]>([]);
  const [semesterData, setSemesterData] = useState<any[]>([]);

  // Generar lista de años disponibles (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchKPIData();
    }
  }, [userId, selectedYear]);

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

  const fetchKPIData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const currentYear = selectedYear;
      const previousYear = selectedYear - 1;

      // Obtener transacciones del año actual
      const startCurrentYear = new Date(currentYear, 0, 1);
      const endCurrentYear = new Date(currentYear, 11, 31, 23, 59, 59);

      // Obtener transacciones del año anterior
      const startPreviousYear = new Date(previousYear, 0, 1);
      const endPreviousYear = new Date(previousYear, 11, 31, 23, 59, 59);

      const [currentYearRes, previousYearRes] = await Promise.all([
        fetch(
          `${API_URL}/api/finance/transactions?user_id=${userId}&start_date=${startCurrentYear.toISOString()}&end_date=${endCurrentYear.toISOString()}`
        ),
        fetch(
          `${API_URL}/api/finance/transactions?user_id=${userId}&start_date=${startPreviousYear.toISOString()}&end_date=${endPreviousYear.toISOString()}`
        ),
      ]);

      const currentYearData = await currentYearRes.json();
      const previousYearData = await previousYearRes.json();

      const currentTransactions = currentYearData.data || [];
      const previousTransactions = previousYearData.data || [];

      // Filtrar solo ingresos
      const currentIngresos = currentTransactions.filter(
        (t: any) => t.type === "ingreso"
      );
      const previousIngresos = previousTransactions.filter(
        (t: any) => t.type === "ingreso"
      );

      // Calcular KPIs
      const totalVentas = currentIngresos.reduce(
        (sum: number, t: any) => sum + t.amount,
        0
      );
      const ventasAnoAnterior = previousIngresos.reduce(
        (sum: number, t: any) => sum + t.amount,
        0
      );
      const diferencia = totalVentas - ventasAnoAnterior;
      const variacion =
        ventasAnoAnterior > 0
          ? parseFloat(((diferencia / ventasAnoAnterior) * 100).toFixed(2))
          : 0;

      setKpis({
        totalVentas,
        ventasAnoAnterior,
        diferencia,
        variacion,
      });

      // Procesar datos mensuales
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const monthly = [];
      for (let i = 0; i < 12; i++) {
        const currentMonthIngresos = currentIngresos.filter((t: any) => {
          const date = new Date(t.date);
          return date.getMonth() === i && date.getFullYear() === currentYear;
        });

        const previousMonthIngresos = previousIngresos.filter((t: any) => {
          const date = new Date(t.date);
          return date.getMonth() === i && date.getFullYear() === previousYear;
        });

        const currentTotal = currentMonthIngresos.reduce(
          (sum: number, t: any) => sum + t.amount,
          0
        );
        const previousTotal = previousMonthIngresos.reduce(
          (sum: number, t: any) => sum + t.amount,
          0
        );

        monthly.push({
          mes: monthNames[i],
          mesNumero: i + 1,
          ventasActuales: currentTotal,
          ventasAnoAnterior: previousTotal,
        });
      }

      setMonthlyData(monthly);

      // Calcular variación mensual
      const monthlyVar = monthly.map((m) => ({
        mes: m.mes,
        mesNumero: m.mesNumero,
        variacion:
          m.ventasAnoAnterior > 0
            ? ((m.ventasActuales - m.ventasAnoAnterior) / m.ventasAnoAnterior) *
              100
            : 0,
      }));

      setMonthlyVariation(monthlyVar);

      // Calcular datos por trimestre
      const quarters = [
        { name: "T1", months: [0, 1, 2] },
        { name: "T2", months: [3, 4, 5] },
        { name: "T3", months: [6, 7, 8] },
        { name: "T4", months: [9, 10, 11] },
      ];

      const quarterly = quarters.map((q) => {
        const currentQuarterTotal = monthly
          .filter((m) => q.months.includes(m.mesNumero - 1))
          .reduce((sum, m) => sum + m.ventasActuales, 0);

        const previousQuarterTotal = monthly
          .filter((m) => q.months.includes(m.mesNumero - 1))
          .reduce((sum, m) => sum + m.ventasAnoAnterior, 0);

        return {
          trimestre: q.name,
          diferencia: currentQuarterTotal - previousQuarterTotal,
        };
      });

      setQuarterlyData(quarterly);

      // Calcular datos por semestre
      const semesters = [
        { name: "Sem1", months: [0, 1, 2, 3, 4, 5] },
        { name: "Sem2", months: [6, 7, 8, 9, 10, 11] },
      ];

      const semester = semesters.map((s) => {
        const currentSemesterTotal = monthly
          .filter((m) => s.months.includes(m.mesNumero - 1))
          .reduce((sum, m) => sum + m.ventasActuales, 0);

        const previousSemesterTotal = monthly
          .filter((m) => s.months.includes(m.mesNumero - 1))
          .reduce((sum, m) => sum + m.ventasAnoAnterior, 0);

        return {
          semestre: s.name,
          diferencia: currentSemesterTotal - previousSemesterTotal,
        };
      });

      setSemesterData(semester);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando KPIs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KPIs y Métricas</h1>
          <p className="text-muted-foreground">
            Indicadores clave de rendimiento de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Año:
          </label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {kpis.totalVentas.toLocaleString("es-BO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas del Año Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {kpis.ventasAnoAnterior.toLocaleString("es-BO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diferencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                kpis.diferencia >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {kpis.diferencia >= 0 ? "+" : ""}
              {kpis.diferencia.toLocaleString("es-BO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variación de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {kpis.variacion >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
              <p
                className={`text-3xl font-bold ${
                  kpis.variacion >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {kpis.variacion >= 0 ? "+" : ""}
                {kpis.variacion.toFixed(2)} %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Líneas: Total Ventas vs Ventas del Año Anterior */}
        <Card>
          <CardHeader>
            <CardTitle>
              Total Ventas vs Ventas del Año Anterior por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="mes"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventasActuales"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="Total ventas"
                />
                <Line
                  type="monotone"
                  dataKey="ventasAnoAnterior"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  name="Ventas del año anterior"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras: Diferencia por Trimestre */}
        <Card>
          <CardHeader>
            <CardTitle>
              Diferencia de Ventas por Trimestre (año anterior)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="trimestre"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="diferencia" radius={[8, 8, 0, 0]}>
                  {quarterlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.diferencia >= 0 ? "#60a5fa" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras: Variación Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Variación de Ventas por Mes del Año Anterior</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVariation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="mes"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                  formatter={(value: any) => [`${value.toFixed(2)}%`, ""]}
                />
                <Bar dataKey="variacion" radius={[8, 8, 0, 0]}>
                  {monthlyVariation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.variacion >= 0 ? "#60a5fa" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras: Diferencia por Semestre */}
        <Card>
          <CardHeader>
            <CardTitle>
              Diferencia de Ventas por Semestre (año anterior)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={semesterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="semestre"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="diferencia" radius={[8, 8, 0, 0]}>
                  {semesterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.diferencia >= 0 ? "#60a5fa" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPIs;
