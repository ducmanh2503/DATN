import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./reset.css";
import "./App.css";
import { router } from "./routers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./ClientComponents/UseContext/ContextState";
// import { Provider } from "react-redux";
// import { store } from "./redux/store";

const client = new QueryClient();
createRoot(document.getElementById("root")!).render(
    // <Provider store={store}>
    <QueryClientProvider client={client}>
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    </QueryClientProvider>
    // </Provider>
);
