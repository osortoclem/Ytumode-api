import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  const handleSearch = async (p = 1) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${p}`);
    const data = await res.json();
    setResults(data.resultado || []);  // Ajustado al nuevo formato
    setPage(p);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Búsqueda de YouTube</h1>
      <input
        type="text"
        placeholder="Ingresa tu búsqueda..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: "300px", padding: "0.5rem" }}
      />
      <button onClick={() => handleSearch(1)} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
        Buscar
      </button>

      <div style={{ marginTop: "2rem" }}>
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <img src={item.miniatura} alt="Miniatura" width="240" />
              <h3>{item.titulo}</h3>
              <p>Canal: {item.canal}</p>
              <p>Vistas: {item.vistas.toLocaleString()}</p>
              <p>Publicado: {item.publicado}</p>
              <p>Duración: {item.duracion}</p>
              <div style={{ marginTop: "0.5rem" }}>
                <a
                  href={`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(item.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#0070f3",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    textDecoration: "none",
                    borderRadius: "4px"
                  }}
                >
                  Descargar
                </a>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <iframe
                  width="320"
                  height="180"
                  src={`https://www.youtube.com/embed/${item.url.split("v=")[1]}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index}`}
                ></iframe>
              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => handleSearch(page - 1)}
          disabled={page <= 1}
          style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}
        >
          Anterior
        </button>
        <button onClick={() => handleSearch(page + 1)} style={{ padding: "0.5rem 1rem" }}>
          Siguiente
        </button>
      </div>
    </div>
  );
}