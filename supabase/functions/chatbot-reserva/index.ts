// Edge function: Faruthel, chatbot conversacional para reservar citas
// Usa Lovable AI Gateway (no requiere API key del usuario)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WHATSAPP = "34603912086";

const buildSystemPrompt = (hoy: string, ocupadas: string) => `Eres Faruthel, asistente de Chamberi Barber Shop. Responde en español, muy breve y directo.

Hoy: ${hoy} (Madrid).
Horario local: Lunes a Sábado 10:00-20:30. Domingos cerrado. Citas cada 30 min.

Barberos:
- Jorge: Lunes 14:00-20:30; Martes a Sábado 10:00-15:30 y 16:00-20:30.
- Oscar: Lunes 10:00-13:30 y 15:00-20:30; Martes 14:00-20:30; Miércoles a Sábado 10:00-13:30 y 15:00-20:30.

Ocupadas:
${ocupadas}

Recoge 5 datos, uno por mensaje:
1. Nombre
2. Servicio (Corte caballero 15€, Corte+Perilla 18€, Corte+Barba 23€, Corte niño 12€, Cejas 3€, Barba 10€)
3. Barbero (Jorge/Oscar)
4. Día y hora
5. Teléfono

Reglas:
- Saluda solo al inicio.
- Confirma cada dato con una frase corta y pide el siguiente.
- Cuando elija barbero, muestra su horario semanal completo en lista corta.
- No ofrezcas ni aceptes domingos, horas fuera de turno ni horas ocupadas.
- Si pide hora ocupada, di "Ocupada" y da 2 alternativas libres.
- No uses "sucesivamente".
- Fuera de reservas/cancelaciones, redirige amablemente.

Con los 5 datos, responde un resumen de una línea y añade al final:
[RESERVA]{"nombre":"...","servicio":"...","barbero":"...","fecha":"YYYY-MM-DD","hora":"HH:MM","telefono":"..."}[/RESERVA]

Cancelaciones:
- Pide teléfono, fecha y hora.
- Cancelable solo hasta 30 min antes; después, llama al 603 912 086.
- Con los 3 datos, añade:
[CANCELAR]{"telefono":"...","fecha":"YYYY-MM-DD","hora":"HH:MM"}[/CANCELAR]`;

const RESERVA_RE = /\[RESERVA\]([\s\S]*?)\[\/RESERVA\]/;
const CANCELAR_RE = /\[CANCELAR\]([\s\S]*?)\[\/CANCELAR\]/;

// Minutos absolutos (día + hora) para comparar sin problemas de zona horaria
const toMinutes = (fecha: string, hora: string) => {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  return Date.UTC(y, m - 1, d) / 60000 + hh * 60 + mm;
};

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
    let cancelacion: Record<string, string> | null = null;
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

    // Cancelación de cita (máximo 30 minutos antes de la hora reservada)
    const cancelMatch = reply.match(CANCELAR_RE);
    if (cancelMatch) {
      reply = reply.replace(CANCELAR_RE, "").trim();
      try {
        const c = JSON.parse(cancelMatch[1]);
        const ahora = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" });
        const [fechaHoy, horaHoy] = ahora.split(" ");
        const minutosAhora = toMinutes(fechaHoy, horaHoy.slice(0, 5));
        const minutosCita = toMinutes(c.fecha, c.hora);

        const { data: citaEncontrada } = await supabase
          .from("citas")
          .select("id, nombre, barbero, servicio")
          .eq("telefono", c.telefono)
          .eq("fecha", c.fecha)
          .eq("hora", c.hora)
          .maybeSingle();

        if (!citaEncontrada) {
          reply += `\n\nNo encuentro ninguna cita con esos datos (${c.fecha} a las ${c.hora}). ¿Puedes revisar el teléfono, el día y la hora?`;
        } else if (minutosCita - minutosAhora < 30) {
          reply += `\n\nLo siento, ya no quedan 30 minutos para tu cita (${c.fecha} a las ${c.hora}), así que no puedo cancelarla desde aquí. Llama al 603 912 086.`;
        } else {
          const { error: delError } = await supabase.from("citas").delete().eq("id", citaEncontrada.id);
          if (delError) {
            console.error("Error cancelando cita:", delError.message);
            reply += "\n\nHubo un problema al cancelar la cita. Inténtalo de nuevo en un momento.";
          } else {
            const msg =
              `CITA CANCELADA - Chamberi Barber Shop\n\n` +
              `• Nombre: ${citaEncontrada.nombre}\n` +
              `• Servicio: ${citaEncontrada.servicio}\n` +
              `• Barbero: ${citaEncontrada.barbero}\n` +
              `• Fecha: ${c.fecha}\n` +
              `• Hora: ${c.hora}\n` +
              `• Teléfono: ${c.telefono}`;
            whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
            cancelacion = { ...c, nombre: citaEncontrada.nombre, barbero: citaEncontrada.barbero };
            reply += `\n\nListo, tu cita del ${c.fecha} a las ${c.hora} con ${citaEncontrada.barbero} ha sido cancelada y esa hora vuelve a estar disponible.`;
          }
        }
      } catch (err) {
        console.error("Cancelación inválida:", err);
      }
    }

    return new Response(JSON.stringify({ reply, reserva, cancelacion, whatsappUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
