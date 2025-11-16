import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, FileCheck, Sparkles, Shield, Zap, TrendingUp, Rocket, Wallet, ChevronDown, ChevronUp } from "lucide-react";

// Constantes para los módulos con estilos NFT únicos
const MODULES = [
  { 
    id: "M1", 
    title: "CRECIMIENTO", 
    key: "cert_M1",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    gradientColors: ["rgb(16, 185, 129)", "rgb(34, 197, 94)", "rgb(20, 184, 166)"],
    icon: TrendingUp,
    rarity: "Common",
    color: "emerald"
  },
  { 
    id: "M2", 
    title: "ESCALAMIENTO", 
    key: "cert_M2",
    gradient: "from-blue-500 via-cyan-500 to-indigo-500",
    gradientColors: ["rgb(59, 130, 246)", "rgb(6, 182, 212)", "rgb(99, 102, 241)"],
    icon: Zap,
    rarity: "Rare",
    color: "blue"
  },
  { 
    id: "M3", 
    title: "CONSOLIDACIÓN", 
    key: "cert_M3",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    gradientColors: ["rgb(168, 85, 247)", "rgb(236, 72, 153)", "rgb(244, 63, 94)"],
    icon: Shield,
    rarity: "Epic",
    color: "purple"
  },
  { 
    id: "M4", 
    title: "DESPEGUE", 
    key: "cert_M4",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    gradientColors: ["rgb(245, 158, 11)", "rgb(249, 115, 22)", "rgb(239, 68, 68)"],
    icon: Rocket,
    rarity: "Legendary",
    color: "amber"
  },
];

// Usuario mock (puedes cambiarlo o obtenerlo de autenticación)
const MOCK_USER_ID = "user_12345";
const ISSUER = "Emprende Voz";

/**
 * Verifica si un módulo está completado
 * En producción, esto debería consultar la base de datos o estado de progreso
 * Por ahora, simulamos que M1 está completado
 * @param {string} moduleId - ID del módulo
 * @returns {boolean} true si está completado
 */
const isModuleCompleted = (moduleId) => {
  // Simulación: M1 está completado, los demás no
  // En producción, esto debería verificar el progreso real del usuario
  return moduleId === "M1";
};

/**
 * Genera un hash SHA-256 hexadecimal del certificado JSON
 * @param {Object} certificateJson - Objeto del certificado
 * @returns {Promise<string>} Hash hexadecimal
 */
