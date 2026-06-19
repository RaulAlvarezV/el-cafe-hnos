/**
 * BORRADOR — Cloud Function para traer las últimas publicaciones de Instagram.
 * ------------------------------------------------------------------------------
 * Esto NO está desplegado ni integrado a `functions/` de producción todavía.
 * Cuando esté lista la configuración de Meta + tu aprobación, se mueve a
 * `functions/` del proyecto y se despliega.
 *
 * Idea: el token de Instagram queda SOLO en el servidor (nunca en el sitio).
 * El sitio hace fetch a esta función, que cachea el resultado ~1h y devuelve el
 * mismo JSON { data: [...] } que ya consume la home (instagram-feed.json).
 *
 * PASOS QUE DEPENDEN DE VOS (Meta / Firebase):
 *  1. Pasar @elcafehermanos a cuenta Business o Creator y vincularla a una
 *     página de Facebook.
 *  2. Crear una app en https://developers.facebook.com y agregar el producto de
 *     Instagram (Instagram API). Verificar en la doc ACTUAL de Meta qué variante
 *     corresponde (la "Instagram Basic Display API" fue discontinuada): hoy suele
 *     ser "Instagram API with Instagram Login" o vía la Graph API de Facebook.
 *  3. Generar un TOKEN DE LARGA DURACIÓN y guardarlo como secreto en Firebase:
 *        firebase functions:secrets:set IG_TOKEN
 *     (Los tokens caducan: conviene un job que lo renueve cada ~50 días.)
 *  4. Avisarme para integrar esto en functions/ y desplegar (con tu OK).
 *  5. En el sitio, apuntar IG_ENDPOINT (en index.html) a la URL de esta función.
 *
 * NOTA (regla RGS): el endpoint/version exactos de la API hay que confirmarlos
 * contra la documentación vigente de Meta antes de desplegar — la API de
 * Instagram cambió y conviene no asumir.
 */

const { onRequest } = require("firebase-functions/v2/https");

let cache = { ts: 0, data: null };
const TTL_MS = 60 * 60 * 1000; // 1 hora

exports.instagramFeed = onRequest(
  { cors: true /*, secrets: ["IG_TOKEN"] */ },
  async (req, res) => {
    try {
      const now = Date.now();
      if (cache.data && now - cache.ts < TTL_MS) {
        res.set("Cache-Control", "public, max-age=600");
        return res.json(cache.data);
      }

      const token = process.env.IG_TOKEN;
      if (!token) {
        return res.status(500).json({ error: "IG_TOKEN no configurado" });
      }

      // CONFIRMAR endpoint/fields/versión con la doc actual de Meta antes de usar.
      const fields = "id,caption,media_type,media_url,permalink,thumbnail_url";
      const url =
        "https://graph.instagram.com/me/media?fields=" +
        fields +
        "&limit=6&access_token=" +
        token;

      const r = await fetch(url);
      if (!r.ok) {
        return res.status(502).json({ error: "Instagram API error", status: r.status });
      }
      const json = await r.json(); // { data: [ { id, media_type, media_url, permalink, ... } ] }

      cache = { ts: now, data: json };
      res.set("Cache-Control", "public, max-age=600");
      return res.json(json);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }
);
