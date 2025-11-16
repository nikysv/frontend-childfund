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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Datos de ejemplo para el gráfico
const generateSalesData = (period: "week" | "month") => {
  if (period === "week") {
    return [
      { name: "Lun", ventasActuales: 4000, ventasAñoAnterior: 2400 },
      { name: "Mar", ventasActuales: 3000, ventasAñoAnterior: 1398 },
      { name: "Mié", ventasActuales: 2000, ventasAñoAnterior: 9800 },
      { name: "Jue", ventasActuales: 2780, ventasAñoAnterior: 3908 },
      { name: "Vie", ventasActuales: 1890, ventasAñoAnterior: 4800 },
      { name: "Sáb", ventasActuales: 2390, ventasAñoAnterior: 3800 },
      { name: "Dom", ventasActuales: 3490, ventasAñoAnterior: 4300 },
    ];
  } else {
    return [
      { name: "1", ventasActuales: 4000, ventasAñoAnterior: 2400 },
      { name: "2", ventasActuales: 3000, ventasAñoAnterior: 1398 },
      { name: "3", ventasActuales: 2000, ventasAñoAnterior: 9800 },
      { name: "4", ventasActuales: 2780, ventasAñoAnterior: 3908 },
      { name: "5", ventasActuales: 1890, ventasAñoAnterior: 4800 },
      { name: "6", ventasActuales: 2390, ventasAñoAnterior: 3800 },
      { name: "7", ventasActuales: 3490, ventasAñoAnterior: 4300 },
      { name: "8", ventasActuales: 4200, ventasAñoAnterior: 5100 },
      { name: "9", ventasActuales: 3800, ventasAñoAnterior: 4600 },
      { name: "10", ventasActuales: 3200, ventasAñoAnterior: 3900 },
      { name: "11", ventasActuales: 2900, ventasAñoAnterior: 3400 },
      { name: "12", ventasActuales: 3100, ventasAñoAnterior: 3700 },
    ];
  }
};

