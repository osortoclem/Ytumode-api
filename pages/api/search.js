// pages/api/search.js
import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  // Habilita CORS para cualquier origen
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end(); // Preflight
    return;
  }

  const query = req.query.q || "";
  const pagesToFetch = 10;

  try {
    let seen = new Set();
    let videos = [];

    for (let page = 2; page <= pagesToFetch; page++) {
      try {
        const data = await GetListByKeyword(query, false, page);
        const current = data.items.filter(item => item.type === "video");

        for (const video of current) {
          if (!seen.has(video.id)) {
            seen.add(video.id);
            videos.push(video);
          }
        }
      } catch (err) {
        console.warn(`Error en la página ${page}:`, err.message);
        // Continúa con la siguiente página
      }
    }

    const resultado = videos.map(video => ({
      titulo: video.title,
      miniatura: video.thumbnail?.thumbnails?.pop()?.url || '',
      canal: video.channelTitle || 'Desconocido',
      publicado: video.publishedTime || 'No disponible',
      vistas: parseInt(video.viewCount) || 0,
      likes: 'No disponible',
      duracion: video.length?.simpleText || 'No disponible',
      url: `https://youtube.com/watch?v=${video.id}`
    }));

    res.status(200).json({
      status: true,
      creator: "TuNombre",
      total: resultado.length,
      resultado
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}