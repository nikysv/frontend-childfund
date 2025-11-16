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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Video,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface MentorAvailability {
  id: string;
  mentor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  max_participants: number;
  is_available: boolean;
  booked_count: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  is_virtual: boolean;
  max_participants: number;
  registered_count: number;
  registration_url?: string;
}

interface Booking {
  id: string;
  availability_id: string;
  user_id: string;
  status: string;
  availability?: MentorAvailability;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  event?: Event;
}

const CalendarView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState<"all" | "mentor" | "events">("all");
  
  const [mentorAvailability, setMentorAvailability] = useState<MentorAvailability[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, selectedDate]);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const startDate = new Date(selectedDate);
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 2);

      // Obtener disponibilidad del mentor (asumiendo un mentor_id fijo por ahora)
      // En producción, esto debería venir del perfil del usuario
      const mentorId = "mentor-1"; // TODO: Obtener del perfil del usuario
      
      const availabilityResponse = await fetch(
        `${API_URL}/api/calendar/availability?mentor_id=${mentorId}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        setMentorAvailability(availabilityData.data || []);
      }

      // Obtener eventos
      const eventsResponse = await fetch(
        `${API_URL}/api/calendar/events?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.data || []);
      }

      // Obtener reservas del usuario
      if (userId) {
        const bookingsResponse = await fetch(
          `${API_URL}/api/calendar/bookings/user/${userId}`
        );
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setUserBookings(bookingsData.data || []);
        }

        // Obtener registros de eventos del usuario
        const registrationsResponse = await fetch(
          `${API_URL}/api/calendar/events/user/${userId}/registrations`
        );
        
        if (registrationsResponse.ok) {
          const registrationsData = await registrationsResponse.json();
          setEventRegistrations(registrationsData.data || []);
        }
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

  const handleBookSession = async (availabilityId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/api/calendar/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability_id: availabilityId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al reservar");
      }

      toast({
        title: "Reserva exitosa",
        description: "Tu sesión de mentoría ha sido reservada",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/calendar/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al registrarse");
      }

      const data = await response.json();
      
      toast({
        title: data.message || "Registro exitoso",
        description: "Te has registrado al evento",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const dayAvailability = mentorAvailability.filter((avail) => {
      return avail.date === dateStr;
    });

    return { events: dayEvents, availability: dayAvailability };
  };

  const tileContent = ({ date }: { date: Date }) => {
    const { events: dayEvents, availability: dayAvailability } = getEventsForDate(date);
    const hasEvents = dayEvents.length > 0;
    const hasAvailability = dayAvailability.length > 0;

    if (hasEvents || hasAvailability) {
      return (
        <div className="flex gap-1 justify-center mt-1">
          {hasAvailability && (
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          )}
          {hasEvents && (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      );
    }
    return null;
  };

  const selectedDateData = getEventsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">
            Consulta la disponibilidad de tu mentor y eventos disponibles
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            onClick={() => setView("calendar")}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={filter === "mentor" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("mentor")}
        >
          <User className="h-4 w-4 mr-2" />
          Mentorías
        </Button>
        <Button
          variant={filter === "events" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("events")}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Eventos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="w-full border-0"
              />
            </CardContent>
          </Card>
        </div>

        {/* Detalles del día seleccionado */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Disponibilidad del Mentor */}
              {filter === "all" || filter === "mentor" ? (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sesiones de Mentoría
                  </h3>
                  {selectedDateData.availability.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateData.availability.map((avail) => {
                        const isBooked = userBookings.some(
                          (b) =>
                            b.availability_id === avail.id &&
                            b.status === "confirmed"
                        );
                        const isFull =
                          avail.session_type === "grupo" &&
                          avail.booked_count >= avail.max_participants;

                        return (
                          <Card key={avail.id} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant={
                                      avail.session_type === "individual"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {avail.session_type === "individual"
                                      ? "1 a 1"
                                      : "Grupo"}
                                  </Badge>
                                  {isBooked && (
                                    <Badge variant="outline" className="text-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Reservado
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {avail.start_time} - {avail.end_time}
                                </div>
                                {avail.session_type === "grupo" && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Users className="h-3 w-3" />
                                    {avail.booked_count}/{avail.max_participants}{" "}
                                    participantes
                                  </div>
                                )}
                              </div>
                              {!isBooked && !isFull && (
                                <Button
                                  size="sm"
                                  onClick={() => handleBookSession(avail.id)}
                                >
                                  Reservar
                                </Button>
                              )}
                              {isFull && (
                                <Badge variant="destructive" className="text-xs">
                                  Lleno
                                </Badge>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay sesiones disponibles este día
                    </p>
                  )}
                </div>
              ) : null}

              {/* Eventos */}
              {filter === "all" || filter === "events" ? (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Eventos
                  </h3>
                  {selectedDateData.events.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateData.events.map((event) => {
                        const isRegistered = eventRegistrations.some(
                          (r) => r.event_id === event.id && r.status === 'confirmed'
                        );
                        const eventDate = new Date(event.start_date);
                        const isFull =
                          event.max_participants &&
                          event.registered_count >= event.max_participants;

                        return (
                          <Card key={event.id} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {event.description}
                                  </p>
                                </div>
                                {isRegistered && (
                                  <Badge variant="outline" className="text-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Registrado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {eventDate.toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {event.is_virtual ? (
                                  <Video className="h-3 w-3" />
                                ) : (
                                  <MapPin className="h-3 w-3" />
                                )}
                                {event.is_virtual ? "Virtual" : event.location}
                              </div>
                              {event.max_participants && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {event.registered_count}/{event.max_participants}{" "}
                                  participantes
                                </div>
                              )}
                              <div className="flex gap-2">
                                {!isRegistered && !isFull && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleRegisterEvent(event.id)}
                                  >
                                    Registrarse
                                  </Button>
                                )}
                                {event.registration_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(event.registration_url, "_blank")
                                    }
                                  >
                                    Más info
                                  </Button>
                                )}
                                {isFull && (
                                  <Badge variant="destructive" className="text-xs">
                                    Lleno
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay eventos este día
                    </p>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

