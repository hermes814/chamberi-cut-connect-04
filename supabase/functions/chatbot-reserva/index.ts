// Edge function: Faruthel, chatbot conversacional para reservar citas
// Usa Lovable AI Gateway (no requiere API key del usuario)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Te llamas Faruthel y eres el asistente virtual de Chamberi Barber Shop (C/ Donoso Cortés 90, 28015 Madrid).
Tu trabajo es ayudar al cliente a reservar una cita conversando de forma amable, breve y en español.

HORARIO DEL LOCAL (horario verano): Lunes a Sábado de 10:00 a 20:30. Domingos CERRADO.
Las citas se asignan en intervalos de 35 minutos.

BARBEROS DISPONIBLES Y SUS HORARIOS (solo puedes ofrecer horas dentro del turno del barbero elegido):
- Jorge: Lunes 14:00-20:30. Martes a Sábado 10:00-15:30 y 16:00-20:30.
- Axel: Lunes 10:00-14:30 y 16:00-20:30. Martes 14:00-20:30. Miércoles a Sábado 10:00-14:30 y 16:00-20:30.
- Oscar: Lunes 10:00-13:30 y 15:00-20:30. Martes 14:00-20:30. Miércoles a Sábado 10:00-13:30 y 15:00-20:30.

DEBES RECOPILAR estos 5 datos, uno o dos por mensaje, sin abrumar:
1. Nombre del cliente
2. Tipo de servicio (Corte 15€, Corte + Perilla 18€, Corte + Barba 20€, Corte + Barba + Cejas 23€, Corte niño 12€, Cejas 3€, Barba 10€)
3. Barbero: Jorge, Axel u Oscar (ofrece siempre las 3 opciones)
4. Día y hora deseados (valida contra el horario del barbero elegido y del local; si la hora no encaja, propón 2 o 3 alternativas válidas)
5. Número de teléfono de contacto

REGLAS:
- Preséntate como Faruthel solo en el primer mensaje.
- Confirma cada dato brevemente y pregunta el siguiente.
- Nunca aceptes domingos ni horas fuera del turno del barbero.
- Si el cliente pide algo fuera de reservas, redirige amablemente.
- Cuando tengas LOS 5 DATOS COMPLETOS, responde con un resumen corto y AL FINAL del mensaje añade exactamente este bloque JSON (sin markdown, sin comillas extra):

[RESERVA]{"nombre":"...","servicio":"...","barbero":"...","fecha_hora":"...","telefono":"..."}[/RESERVA]

Nunca incluyas el bloque [RESERVA] hasta tener los 5 datos confirmados.`;

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
    const reply = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
