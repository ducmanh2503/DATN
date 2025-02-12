import { createBrowserRouter } from "react-router-dom";
import Home from "./page/client/Home/home";
import InfomationBox from "./ClientComponents/InfomationBox/InfomationBox";
import RankingBox from "./ClientComponents/RankingBox/RankingBox";
import InfomationProduct from "./ClientComponents/InfomationBox/InfomationProduct/InfomationProduct";

export const router = createBrowserRouter([
    { path: "/", element: <Home></Home> },

    { path: "/information", element: <InfomationProduct></InfomationProduct> },
    { path: "/check", element: <InfomationBox></InfomationBox> },
    { path: "/check1", element: <RankingBox></RankingBox> },
]);