const Business = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [selectedMonth, setSelectedMonth] = useState("11");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    type: "ingreso",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "efectivo",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, period, selectedMonth]);

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

  const fetchTransactions = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      // Calcular rango de fechas según el período
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date();

      if (period === "week") {
        // Última semana
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
      } else {
        // Mes seleccionado del año actual
        const year = now.getFullYear();
        const month = parseInt(selectedMonth) - 1;
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      }

      const response = await fetch(
        `${API_URL}/api/finance/transactions?user_id=${userId}&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener transacciones");
      }

      const data = await response.json();
      const fetchedTransactions = data.data || [];

      // Guardar transacciones para la tabla
      setTransactions(fetchedTransactions);

      // Procesar datos según el período
      let processedData: any[] = [];

      if (period === "week") {
        // Agrupar por día de la semana
        const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          last7Days.push({
            date: date.toISOString().split("T")[0],
            name: daysOfWeek[date.getDay()],
            ventasActuales: 0,
            ventasAñoAnterior: 0,
          });
        }

        // Sumar transacciones por día
        fetchedTransactions.forEach((t: any) => {
          const tDate = new Date(t.date).toISOString().split("T")[0];
          const dayData = last7Days.find((d) => d.date === tDate);
          if (dayData && t.type === "ingreso") {
            dayData.ventasActuales += t.amount;
          }
        });

        // Simular datos del año anterior (en el futuro, esto vendría de la DB)
        last7Days.forEach((day) => {
          day.ventasAñoAnterior =
            day.ventasActuales * (0.7 + Math.random() * 0.6);
        });

        processedData = last7Days;
      } else {
        // Agrupar por día del mes
        const daysInMonth = endDate.getDate();
        const monthData = [];

        for (let i = 1; i <= daysInMonth; i++) {
          monthData.push({
            name: i.toString(),
            ventasActuales: 0,
            ventasAñoAnterior: 0,
          });
        }

        // Sumar transacciones por día
        fetchedTransactions.forEach((t: any) => {
          const tDate = new Date(t.date);
          const day = tDate.getDate();
          if (t.type === "ingreso" && day <= daysInMonth) {
            monthData[day - 1].ventasActuales += t.amount;
          }
        });

        // Simular datos del año anterior
        monthData.forEach((day) => {
          day.ventasAñoAnterior =
            day.ventasActuales * (0.7 + Math.random() * 0.6);
        });

        processedData = monthData;
      }

      setSalesData(processedData);

      // Procesar datos para Income vs Expense (últimos 6 meses)
      const currentDate = new Date();
      const last6Months = [];
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        last6Months.push({
          month: monthNames[date.getMonth()],
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          Income: 0,
          Expense: 0,
        });
      }

      // Sumar ingresos y egresos por mes
      fetchedTransactions.forEach((t: any) => {
        const tDate = new Date(t.date);
        const monthData = last6Months.find(
          (m) =>
            m.monthIndex === tDate.getMonth() && m.year === tDate.getFullYear()
        );
        if (monthData) {
          if (t.type === "ingreso") {
            monthData.Income += t.amount;
          } else {
            monthData.Expense += t.amount;
          }
        }
      });

      setIncomeVsExpenseData(last6Months);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Usar datos de ejemplo en caso de error
      setSalesData(generateSalesData(period));
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular métricas
  const totalVentasActuales = salesData.reduce(
    (sum, item) => sum + item.ventasActuales,
    0
  );
  const totalVentasAñoAnterior = salesData.reduce(
    (sum, item) => sum + item.ventasAñoAnterior,
    0
  );
  const crecimiento =
    ((totalVentasActuales - totalVentasAñoAnterior) / totalVentasAñoAnterior) *
    100;
  const promedioVentas = totalVentasActuales / salesData.length;

  const handleSubmitTransaction = async () => {
    if (!userId) return;

    // Validar campos
    if (!formData.category || !formData.amount) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/finance/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          type: formData.type,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          payment_method: formData.payment_method,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: `${
            formData.type === "ingreso" ? "Ingreso" : "Egreso"
          } registrado correctamente`,
        });

        // Resetear formulario
        setFormData({
          type: "ingreso",
          category: "",
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          payment_method: "efectivo",
        });

        setIsDialogOpen(false);

        // Recargar transacciones para actualizar el gráfico
        fetchTransactions();
      } else {
        throw new Error(data.error || "Error al registrar transacción");
      }
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
        <div className="animate-pulse">Cargando datos financieros...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Negocio</h1>
          <p className="text-muted-foreground">
            Gestión financiera y análisis de ventas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <DollarSign className="h-4 w-4" />
              Registrar Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Transacción</DialogTitle>
              <DialogDescription>
                Registra tus ingresos y egresos para llevar control de tu
                negocio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Tipo de Transacción */}
              <div className="space-y-2">
                <Label>Tipo de Transacción</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ingreso" id="ingreso" />
                    <Label htmlFor="ingreso" className="cursor-pointer">
                      Ingreso (Venta)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="egreso" id="egreso" />
                    <Label htmlFor="egreso" className="cursor-pointer">
                      Egreso (Gasto)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === "ingreso" ? (
                      <>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="servicios">Servicios</SelectItem>
                        <SelectItem value="otros_ingresos">
                          Otros Ingresos
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="materia_prima">
                          Materia Prima
                        </SelectItem>
                        <SelectItem value="servicios">Servicios</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="alquiler">Alquiler</SelectItem>
                        <SelectItem value="salarios">Salarios</SelectItem>
                        <SelectItem value="otros_gastos">
                          Otros Gastos
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Monto (Bs.) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pago</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="qr">QR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Detalles adicionales..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitTransaction}>
                Guardar Transacción
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs. {totalVentasActuales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "week" ? "Esta semana" : "Este mes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            {crecimiento >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                crecimiento >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {crecimiento >= 0 ? "+" : ""}
              {crecimiento.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. año anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Diario
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs. {Math.round(promedioVentas).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Año Anterior</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs. {totalVentasAñoAnterior.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Mismo período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Ventas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Total Ventas vs Ventas del Año Anterior por{" "}
                {period === "week" ? "Día" : "Mes"}
              </CardTitle>
              <CardDescription>
                Comparación de ventas actuales con el año anterior
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Filtro de Mes (solo visible cuando period es "month") */}
              {period === "month" && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Enero</SelectItem>
                    <SelectItem value="2">Febrero</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Mayo</SelectItem>
                    <SelectItem value="6">Junio</SelectItem>
                    <SelectItem value="7">Julio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Tabs para Semana/Mes */}
              <Tabs
                value={period}
                onValueChange={(value) => setPeriod(value as "week" | "month")}
              >
                <TabsList>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={salesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
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
              <Area
                type="monotone"
                dataKey="ventasActuales"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Total ventas"
              />
              <Area
                type="monotone"
                dataKey="ventasAñoAnterior"
                stroke="#94a3b8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAnterior)"
                name="Ventas del año anterior"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de Transacciones Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>
            Historial de tus últimas transacciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay transacciones registradas</p>
              <p className="text-sm mt-2">
                Comienza registrando tu primera transacción
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Descripción
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="py-4 px-4">
                        <span
                          className={`font-medium ${
                            transaction.type === "ingreso"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "ingreso"
                            ? "Ingreso"
                            : "Egreso"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">
                            {transaction.description || transaction.category}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {transaction.category.replace("_", " ")}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        <span
                          className={
                            transaction.type === "ingreso"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "ingreso" ? "+" : "-"}Bs.{" "}
                          {transaction.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    Ver todas las transacciones
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico Ingresos vs Egresos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs. Egresos</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={incomeVsExpenseData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value) => `Bs.${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(value: any) => [`Bs. ${value.toFixed(2)}`, ""]}
              />
              <Legend />
              <Bar
                dataKey="Income"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Ingresos"
              />
              <Bar
                dataKey="Expense"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                name="Egresos"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Business;