const generateCertificateHash = async (certificateJson) => {
  try {
    const jsonString = JSON.stringify(certificateJson, null, 0);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (error) {
    console.error("Error generando hash:", error);
    throw error;
  }
};

/**
 * Crea un certificado para un módulo
 * @param {string} moduleId - ID del módulo (M1, M2, M3, M4)
 * @param {string} moduleTitle - Título del módulo
 * @returns {Promise<Object>} Certificado con hash
 */
const createCertificate = async (moduleId, moduleTitle) => {
  const certificate = {
    certificate_version: "1.0",
    module_id: moduleId,
    module_title: moduleTitle,
    user_id: MOCK_USER_ID,
    issued_at: new Date().toISOString(),
    issuer: ISSUER,
    metadata: {
      platform: "Emprende Voz",
      type: "digital_certificate",
    },
  };

  const hash = await generateCertificateHash(certificate);
  return { cert: certificate, hash };
};

/**
 * Verifica la integridad de un certificado
 * @param {Object} certificateData - Objeto con cert y hash
 * @returns {Promise<boolean>} true si es válido
 */
const verifyCertificate = async (certificateData) => {
  try {
    const calculatedHash = await generateCertificateHash(certificateData.cert);
    return calculatedHash === certificateData.hash;
  } catch (error) {
    console.error("Error verificando certificado:", error);
    return false;
  }
};

/**
 * Descarga el certificado como archivo JSON
 * @param {Object} certificateData - Objeto con cert y hash
 * @param {string} moduleId - ID del módulo para el nombre del archivo
 */
const downloadCertificate = (certificateData, moduleId) => {
  const dataStr = JSON.stringify(certificateData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificado_${moduleId}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Componente de Card NFT para cada certificado
 */
const CertificateCard = ({ module, certificateData, isCompleted, onDownload, onMint, walletAddress }) => {
  const hasCertificate = certificateData !== null;
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const ModuleIcon = module.icon;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const isValid = await verifyCertificate(certificateData);
      setTimeout(() => {
        alert(isValid ? "Certificado válido ✔" : "Certificado inválido ❌");
        setIsVerifying(false);
      }, 100);
    } catch (error) {
      alert("Error al verificar el certificado ❌");
      setIsVerifying(false);
    }
  };

  return (
    <div className="group relative">
      {/* Efecto de brillo en hover */}
      {hasCertificate && (
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"
          style={{
            background: `linear-gradient(to right, ${module.gradientColors[0]}, ${module.gradientColors[1]}, ${module.gradientColors[2]})`
          }}
        ></div>
      )}
      
      <Card 
        className={`relative overflow-hidden border-2 transition-all duration-300 ${
          hasCertificate 
            ? `text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] border-white/30` 
            : "border-dashed border-muted bg-muted/30"
        }`}
        style={hasCertificate ? { 
          background: `linear-gradient(to bottom right, ${module.gradientColors[0]}, ${module.gradientColors[1]}, ${module.gradientColors[2]})`
        } : {}}
      >
        {/* Patrón de fondo para NFTs */}
        {hasCertificate && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        )}

        <CardHeader className="relative z-10 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className={`p-2 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0 ${
                  hasCertificate ? "shadow-lg" : ""
                }`}>
                  <ModuleIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${hasCertificate ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className={`text-lg sm:text-xl font-bold ${hasCertificate ? "text-white" : ""} truncate`}>
                    {module.title}
                  </CardTitle>
                  <CardDescription className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${hasCertificate ? "text-white/80" : ""}`}>
                    Módulo {module.id}
                  </CardDescription>
                </div>
              </div>
            </div>
            {hasCertificate && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs sm:text-sm flex-shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{module.rarity}</span>
                <span className="sm:hidden">{module.rarity.substring(0, 1)}</span>
              </Badge>
            )}
          </div>

          {!hasCertificate && (
            <Badge variant="secondary" className="w-fit">
              {isCompleted ? "Completado - Generando..." : "No completado ✖"}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="relative z-10 space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          {hasCertificate ? (
            <>
              {/* Área visual del NFT - Diseño Premium */}
              <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-8 bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-md border-2 border-white/30 mb-4 sm:mb-6 overflow-hidden">
                {/* Efectos de brillo animados */}
                <div className="absolute inset-0 opacity-20">
                  <div 
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${module.gradientColors[0]}, transparent 50%)`,
                      animationDelay: '0s'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: `radial-gradient(circle at 70% 70%, ${module.gradientColors[2]}, transparent 50%)`,
                      animationDelay: '1s'
                    }}
                  ></div>
                </div>
                
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
                }}></div>

                <div className="relative z-10 flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                  {/* Icono principal con efectos */}
                  <div className="relative">
                    {/* Anillo exterior animado - móvil */}
                    <div 
                      className="absolute inset-0 rounded-full animate-spin-slow sm:hidden"
                      style={{
                        width: '80px',
                        height: '80px',
                        border: `2px solid transparent`,
                        borderTopColor: module.gradientColors[0],
                        borderRightColor: module.gradientColors[1],
                        borderBottomColor: module.gradientColors[2],
                        margin: '-15px'
                      }}
                    ></div>
                    {/* Anillo exterior animado - desktop */}
                    <div 
                      className="absolute inset-0 rounded-full animate-spin-slow hidden sm:block"
                      style={{
                        width: '120px',
                        height: '120px',
                        border: `3px solid transparent`,
                        borderTopColor: module.gradientColors[0],
                        borderRightColor: module.gradientColors[1],
                        borderBottomColor: module.gradientColors[2],
                        margin: '-20px'
                      }}
                    ></div>
                    
                    {/* Glow effect - móvil */}
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-60 sm:hidden"
                      style={{
                        background: `radial-gradient(circle, ${module.gradientColors[1]}, transparent 70%)`,
                        width: '70px',
                        height: '70px',
                        margin: '-8px'
                      }}
                    ></div>
                    {/* Glow effect - desktop */}
                    <div 
                      className="absolute inset-0 rounded-full blur-2xl opacity-60 hidden sm:block"
                      style={{
                        background: `radial-gradient(circle, ${module.gradientColors[1]}, transparent 70%)`,
                        width: '100px',
                        height: '100px',
                        margin: '-10px'
                      }}
                    ></div>
                    
                    {/* Icono central */}
                    <div className="relative p-4 sm:p-6 bg-white/30 backdrop-blur-sm rounded-full border-2 border-white/40 shadow-2xl">
                      <ModuleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Información del NFT */}
                  <div className="text-center space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white/90 animate-pulse" />
                      <p className="text-sm sm:text-lg font-bold text-white drop-shadow-lg tracking-wide">
                        CERTIFICADO NFT
                      </p>
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white/90 animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white/90" />
                      <p className="text-[10px] sm:text-xs font-semibold text-white/90 uppercase tracking-wider">
                        Verificado SHA-256
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/70 mt-1 sm:mt-2 font-medium">
                      {module.rarity} • Módulo {module.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del certificado - Diseño mejorado */}
              <div className="space-y-3 sm:space-y-4">
                {/* Información básica siempre visible */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">Rareza</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{module.rarity}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">Módulo</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{module.id}</p>
                  </div>
                </div>

                {/* Botón Ver más / Ver menos */}
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm h-9 sm:h-10"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Ver más detalles
                    </>
                  )}
                </Button>

                {/* Información expandida */}
                {isExpanded && (
                  <div className="space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Fecha de emisión */}
                    <div className="relative p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg">
                          <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">Emitido</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white ml-6 sm:ml-8">
                        {new Date(certificateData.cert.issued_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    
                    {/* Hash del certificado */}
                    <div className="relative p-3 sm:p-4 bg-black/30 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg">
                          <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">Hash Verificado</span>
                      </div>
                      <div className="mt-1.5 sm:mt-2 p-2 sm:p-3 bg-black/40 rounded-lg border border-white/10">
                        <p className="font-mono text-[10px] sm:text-xs text-white/90 break-all leading-relaxed">
                          {certificateData.hash.substring(0, 15)}
                          <span className="text-white/50">...</span>
                          {certificateData.hash.substring(certificateData.hash.length - 10)}
                        </p>
                      </div>
                    </div>

                    {/* Información adicional del certificado */}
                    <div className="p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <p className="text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Emisor</p>
                      <p className="text-xs sm:text-sm font-semibold text-white">{certificateData.cert.issuer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2 pt-1 sm:pt-2">
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-xs sm:text-sm h-9 sm:h-10"
                  >
                    <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    {isVerifying ? "Verificando..." : "Verificar"}
                  </Button>
                  <Button
                    onClick={() => onDownload(module.id)}
                    variant="default"
                    className="flex-1 bg-white hover:bg-white/90 shadow-lg font-semibold text-xs sm:text-sm h-9 sm:h-10"
                    style={{ color: '#1f2937' }}
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Descargar
                  </Button>
                </div>
                {walletAddress && (
                  <Button
                    onClick={async () => {
                      setIsMinting(true);
                      try {
                        await onMint(module.id, certificateData);
                      } catch (error) {
                        console.error('Error minting:', error);
                        alert('Error al crear NFT. Por favor, intenta de nuevo.');
                      } finally {
                        setIsMinting(false);
                      }
                    }}
                    disabled={isMinting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg text-xs sm:text-sm h-9 sm:h-10"
                  >
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">{isMinting ? "Creando NFT..." : "Crear NFT en Blockchain"}</span>
                    <span className="sm:hidden">{isMinting ? "Creando..." : "Crear NFT"}</span>
                  </Button>
                )}
              </div>
            </>
          ) : isCompleted ? (
            <div className="text-center py-6 sm:py-8">
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex p-3 sm:p-4 rounded-full bg-muted">
                  <ModuleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                El certificado se generará automáticamente al completar el módulo.
              </p>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="mb-3 sm:mb-4 opacity-50">
                <div className="inline-flex p-3 sm:p-4 rounded-full bg-muted">
                  <ModuleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                Completa el módulo para obtener tu certificado digital NFT.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Componente principal de Certificaciones
 */
const CertificationsView = () => {
  const [certificates, setCertificates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Cargar certificados desde LocalStorage y generar automáticamente si el módulo está completado
  useEffect(() => {
    const loadAndGenerateCertificates = async () => {
      setIsLoading(true);
      const loadedCertificates = {};
      
      // Primero cargar los existentes
      MODULES.forEach((module) => {
        const stored = localStorage.getItem(module.key);
        if (stored) {
          try {
            loadedCertificates[module.key] = JSON.parse(stored);
          } catch (error) {
            console.error(`Error cargando certificado ${module.key}:`, error);
          }
        }
      });

      // Luego generar automáticamente para módulos completados que no tienen certificado
      for (const module of MODULES) {
        const isCompleted = isModuleCompleted(module.id);
        const hasCertificate = loadedCertificates[module.key] !== undefined;

        if (isCompleted && !hasCertificate) {
          try {
            console.log(`Generando certificado para ${module.id}...`);
            const certificateData = await createCertificate(module.id, module.title);
            loadedCertificates[module.key] = certificateData;
            localStorage.setItem(module.key, JSON.stringify(certificateData));
            console.log(`Certificado generado para ${module.id}:`, certificateData);
          } catch (error) {
            console.error(`Error generando certificado para ${module.id}:`, error);
          }
        }
      }

      console.log('Certificados cargados:', loadedCertificates);
      setCertificates(loadedCertificates);
      setIsLoading(false);
    };

    loadAndGenerateCertificates();
  }, []);

  // Conectar wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Verificar si MetaMask está disponible
      const ethereum = window.ethereum;
      if (ethereum) {
        // MetaMask está disponible
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
          alert(`Wallet conectada: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
        }
      } else {
        alert('MetaMask no está instalado. Por favor, instala MetaMask para conectar tu wallet.');
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (error) {
      console.error('Error conectando wallet:', error);
      alert('Error al conectar la wallet. Por favor, intenta de nuevo.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Verificar si hay wallet conectada al cargar
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }

    // Escuchar cambios de cuenta en MetaMask
    const ethereum = window.ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts && accounts.length === 0) {
          setWalletAddress(null);
          localStorage.removeItem('walletAddress');
        } else if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
        }
      });
    }
  }, []);

  // Crear NFT en blockchain (simulado - en producción necesitarías un contrato inteligente)
  const handleMint = async (moduleId, certificateData) => {
    if (!walletAddress) {
      alert('Por favor, conecta tu wallet primero.');
      return;
    }

    try {
      // Simulación de minting - En producción esto llamaría a un contrato inteligente
      const nftData = {
        certificate: certificateData,
        moduleId: moduleId,
        walletAddress: walletAddress,
        mintedAt: new Date().toISOString(),
        tokenId: `NFT-${moduleId}-${Date.now()}`,
      };

      // Guardar en LocalStorage (en producción esto estaría en blockchain)
      const nftKey = `nft_${moduleId}_${walletAddress}`;
      localStorage.setItem(nftKey, JSON.stringify(nftData));

      alert(`✅ NFT creado exitosamente!\n\nToken ID: ${nftData.tokenId}\nWallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}\n\nEn producción, este NFT estaría registrado en blockchain.`);
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };

  // Descargar certificado
  const handleDownload = (moduleId) => {
    const module = MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    const certificateData = certificates[module.key];
    if (!certificateData) return;

    downloadCertificate(certificateData, moduleId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">Cargando certificados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <span>Certificados NFT Digitales</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Colecciona certificados únicos tipo NFT al completar cada módulo. Cada certificado está protegido con hash SHA-256 y es único e irreemplazable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
          {walletAddress ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                <Wallet className="h-3 w-3 mr-1" />
                Conectada
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground font-mono break-all sm:break-normal">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </span>
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base w-full sm:w-auto"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? "Conectando..." : "Conectar Wallet"}
            </Button>
          )}
        </div>
      </div>

      {/* Grid de Certificados NFT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {MODULES.map((module) => {
          const isCompleted = isModuleCompleted(module.id);
          return (
            <CertificateCard
              key={module.id}
              module={module}
              certificateData={certificates[module.key] || null}
              isCompleted={isCompleted}
              onDownload={handleDownload}
              onMint={handleMint}
              walletAddress={walletAddress}
            />
          );
        })}
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Información sobre los certificados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p>
              • Cada certificado NFT es único e irreemplazable, con un diseño visual exclusivo por módulo.
            </p>
            <p>
              • El hash SHA-256 garantiza la integridad del certificado. Si el contenido cambia, el hash será diferente.
            </p>
            <p>
              • Los certificados se generan automáticamente al completar cada módulo, sin necesidad de acción manual.
            </p>
            <p>
              • Cada módulo tiene una rareza diferente: Common, Rare, Epic y Legendary.
            </p>
            <p>
              • Los certificados se almacenan localmente y puedes descargarlos en formato JSON en cualquier momento.
            </p>
            <p>
              • Usa la función "Verificar" para comprobar la autenticidad e integridad de tu certificado NFT.
            </p>
            <p>
              • Conecta tu wallet (MetaMask) para crear NFTs en blockchain y construir tu reputación digital.
            </p>
            <p>
              • Los NFTs creados están vinculados a tu wallet y pueden ser verificados públicamente en blockchain.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationsView;

