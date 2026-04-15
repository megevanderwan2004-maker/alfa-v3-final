import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";

const RESEND_API_KEY = "re_AKGqvKJy_44eQ3pYmrpnMjkZjjJRm5G9d";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const email = record?.email;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // El enlace principal del catálogo. Si lo cambias en el Dashboard de Supabase (Secrets), tomará el nuevo valor automáticamente.
    const CATALOG_URL = Deno.env.get("CATALOG_URL") || "https://drive.google.com/file/d/1UHAi3XOsHjMOjInNodlON3X6rThz8Ngv/view";

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ALFA Car Audio <onboarding@resend.dev>',
        to: [email],
        subject: '🚗 Tu Catálogo ALFA Car Audio 2026 está aquí',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #D90429;">¡Tu catálogo ya está aquí!</h1>
            <p>Gracias por confiar en <strong>ALFA Car Audio Guadalajara</strong>.</p>
            <p>Haz clic en el botón de abajo para explorar nuestras soluciones premium:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${CATALOG_URL}" 
                 style="background: #D90429; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 DESCARGAR CATÁLOGO PDF
              </a>
            </div>
            <p style="color: #666; font-size: 0.9rem;">Si tienes dudas sobre algún equipo o instalación, escríbenos por WhatsApp.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
