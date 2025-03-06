import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
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

// Cấu hình mặc định cho axios
axios.defaults.baseURL = 'http://your-api-url'; // Thay bằng URL API của bạn
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Middleware xử lý lỗi token
const setupAxiosInterceptors = (navigate: ReturnType<typeof useNavigate>) => {
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[Axios] Token đã được gắn:', token);
      } else {
        console.warn('[Axios] Không tìm thấy token trong request');
      }
      return config;
    },
    (error) => {
      console.error('[Axios Request Error]:', error);
      return Promise.reject(error);
    }
  );

  const responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      if (response) {
        if (response.status === 401) {
          console.error('Token hết hạn hoặc không hợp lệ');
          authService.logout();
          navigate('/auth/login', { 
            state: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
            replace: true 
          });
        } else if (response.status === 403) {
          console.error('Không có quyền truy cập');
          navigate('/', { 
            state: { message: 'Bạn không có quyền truy cập trang này.' },
            replace: true 
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

// Route bảo vệ
const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = authService.isAuthenticated();
        if (!authStatus) {
          console.log('Chưa đăng nhập hoặc không có token');
          navigate('/auth/login', { 
            state: { message: 'Vui lòng đăng nhập để tiếp tục.' },
            replace: true 
          });
          return;
        }

        const userRole = authService.getRole();
        setIsAuthenticated(true);
        setRole(userRole);
        
        if (requiredRole && userRole !== requiredRole) {
          console.log(`Vai trò không khớp: ${userRole} !== ${requiredRole}`);
          navigate('/', { 
            state: { message: 'Bạn không có quyền truy cập trang này.' },
            replace: true 
          });
          return;
        }

        const cleanup = setupAxiosInterceptors(navigate);
        setLoading(false);

        return cleanup;
      } catch (error) {
        console.error('Lỗi xác thực:', error);
        setIsAuthenticated(false);
        navigate('/auth/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return isAuthenticated && (role === requiredRole || !requiredRole) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

// Route công khai
const PublicRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = authService.isAuthenticated();
        setIsAuthenticated(authStatus);

        if (authStatus) {
          const userRole = authService.getRole();
          navigate(userRole === 'admin' ? '/admin' : '/', { replace: true });
        }
      } catch (error) {
        console.error('Lỗi kiểm tra auth:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return !isAuthenticated ? <Outlet /> : null;
};

// Cấu hình router chính
export const router = createBrowserRouter([
  // Routes công khai không cần auth
  { path: '/', element: <Home /> },
  { path: '/playingFilm', element: <PlayingFilm /> },
  { path: '/comingFilm', element: <ComingFilm /> },
  { path: '/cinemaFilm', element: <CinemaForest /> },
  { path: '/filmDetail/:id', element: <FilmDetail /> },
  { path: '/showtimes/:movieId', element: <Showtimes /> },

  // Routes yêu cầu đăng nhập (nhưng không cần role admin)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/booking/:showtimeId/:roomId', element: <Booking /> },
      { path: '/payment/:showtimeId', element: <Payment /> },
    ],
  },

  // Routes auth (login/register)
  {
    element: <PublicRoute />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
    ],
  },

  // Routes admin (yêu cầu role admin)
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: 'film', element: <FilmManage /> },
          { path: 'addFilm', element: <AddFilm /> },
          { path: 'stoppedMovie', element: <StoppedMovies /> },
          { path: 'calendarShow', element: <CalendarManage /> },
          { path: 'showtimes', element: <ShowtimesManage /> },
          { path: 'actors', element: <ActorsManage /> },
          { path: 'directors', element: <DirectorsManage /> },
          { path: 'genre', element: <GenresManage /> },
          { path: 'seats', element: <SeatPage /> },
          { path: 'rooms', element: <RoomPage /> },
        ],
      },
    ],
  },
]);