import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// NOTE: StrictMode is intentionally disabled. With React 19 StrictMode in dev,
// WebKit/Safari permanently hangs (synchronous engine loop, timers starved) as
// soon as any React state update happens during a pressed-pointer move stream —
// e.g. dragging the /travel globe or panning the map. Verified via Playwright
// WebKit bisection: refs-only drag survives, a single setState during drag
// hangs; production builds and Chromium are unaffected either way.
// Re-enable only together with a render-free (ref + imperative texture update)
// drag implementation.
createRoot(document.getElementById("root")!).render(<App />);
