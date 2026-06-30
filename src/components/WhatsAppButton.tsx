import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import whatsappLogo from "@/assets/whatsapp-logo.png";

type Msg = { role: "user" | "assistant"; content: string };

const PHONE = "+34603912086";
const WELCOME: Msg = {
  role: "assistant",
  content:
    "¡Hola! 👋 Soy el asistente de Chamberi Barber Shop. Te ayudo a reservar tu cita. ¿Cuál es tu nombre?",
};

const extractReserva = (text: string) => {
  const m = text.match(/\[RESERVA\](.*?)\[\/RESERVA\]/s);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
};

const cleanText = (text: string) => text.replace(/\[RESERVA\].*?\[\/RESERVA\]/s, "").trim();

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reserva, setReserva] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chatbot-reserva", {
        body: { messages: next },
      });
      if (error) throw error;
      const reply: string = data?.reply ?? "Lo siento, ha habido un problema.";
      const r = extractReserva(reply);
      const visible = cleanText(reply);
      setMessages((m) => [...m, { role: "assistant", content: visible || "Cita lista ✅" }]);
      if (r) setReserva(r);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Error de conexión. Inténtalo de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmWhatsApp = () => {
    if (!reserva) return;
    const msg = encodeURIComponent(
      `Hola! Quiero confirmar mi reserva en Chamberi Barber Shop:\n\n` +
        `👤 Nombre: ${reserva.nombre}\n` +
        `✂️ Servicio: ${reserva.servicio}\n` +
        `📅 Fecha y hora: ${reserva.fecha_hora}\n` +
        `📞 Contacto: ${reserva.telefono}`,
    );
    window.open(`https://wa.me/${PHONE.replace("+", "")}?text=${msg}`, "_blank");
  };

  const reset = () => {
    setMessages([WELCOME]);
    setReserva(null);
    setInput("");
  };

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat de reservas"
          className="fixed bottom-6 right-6 z-50 cursor-pointer hover:scale-110 transition-all duration-300 group"
        >
          <img
            src={whatsappLogo}
            alt="WhatsApp"
            className="h-16 w-16 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
          />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[600px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-accent text-white">
            <div className="flex items-center gap-2">
              <img src={whatsappLogo} alt="" className="h-8 w-8" />
              <div>
                <p className="font-semibold text-sm leading-tight">Asistente de Reservas</p>
                <p className="text-xs opacity-90">Chamberi Barber Shop</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-electric-blue text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-2xl text-sm text-muted-foreground">
                  Escribiendo...
                </div>
              </div>
            )}
            {reserva && (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={confirmWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold py-3 rounded-xl shadow-md transition"
                >
                  ✅ Confirmar por WhatsApp
                </button>
                <button
                  onClick={reset}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Empezar otra reserva
                </button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-background flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe tu mensaje..."
              disabled={loading || !!reserva}
              maxLength={300}
              className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim() || !!reserva}
              aria-label="Enviar"
              className="bg-electric-blue hover:bg-electric-blue-dark text-white p-2 rounded-lg disabled:opacity-40 transition"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
