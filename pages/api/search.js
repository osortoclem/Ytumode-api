// pages/api/search.js
import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === "OPTIONS") return res.status(200).end();

  const query = req.query.q || "";
  if (!query || query.length < 2) {
    return res.status(400).json({ status: false, error: "Consulta no válida" });
  }

  try {
    const pagesToFetch = 2;
    const seen = new Set();
    const videos = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const data = await GetListByKeyword(query, false, page);
      const current = data.items.filter(item => item.type === "video");

      for (const video of current) {
        if (!seen.has(video.id)) {
          seen.add(video.id);
          videos.push({
            titulo: video.title,
            miniatura: video.thumbnail?.thumbnails?.pop()?.url || '',
            canal: video.channelTitle || 'Desconocido',
            publicado: video.publishedTime || 'No disponible',
            vistas: parseInt(video.viewCount) || 0,
            likes: 'No disponible',
            duracion: video.length?.simpleText || 'No disponible',
            url: `https://youtube.com/watch?v=${video.id}`
          });
        }
      }
    }

    res.status(200).json({
      status: true,
      creator: "Deylin",
      total: videos.length,
      resultado: videos
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error.message);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}