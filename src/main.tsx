import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Face Transformer Test</h2>
      <button>Generate Image</button>
    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
