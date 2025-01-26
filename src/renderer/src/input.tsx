import "./assets/main.css";

import React from "react";
import ReactDOM from "react-dom/client";
import Goal from "./components/pages/Goal";

ReactDOM.createRoot(document.getElementById(`root`) as HTMLElement).render(
  <React.StrictMode>
    <Goal />
  </React.StrictMode>
);
