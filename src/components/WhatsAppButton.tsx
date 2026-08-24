import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const PHONE = "34603912086";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot-reserva`;

type Msg = { role: "user" | "assistant"; content: string };

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Faruthel, el asistente de Chamberi Barber Shop. Te ayudo a reservar tu cita. ¿Cómo te llamas?",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      setMessages([...next, { role: "assistant", content: data.reply || "" }]);

      if (data.whatsappUrl) {
        setWaUrl(data.whatsappUrl);
        window.open(data.whatsappUrl, "_blank");
        toast({
          title: "Cita registrada",
          description: "Se envió la notificación por WhatsApp y la hora ya no está disponible.",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "No se pudo contactar al asistente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {open && (
        <div className="fixed bottom-28 right-6 z-50 flex h-[480px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div>
              <p className="font-bold text-primary-foreground">Faruthel</p>
              <p className="text-xs text-primary-foreground/80">Asistente de reservas</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] whitespace-pre-wrap text-sm text-foreground"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-muted-foreground">Faruthel está escribiendo…</p>}
            {waUrl && (
              <button
                onClick={() => window.open(waUrl, "_blank")}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Reenviar aviso por WhatsApp
              </button>
            )}

            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={input}
              placeholder="Escribe tu mensaje…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Reservar con Faruthel por WhatsApp"
        className="group fixed bottom-6 right-6 z-50 cursor-pointer transition-all duration-300 hover:scale-110"
      >
        <img
          src={whatsappLogo}
          alt="WhatsApp"
          className="h-16 w-16 drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-xl"
        />
      </button>
    </>
  );
};

export default WhatsAppButton;
