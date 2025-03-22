import {
    createBrowserRouter,
    Navigate,
    Outlet,
    useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Home from "./page/client/Home/home";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import AdminLayout from "./page/admin/AdminLayout";
import FilmManage from "./page/admin/FilmManage/FilmManage";
import StoppedMovies from "./page/admin/FilmManage/StoppedMovies";
import AddFilm from "./page/admin/FilmManage/AddFilm";
import CalendarManage from "./page/admin/CalendarShow/CalendarManage";
import ShowtimesManage from "./page/admin/Showtimes/ShowtimesManage";
import ActorsManage from "./page/admin/Actors/ActorsManage";
import GenresManage from "./page/admin/Genres/GenresManage";
import DirectorsManage from "./page/admin/Directors/DirectorsManage";
import SeatPage from "./page/admin/Seat/SeatPage";
import RoomPage from "./page/admin/RoomPage/RoomPage";
import FilmDetail from "./ClientComponents/FilmDetail/FilmDetail";
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import GoogleCallback from "./page/auth/GoogleCallback";
import authService from "./services/auth.service";
import Booking from "./page/client/Booking/Booking";
import ForgotPassword from "./page/auth/ForgotPassword";
import TicketsPrice from "./page/admin/TicketsPrice/TicketsPrice";
import BoxNumbers from "./ClientComponents/CalendarMovies/BoxNumbers/BoxNumbers";
import ArticleList from "./page/admin/Article/Article";
import CreatePost from "./page/admin/Article/CreateArticle";
import UserProfile from "./ClientComponents/UserProfile/UserProfile";
import DiscountManagement from "./page/admin/DisCound-Code/DisCount-code";
import OrderList from "./page/admin/Order/OrderList";
import OrderDetail from "./page/admin/Order/Orderdetail";
import Userlist from "./page/admin/Userpage/Userlist";
import Useradd from "./page/admin/Userpage/Useradd";
import UserDetail from "./page/admin/Userpage/Userdetails";
import Combo from "./page/admin/ComboPage/ComboPage";
import SuccesResult from "./ClientComponents/Booking/ResultPayment/SuccesResult/SuccesResult";
import ErrorResult from "./ClientComponents/Booking/ResultPayment/ErrorResult/ErrorResult";
import LayoutPaymentResult from "./ClientComponents/Booking/ResultPayment/LayoutPaymentResult";

axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Hàm thiết lập interceptors cho axios
const setupAxiosInterceptors = (navigate: ReturnType<typeof useNavigate>) => {
    const requestInterceptor = axios.interceptors.request.use(
        (config) => {
            const token = authService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log("[Axios] Token đã được gắn:", token);
            } else {
                console.warn("[Axios] Không tìm thấy token trong request");
            }
            return config;
        },
        (error) => {
            console.error("[Axios Request Error]:", error);
            return Promise.reject(error);
        }
    );

    const responseInterceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const { response } = error;
            if (response) {
                if (response.status === 401) {
                    console.error("Token hết hạn hoặc không hợp lệ");
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user_role");
                    navigate("/auth/login", {
                        state: {
                            message:
                                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                        },
                        replace: true,
                    });
                } else if (response.status === 403) {
                    console.error("Không có quyền truy cập");
                    navigate("/", {
                        state: {
                            message: "Bạn không có quyền truy cập trang này.",
                        },
                        replace: true,
                    });
                }
            }
            return Promise.reject(error);
        }
    );

    return () => {
        axios.interceptors.request.eject(requestInterceptor);
        axios.interceptors.response.eject(responseInterceptor);
    };
};

// Component hiển thị khi đang tải
const LoadingComponent = () => (
    <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
        }}
    >
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>
            Đang tải...
        </div>
        <div
            style={{
                width: "50px",
                height: "50px",
                border: "5px solid #f3f3f3",
                borderTop: "5px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
            }}
        ></div>
        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
);

