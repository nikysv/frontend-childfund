import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Paperclip,
  Search,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "mentor";
  timestamp: Date;
  read: boolean;
}

interface Chat {
  id: string;
  mentorName: string;
  mentorAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
}

const Mentor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
    }
  };

  const loadChats = () => {
    // Datos de ejemplo - aquí se conectaría con la API
    const mockChats: Chat[] = [
      {
        id: "1",
        mentorName: "Mario González",
        mentorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
        lastMessage: "¡Hola! ¿Cómo va tu proyecto?",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
        unreadCount: 2,
        isActive: true,
      },
    
    ];

    setChats(mockChats);
    // Seleccionar el chat activo por defecto
    const activeChat = mockChats.find((c) => c.isActive);
    if (activeChat) {
      setSelectedChat(activeChat);
    }
  };

  const loadMessages = (chatId: string) => {
    // Mensajes de ejemplo - aquí se conectaría con la API
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Hola María, tengo algunas dudas sobre el módulo de finanzas",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: true,
      },
      {
        id: "2",
        text: "¡Hola! Claro, con gusto te ayudo. ¿Qué parte específica te genera dudas?",
        sender: "mentor",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        read: true,
      },
      {
        id: "3",
        text: "Es sobre el cálculo del punto de equilibrio. No entiendo bien cómo aplicarlo a mi negocio",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        read: true,
      },
      {
        id: "4",
        text: "Perfecto, te explico. El punto de equilibrio es donde tus ingresos igualan tus costos. Para calcularlo necesitas: costos fijos, costos variables y precio de venta.",
        sender: "mentor",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: true,
      },
      {
        id: "5",
        text: "Te voy a enviar un ejemplo práctico con tu tipo de negocio",
        sender: "mentor",
        timestamp: new Date(Date.now() - 1000 * 60 * 14),
        read: true,
      },
      {
        id: "6",
        text: "¡Muchas gracias! Eso me ayudaría mucho",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        read: true,
      },
      {
        id: "7",
        text: "¡Hola! ¿Cómo va tu proyecto?",
        sender: "mentor",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
      },
      {
        id: "8",
        text: "¿Ya pudiste aplicar lo que vimos en la sesión anterior?",
        sender: "mentor",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        read: false,
      },
    ];

    setMessages(mockMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simular respuesta del mentor después de 2 segundos
    setTimeout(() => {
      const mentorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Gracias por tu mensaje. Te responderé pronto.",
        sender: "mentor",
        timestamp: new Date(),
        read: false,
      };
      setMessages((prev) => [...prev, mentorResponse]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredChats = chats.filter((chat) =>
    chat.mentorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-[calc(100vh-12rem)] flex gap-0 border rounded-lg overflow-hidden shadow-sm">
        {/* Sidebar - Lista de Chats */}
        <div className="w-80 border-r bg-background flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-3">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mentor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Chats */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChat?.id === chat.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.mentorAvatar} />
                        <AvatarFallback>
                          {chat.mentorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isActive && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {chat.mentorName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-muted/20">
            {/* Chat Header */}
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.mentorAvatar} />
                  <AvatarFallback>
                    {selectedChat.mentorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.mentorName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.isActive ? "En línea" : "Desconectado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.sender === "user" && (
                          <CheckCheck
                            className={`h-3 w-3 ${
                              message.read ? "text-blue-400" : "opacity-70"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p>Selecciona un chat para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentor;
