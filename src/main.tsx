import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// Drop the boot splash after the first commit; it covered the WebView while
// the JS bundle loaded (noticeable in dev mode).
requestAnimationFrame(() => {
  document.getElementById("splash")?.remove();
});