// Route bảo vệ cho các trang yêu cầu đăng nhập
const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authStatus = authService.isAuthenticated();
                if (!authStatus) {
                    console.log("Chưa đăng nhập hoặc không có token");
                    navigate("/auth/login", {
                        state: { message: "Vui lòng đăng nhập để tiếp tục." },
                        replace: true,
                    });
                    return;
                }

                const userRole = authService.getRole();
                setIsAuthenticated(true);
                setRole(userRole);

                if (requiredRole && userRole !== requiredRole) {
                    console.log(
                        `Vai trò không khớp: ${userRole} !== ${requiredRole}`
                    );
                    navigate("/", {
                        state: {
                            message: "Bạn không có quyền truy cập trang này.",
                        },
                        replace: true,
                    });
                    return;
                }

                const cleanup = setupAxiosInterceptors(navigate);
                setLoading(false);

                return cleanup;
            } catch (error) {
                console.error("Lỗi xác thực:", error);
                setIsAuthenticated(false);
                navigate("/auth/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate, requiredRole]);

    if (loading) {
        return <LoadingComponent />;
    }

    return isAuthenticated && (role === requiredRole || !requiredRole) ? (
        <Outlet />
    ) : (
        <Navigate to="/auth/login" replace />
    );
};

// Route công khai cho các trang không yêu cầu đăng nhập
const PublicRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authStatus = authService.isAuthenticated();
                setIsAuthenticated(authStatus);

                if (authStatus) {
                    const userRole = authService.getRole();
                    const redirectUrl = userRole === "admin" ? "/admin" : "/";
                    navigate(redirectUrl, { replace: true });
                }
            } catch (error) {
                console.error("Lỗi kiểm tra auth:", error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <LoadingComponent />;
    }

    return !isAuthenticated ? <Outlet /> : null;
};

// Cấu hình router
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/playingFilm",
        element: <PlayingFilm />,
    },
    {
        path: "/comingFilm",
        element: <ComingFilm />,
    },
    {
        path: "/cinemaFilm",
        element: <CinemaForest />,
    },
    {
        path: "/filmDetail/:id",
        element: <FilmDetail />,
    },
    {
        path: "/booking/:id",
        element: <Booking />,
        children: [
            {
                path: "payment-result",
                element: <LayoutPaymentResult />,
            },
        ],
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/auth/login",
                element: <Login />,
            },
            {
                path: "/auth/register",
                element: <Register />,
            },
            {
                path: "/auth/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/auth/google/callback",
                element: <GoogleCallback />,
            },
        ],
    },
    {
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
            {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <FilmManage />,
                    },
                    {
                        path: "film",
                        element: <FilmManage />,
                    },
                    {
                        path: "addFilm",
                        element: <AddFilm />,
                    },
                    {
                        path: "stoppedMovie",
                        element: <StoppedMovies />,
                    },
                    {
                        path: "calendarShow",
                        element: <CalendarManage />,
                    },
                    {
                        path: "showtimes",
                        element: <ShowtimesManage />,
                    },
                    {
                        path: "actors",
                        element: <ActorsManage />,
                    },
                    {
                        path: "directors",
                        element: <DirectorsManage />,
                    },
                    {
                        path: "genre",
                        element: <GenresManage />,
                    },
                    {
                        path: "seats",
                        element: <SeatPage />,
                    },
                    {
                        path: "rooms",
                        element: <RoomPage />,
                    },
                    {
                        path: "articlelist",
                        element: <ArticleList />,
                    },
                    {
                        path: "create-article",
                        element: <CreatePost />,
                    },
                    {
                        path: "discount-code",
                        element: <DiscountManagement />,
                    },
                    {
                        path: "ticketsPrice",
                        element: <TicketsPrice></TicketsPrice>,
                    },
                    {
                        path: "orders",
                        element: <OrderList />,
                    },
                    {
                        path: "order/orderDetail",
                        element: <OrderDetail />,
                    },
                    {
                        path: "users",
                        element: <Userlist />,
                    },
                    {
                        path: "userpage/useradd",
                        element: <Useradd />,
                    },
                    {
                        path: "userpage/userdetail",
                        element: <UserDetail />,
                    },
                    {
                        path: "combo",
                        element: <Combo />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;
