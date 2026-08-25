// Edge function: Faruthel, chatbot conversacional para reservar citas
// Usa Lovable AI Gateway (no requiere API key del usuario)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WHATSAPP = "34603912086";

const buildSystemPrompt = (hoy: string, ocupadas: string) => `Te llamas Faruthel y eres el asistente virtual de Chamberi Barber Shop (C/ Donoso Cortés 90, 28015 Madrid).
Tu trabajo es ayudar al cliente a reservar una cita conversando de forma amable, breve y en español.

HOY ES: ${hoy} (zona horaria Europe/Madrid). Usa esta fecha para interpretar "hoy", "mañana" o los días de la semana.

HORARIO DEL LOCAL (horario verano): Lunes a Sábado de 10:00 a 20:30. Domingos CERRADO.
Las citas se asignan en intervalos de 30 minutos.

BARBEROS DISPONIBLES Y SUS HORARIOS (solo puedes ofrecer horas dentro del turno del barbero elegido):
- Jorge: Lunes 14:00-20:30. Martes a Sábado 10:00-15:30 y 16:00-20:30.
- Axel: Lunes 10:00-14:30 y 16:00-20:30. Martes 14:00-20:30. Miércoles a Sábado 10:00-14:30 y 16:00-20:30.
- Oscar: Lunes 10:00-13:30 y 15:00-20:30. Martes 14:00-20:30. Miércoles a Sábado 10:00-13:30 y 15:00-20:30.

HORAS YA RESERVADAS (NO las ofrezcas ni las aceptes nunca; si el cliente pide una de estas, dile que ya está ocupada y propón 2 o 3 alternativas libres):
${ocupadas}

DEBES RECOPILAR estos 5 datos, uno o dos por mensaje, sin abrumar:
1. Nombre del cliente
2. Tipo de servicio (Corte 15€, Corte + Perilla 18€, Corte + Barba 20€, Corte + Barba + Cejas 23€, Corte niño 12€, Cejas 3€, Barba 10€)
3. Barbero: Jorge, Axel u Oscar (ofrece siempre las 3 opciones)
4. Día y hora deseados (valida contra el horario del barbero elegido, el horario del local y las horas ya reservadas)
5. Número de teléfono de contacto

REGLAS:
- Preséntate como Faruthel solo en el primer mensaje.
- Confirma cada dato brevemente y pregunta el siguiente.
- EN CUANTO el cliente elija barbero, MUESTRA SIEMPRE el horario COMPLETO de TODA LA SEMANA de ese barbero (lista día por día: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, y Domingo CERRADO) tal como aparece arriba, antes de pedirle el día y la hora.
- Al proponer horas, indica también qué horas de ese día ya están ocupadas con ese barbero para que no las pida.
- Nunca aceptes domingos, horas fuera del turno del barbero ni horas ya reservadas.
- Si el cliente pide algo fuera de reservas, redirige amablemente.
- Cuando tengas LOS 5 DATOS COMPLETOS, responde con un resumen corto y AL FINAL del mensaje añade exactamente este bloque JSON (sin markdown, sin comillas extra), con la fecha en formato YYYY-MM-DD y la hora en formato HH:MM:

[RESERVA]{"nombre":"...","servicio":"...","barbero":"...","fecha":"YYYY-MM-DD","hora":"HH:MM","telefono":"..."}[/RESERVA]

Nunca incluyas el bloque [RESERVA] hasta tener los 5 datos confirmados.`;

const RESERVA_RE = /\[RESERVA\]([\s\S]*?)\[\/RESERVA\]/;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" }); // YYYY-MM-DD

    const { data: citas } = await supabase
      .from("citas")
      .select("barbero, fecha, hora")
      .gte("fecha", hoy)
      .order("fecha");

    const ocupadas =
      citas && citas.length
        ? citas.map((c) => `- ${c.barbero}: ${c.fecha} a las ${c.hora}`).join("\n")
        : "- (ninguna por ahora)";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(hoy, ocupadas) },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Error IA: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let reply: string = data.choices?.[0]?.message?.content ?? "";

    // Si el asistente cerró la reserva, la registramos en la base de datos
    let reserva: Record<string, string> | null = null;
    let whatsappUrl: string | null = null;
    const match = reply.match(RESERVA_RE);

    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        const { error } = await supabase.from("citas").insert({
          nombre: parsed.nombre,
          servicio: parsed.servicio,
          barbero: parsed.barbero,
          fecha: parsed.fecha,
          hora: parsed.hora,
          telefono: parsed.telefono,
        });

        if (error) {
          console.error("Error guardando cita:", error.message);
          reply = error.code === "23505"
            ? `Lo siento, ${parsed.barbero} acaba de quedarse sin ese hueco (${parsed.hora}). ¿Te propongo otra hora disponible?`
            : "Hubo un problema al registrar la cita. ¿Puedes confirmarme de nuevo el día y la hora?";
        } else {
          reserva = parsed;
          const msg =
            `NUEVA CITA - Chamberi Barber Shop\n\n` +
            `• Nombre: ${parsed.nombre}\n` +
            `• Servicio: ${parsed.servicio}\n` +
            `• Barbero: ${parsed.barbero}\n` +
            `• Fecha: ${parsed.fecha}\n` +
            `• Hora: ${parsed.hora}\n` +
            `• Teléfono: ${parsed.telefono}`;
          whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
          reply = reply.replace(RESERVA_RE, "").trim();
        }
      } catch (err) {
        console.error("Reserva inválida:", err);
        reply = reply.replace(RESERVA_RE, "").trim();
      }
    }

    return new Response(JSON.stringify({ reply, reserva, whatsappUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
