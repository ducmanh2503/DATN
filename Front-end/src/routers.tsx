import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios để chỉnh sửa mặc định
import Home from './page/client/Home/home';
import PlayingFilm from './page/client/PlayingFilm/PlayingFilm';
import ComingFilm from './page/client/ComingFilm/ComingFilm';
import CinemaForest from './page/client/CinemaForest/CinemaForest';
import AdminLayout from './page/admin/AdminLayout';
import FilmManage from './page/admin/FilmManage/FilmManage';
import StoppedMovies from './page/admin/FilmManage/StoppedMovies';
import AddFilm from './page/admin/FilmManage/AddFilm';
import CalendarManage from './page/admin/CalendarShow/CalendarManage';
import ShowtimesManage from './page/admin/Showtimes/ShowtimesManage';
import ActorsManage from './page/admin/Actors/ActorsManage';
import GenresManage from './page/admin/Genres/GenresManage';
import DirectorsManage from './page/admin/Directors/DirectorsManage';
import SeatPage from './page/admin/Seat/SeatPage';
import RoomPage from './page/admin/RoomPage/RoomPage';
import FilmDetail from './ClientComponents/FilmDetail/FilmDetail';
import Showtimes from './ClientComponents/Showtimes/Showtimes';
import Booking from './ClientComponents/Booking/Booking';
import Payment from './ClientComponents/Payment/Payment';
import Login from './page/auth/Login';
import Register from './page/auth/Register';
import authService from './services/auth.service';

// Route bảo vệ cho các trang yêu cầu đăng nhập (như admin)
const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = authService.isAuthenticated();
        console.log('Kiểm tra xác thực:', { authStatus, requiredRole });

        if (!authStatus) {
          console.log('Chưa đăng nhập, chuyển hướng tới /auth/login');
          navigate('/auth/login', { replace: true });
          setLoading(false);
          return;
        }

        const userRole = authService.getRole();
        console.log('Vai trò người dùng:', userRole);

        setIsAuthenticated(true);
        setRole(userRole);
        setLoading(false);

        if (requiredRole && userRole !== requiredRole) {
          console.log(`Vai trò không khớp: ${userRole} !== ${requiredRole}, chuyển hướng tới /`);
          navigate('/', { replace: true });
          return;
        }

        console.log('Vai trò khớp hoặc không yêu cầu vai trò, thiết lập interceptor Axios');

        const interceptor = axios.interceptors.request.use(
          (config) => {
            const token = authService.getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              console.log('[ProtectedRoute] Gắn token vào request:', token);
            } else {
              console.log('[ProtectedRoute] Không tìm thấy token cho request');
            }
            return config;
          },
          (error) => Promise.reject(error)
        );

        return () => {
          axios.interceptors.request.eject(interceptor);
          console.log('[ProtectedRoute] Đã dọn dẹp interceptor Axios');
        };
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        setIsAuthenticated(false);
        setLoading(false);
        navigate('/auth/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    console.log('Trạng thái đang tải');
    return <div>Đang tải...</div>;
  }

  return isAuthenticated && (role === requiredRole || !requiredRole) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

// Route công khai cho các trang auth (ngăn truy cập khi đã đăng nhập)
const PublicRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = authService.isAuthenticated();
        console.log('Kiểm tra xác thực cho PublicRoute:', { authStatus });

        setIsAuthenticated(authStatus);
        setLoading(false);

        if (authStatus) {
          const userRole = authService.getRole();
          const redirectUrl = userRole === 'admin' ? '/admin' : '/';
          console.log('Đã đăng nhập, chuyển hướng tới:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực trong PublicRoute:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    console.log('Trạng thái đang tải trong PublicRoute');
    return <div>Đang tải...</div>;
  }

  return !isAuthenticated ? <Outlet /> : null;
};

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/playingFilm', element: <PlayingFilm /> },
  { path: '/comingFilm', element: <ComingFilm /> },
  { path: '/cinemaFilm', element: <CinemaForest /> },
  { path: '/filmDetail/:id', element: <FilmDetail /> },
  { path: '/showtimes/:movieId', element: <Showtimes /> },
  { path: '/booking/:showtimeId/:roomId', element: <Booking /> },
  { path: '/payment/:showtimeId', element: <Payment /> },

  {
    element: <PublicRoute />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "film", element: <FilmManage /> },
      { path: "addFilm", element: <AddFilm /> },
      { path: "stoppedMovie", element: <StoppedMovies /> },
      { path: "calendarShow", element: <CalendarManage /> },
      { path: "showtimes", element: <ShowtimesManage /> },
      { path: "actors", element: <ActorsManage /> },
      { path: "directors", element: <DirectorsManage /> },
      { path: "genre", element: <GenresManage /> },
      { path: "seats", element: <SeatPage /> },
      { path: "rooms", element: <RoomPage /> },
    ],
  },
]);
