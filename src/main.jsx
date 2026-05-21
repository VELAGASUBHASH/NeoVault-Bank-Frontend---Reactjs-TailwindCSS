import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { store } from "./store/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#111e6e",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#fff",
                            borderRadius: "16px",
                            fontFamily: "'DM Sans', sans-serif",
                        },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);