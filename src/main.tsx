import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";


try {
    const root = document.getElementById("root");
    
    if (!root) throw new Error("Root element not found");

    createRoot(root).render(<App />);
    
} catch (e) {
    console.error("Error in main:", e);
}
