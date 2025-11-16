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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Plus,
  TrendingUp,
  Lightbulb,
  HelpCircle,
} from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_liked?: boolean;
  user_name?: string;
  user_avatar?: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<{
    [key: string]: Comment[];
  }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  // Estado del formulario de nuevo post
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "experiencia",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId, selectedCategory]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);

    // Obtener nombre del usuario desde el perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || "Usuario");
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url =
        selectedCategory === "all"
          ? `${API_URL}/api/community/posts`
          : `${API_URL}/api/community/posts?category=${selectedCategory}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Obtener información de likes para cada post
        const postsWithLikes = await Promise.all(
          data.data.map(async (post: Post) => {
            const likesResponse = await fetch(
              `${API_URL}/api/community/posts/${post.id}/likes?user_id=${userId}`
            );
            const likesData = await likesResponse.json();

            // Obtener nombre del usuario desde Supabase
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", post.user_id)
              .single();

            return {
              ...post,
              user_liked: likesData.user_liked || false,
              user_name: profile?.full_name || "Usuario",
              user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`,
            };
          })
        );

        setPosts(postsWithLikes);
      }
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

  const handleCreatePost = async () => {
    if (!userId || !newPost.title || !newPost.content) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/community/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Post creado exitosamente",
        });

        setNewPost({ title: "", content: "", category: "experiencia" });
        setIsDialogOpen(false);
        fetchPosts();
      } else {
        throw new Error(data.error || "Error al crear post");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/community/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Actualizar el estado local
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  user_liked: data.liked,
                  likes_count: data.likes_count,
                }
              : post
          )
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);

    // Cargar comentarios si no están cargados
    if (!postComments[postId]) {
      try {
        const response = await fetch(
          `${API_URL}/api/community/posts/${postId}/comments`
        );
        const data = await response.json();

        if (response.ok) {
          // Obtener nombres de usuarios para los comentarios
          const commentsWithUsers = await Promise.all(
            data.data.map(async (comment: Comment) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", comment.user_id)
                .single();

              return {
                ...comment,
                user_name: profile?.full_name || "Usuario",
                user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`,
              };
            })
          );

          setPostComments((prev) => ({
            ...prev,
            [postId]: commentsWithUsers,
          }));
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Error al cargar comentarios",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!userId || !newComment[postId]?.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/community/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            content: newComment[postId],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Agregar el nuevo comentario a la lista
        const commentWithUser = {
          ...data.data,
          user_name: userName,
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        };

        setPostComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), commentWithUser],
        }));

        // Actualizar contador de comentarios
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments_count: post.comments_count + 1 }
              : post
          )
        );

        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "experiencia":
        return <TrendingUp className="h-4 w-4" />;
      case "curiosidad":
        return <Lightbulb className="h-4 w-4" />;
      case "pregunta":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "experiencia":
        return "Experiencia";
      case "curiosidad":
        return "Curiosidad";
      case "pregunta":
        return "Pregunta";
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8 min-h-[400px]">
        <div className="animate-pulse text-sm sm:text-base">Cargando comunidad...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Comunidad</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comparte experiencias, curiosidades y conecta con otros
            emprendedores
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto text-sm sm:text-base">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Post</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Crear Nuevo Post</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Comparte tu experiencia, curiosidad o pregunta con la comunidad
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select
                  value={newPost.category}
                  onValueChange={(value) =>
                    setNewPost({ ...newPost, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experiencia">Experiencia</SelectItem>
                    <SelectItem value="curiosidad">Curiosidad</SelectItem>
                    <SelectItem value="pregunta">Pregunta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título de tu post..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenido</label>
                <Textarea
                  placeholder="Escribe tu experiencia, curiosidad o pregunta..."
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreatePost}
                className="w-full sm:w-auto"
              >
                Publicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
        >
          Todos
        </Button>
        <Button
          variant={selectedCategory === "experiencia" ? "default" : "outline"}
          onClick={() => setSelectedCategory("experiencia")}
          className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
        >
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Experiencias</span>
          <span className="sm:hidden">Exp.</span>
        </Button>
        <Button
          variant={selectedCategory === "curiosidad" ? "default" : "outline"}
          onClick={() => setSelectedCategory("curiosidad")}
          className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
        >
          <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Curiosidades</span>
          <span className="sm:hidden">Cur.</span>
        </Button>
        <Button
          variant={selectedCategory === "pregunta" ? "default" : "outline"}
          onClick={() => setSelectedCategory("pregunta")}
          className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
        >
          <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Preguntas</span>
          <span className="sm:hidden">Preg.</span>
        </Button>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-3 sm:space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                No hay posts aún. ¡Sé el primero en compartir!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={post.user_avatar} />
                      <AvatarFallback>
                        {post.user_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{post.user_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm flex-shrink-0">
                    <span className="hidden sm:inline">{getCategoryIcon(post.category)}</span>
                    <span className="truncate max-w-[60px] sm:max-w-none">{getCategoryLabel(post.category)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap mb-3 sm:mb-4 break-words">
                  {post.content}
                </p>

                {/* Acciones */}
                <div className="flex items-center gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => handleToggleLike(post.id)}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        post.user_liked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    <span>{post.likes_count}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => handleToggleComments(post.id)}
                  >
                    <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{post.comments_count}</span>
                  </Button>
                </div>

                {/* Comentarios */}
                {expandedPost === post.id && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t space-y-3 sm:space-y-4">
                    {/* Lista de comentarios */}
                    {postComments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2 sm:gap-3">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarImage src={comment.user_avatar} />
                          <AvatarFallback>
                            {comment.user_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-muted rounded-lg p-2.5 sm:p-3">
                            <p className="font-semibold text-xs sm:text-sm mb-1 truncate">
                              {comment.user_name}
                            </p>
                            <p className="text-xs sm:text-sm break-words">{comment.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Input para nuevo comentario */}
                    <div className="flex gap-2">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                        />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-1.5 sm:gap-2">
                        <Input
                          placeholder="Escribe un comentario..."
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              [post.id]: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(post.id);
                            }
                          }}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
