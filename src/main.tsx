import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/.netlify/functions/gen-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "A realistic portrait of a person",
        }),
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);

      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Face Transformer Test</h2>

      <button onClick={generateImage}>
        Generate Image
      </button>

      {loading && <p>در حال تولید...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <pre style={{ textAlign: "left", marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
