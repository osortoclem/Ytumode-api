// pages/api/search.js
import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end(); // Preflight
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ status: false, error: "Método no permitido" });
    return;
  }

  const query = req.query.q || "";
  const pagesToFetch = 15; // Ajusta según la paginación que soporte la API

  try {
    const seen = new Set();
    let videos = [];

    let nextPageToken = null;

    for (let page = 0; page < pagesToFetch; page++) {
      try {
        const data = await GetListByKeyword(query, false, nextPageToken);
        const current = data.items.filter(item => item.type === "video");

        for (const video of current) {
          if (!seen.has(video.id)) {
            seen.add(video.id);
            videos.push(video);
          }
        }

        nextPageToken = data.nextPageToken;
        if (!nextPageToken) break;

      } catch (err) {
        console.warn(`Error en la página ${page + 1}:`, err.message);
        break;
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
      creator: "Deylin",
      total: resultado.length,
      resultado
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}