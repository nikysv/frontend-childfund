import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { auth, googleProvider } from "@/integrations/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { syncFirebaseUserToSupabase } from "@/integrations/firebase/supabase-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Manejar callback de Google OAuth
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get("code");
      const googleCallback = searchParams.get("google_callback");

      if (googleCallback && code) {
        setIsLoading(true);
        try {
          // Intercambiar el código por una sesión
          const {
            data: { session },
            error,
          } = await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;

          if (session) {
            // Obtener el perfil del usuario
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

              if (profile) {
                const hasRoute = profile.assigned_route !== null;

                if (hasRoute) {
                  toast({
                    title: "¡Bienvenido de vuelta!",
                    description: "Iniciando sesión...",
                  });
                  navigate("/dashboard");
                } else {
                  toast({
                    title: "¡Bienvenido!",
                    description: "Completa tu perfil para continuar...",
                  });
                  navigate("/diagnostic");
                }
              } else {
                navigate("/diagnostic");
              }
            }
          }
        } catch (error: any) {
          console.error("Error en callback de Google:", error);
          toast({
            title: "Error",
            description: "No se pudo completar el inicio de sesión",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, toast]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    full_name: "",
    age: "",
    city: "",
    business_sector: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Iniciando sesión...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      if (
        !signupData.email ||
        !signupData.password ||
        !signupData.full_name ||
        !signupData.age ||
        !signupData.city ||
        !signupData.business_sector
      ) {
        throw new Error("Por favor, completa todos los campos");
      }

      const age = parseInt(signupData.age);
      if (isNaN(age) || age < 16 || age > 24) {
        throw new Error("Debes tener entre 16 y 24 años para registrarte");
      }

      if (signupData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      // Preparar datos para el perfil
      // Usar 'idea' temporalmente porque el constraint puede no permitir 'pendiente'
      const profileData = {
        full_name: signupData.full_name.trim(),
        age: age.toString(),
        city: signupData.city.trim(),
        business_sector: signupData.business_sector.trim(),
        business_stage: "idea", // Temporal, se actualizará después del diagnóstico
      };

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim(),
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: profileData,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Crear el perfil manualmente si el trigger falla
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: signupData.full_name.trim(),
              age: age,
              city: signupData.city.trim(),
              business_sector: signupData.business_sector.trim(),
              business_stage: "idea", // Temporal, se actualizará después del diagnóstico
            });

          if (profileError) {
            console.warn(
              "Error creando perfil (puede que ya exista):",
              profileError
            );
            // No lanzar error, el perfil puede haber sido creado por el trigger
          }
        } catch (profileErr) {
          console.warn("Error al crear perfil manualmente:", profileErr);
          // Continuar de todas formas
        }

        toast({
          title: "¡Registro exitoso!",
          description: "Redirigiendo al diagnóstico inicial...",
        });
        navigate("/diagnostic");
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      toast({
        title: "Error al registrarse",
        description:
          error.message || "Ocurrió un error. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando autenticación con Google usando Firebase...");

      // Usar Firebase directamente (Supabase OAuth no está configurado)
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        throw new Error("No se pudo obtener el email de Google");
      }

      console.log("Usuario autenticado en Firebase:", firebaseUser.email);

      // Sincronizar usuario con Supabase
      console.log("Sincronizando con Supabase...");
      const syncResult = await syncFirebaseUserToSupabase(firebaseUser);
      console.log("Sincronización completada:", syncResult);

      // Guardar información de Firebase para uso posterior
      localStorage.setItem(
        "firebase_authenticated",
        JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        })
      );

      // Verificar si hay sesión activa en Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Determinar si el usuario tiene ruta asignada
      const hasRoute = syncResult.profile?.assigned_route !== null;
      const usingFirebaseAuth = (syncResult as any)?.usingFirebaseAuth === true;

      if (!session || usingFirebaseAuth) {
        // No hay sesión en Supabase, pero el usuario está autenticado con Firebase
        // Permitir continuar usando Firebase
        console.log(
          "Usuario autenticado con Firebase, continuando sin sesión de Supabase..."
        );

        // Si el usuario ya existe pero no tenemos su perfil completo, intentar buscarlo
        if (usingFirebaseAuth && !syncResult.userId && firebaseUser.email) {
          // Intentar buscar el perfil usando el email desde una función de base de datos
          // Por ahora, simplemente continuamos con la información de Firebase
          console.log("Buscando perfil del usuario existente...");
        }

        if (syncResult.isNewUser || !hasRoute) {
          toast({
            title: "¡Bienvenido!",
            description: "Completa tu perfil para continuar...",
          });
          navigate("/diagnostic");
        } else {
          toast({
            title: "¡Bienvenido de vuelta!",
            description: "Iniciando sesión...",
          });
          navigate("/dashboard");
        }
        return;
      }

      // Si hay sesión, continuar normalmente
      if (syncResult.isNewUser || !hasRoute) {
        toast({
          title: "¡Bienvenido!",
          description: "Completa tu perfil para continuar...",
        });
        navigate("/diagnostic");
      } else {
        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Iniciando sesión...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error completo en Google Sign In:", error);

      // Mensajes de error más específicos
      let errorMessage = "Ocurrió un error inesperado";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage =
          "El popup de Google fue cerrado. Por favor, intenta de nuevo.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "El popup fue bloqueado por tu navegador. Por favor, permite popups para este sitio.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Error de conexión. Por favor, verifica tu conexión a internet.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error al iniciar sesión con Google",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="mb-6">
            <h1
              className="text-4xl md:text-5xl font-bold text-[#1B5E20] drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)] mb-4"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                letterSpacing: "0.02em",
              }}
            >
              SAO
            </h1>
          </div>
          <p className="text-muted-foreground font-body">
            Sistema de Acompañamiento y Orientación
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ChildFund Bolivia
          </p>
        </div>

        <Tabs
          value={isLogin ? "login" : "signup"}
          onValueChange={(v) => setIsLogin(v === "login")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Bienvenido de vuelta</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Iniciar Sesión
                  </Button>
                </form>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        O
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar con Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>
                  Completa el formulario para comenzar tu viaje emprendedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre completo</Label>
                    <Input
                      id="signup-name"
                      placeholder="Juan Pérez"
                      value={signupData.full_name}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          full_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-age">Edad</Label>
                      <Input
                        id="signup-age"
                        type="number"
                        min="16"
                        max="24"
                        placeholder="18"
                        value={signupData.age}
                        onChange={(e) =>
                          setSignupData({ ...signupData, age: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">Ciudad</Label>
                      <Select
                        value={signupData.city}
                        onValueChange={(value) =>
                          setSignupData({ ...signupData, city: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="La Paz">La Paz</SelectItem>
                          <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                          <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                          <SelectItem value="Sucre">Sucre</SelectItem>
                          <SelectItem value="Potosí">Potosí</SelectItem>
                          <SelectItem value="Oruro">Oruro</SelectItem>
                          <SelectItem value="Tarija">Tarija</SelectItem>
                          <SelectItem value="Beni">Beni</SelectItem>
                          <SelectItem value="Pando">Pando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-sector">Rubro/Sector</Label>
                    <Input
                      id="signup-sector"
                      placeholder="Ej: Textiles, Tecnología, Gastronomía"
                      value={signupData.business_sector}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          business_sector: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Crear Cuenta
                  </Button>
                </form>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        O
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar con Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
