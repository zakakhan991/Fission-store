// src/main.jsx
// ─────────────────────────────────────────────────────────────────────────────
// React entry point.
// Firebase is already initialised in index.html and exposed on window.__firebase
// This file simply mounts the React app into #root.
// ─────────────────────────────────────────────────────────────────────────────

import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App.jsx";   // ← your FashionStore component

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
