// pages/api/search.js
import ytSearch from 'yt-search';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const query = req.query.q || "";

  try {
    const results = await ytSearch(query);
    const videos = results.videos.slice(0, 50); // Cambia a 15, 20 o más si quieres

    const resultado = videos.map(video => ({
      titulo: video.title,
      miniatura: video.thumbnail,
      canal: video.author.name,
      publicado: video.ago,
      duracion: video.timestamp,
      vistas: video.views,
      url: video.url
    }));

    res.status(200).json({
      status: true,
      creator: "Deylin",
      total: resultado.length,
      resultado
    });

  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}