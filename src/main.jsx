import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./responsive.css";

// Enlever le FOUC prevention une fois React chargé
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enlever la classe de prevention du FOUC après un très court délai (permet aux styles de charger)
setTimeout(() => {
  document.body.classList.remove('fouc-prevention');
  document.body.classList.add('fouc-ready');
}, 50);
