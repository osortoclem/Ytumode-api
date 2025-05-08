// pages/api/search.js

import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  const query = req.query.q || "";
  const pagesToFetch = 3; // 3 páginas x ~15 resultados = ~45

  try {
    let videos = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const data = await GetListByKeyword(query, false, page);
      const current = data.items.filter(item => item.type === "video");
      videos = videos.concat(current);
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
      resultado
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}