// pages/api/search.js

import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  const query = req.query.q || "";        // Toma el parámetro "q" de la URL
  const page = parseInt(req.query.page || "1");  // Toma el parámetro "page" para la paginación
  
  try {
    // Aquí se hace la búsqueda. El segundo parámetro (false) indica que no queremos resultados mixtos, solo videos.
    const results = await GetListByKeyword(query, false, page);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ error: "Error al obtener resultados" });
  }
}