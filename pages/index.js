// pages/index.js

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  const handleSearch = async (p = 1) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${p}`);
    const data = await res.json();
    setResults(data.items || data);  // Dependiendo de cómo venga el JSON
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
        {results && results.length > 0 ? (
          <ul>
            {results.map(item => (
              <li key={item.videoId || item.channelId}>
                {item.title}
              </li>
            ))}
          </ul>
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