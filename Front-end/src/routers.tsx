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
import ForgotPassword from './page/auth/ForgotPassword';
import authService from './services/auth.service';
import OrderList from './page/admin/Order/OrderList';
import OrderDetail from './page/admin/Order/Orderdetail';
import Userlist from './page/admin/Userpage/Userlist';
import Useradd from './page/admin/Userpage/Useradd';
// Set up global axios interceptors for all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.url?.startsWith('http://localhost:8000/api')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Global Axios] Token đã được gắn:', token);
    }
    return config;
  },
  (error) => {
    console.error('[Global Axios] Lỗi trong interceptor request:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url?.startsWith('http://localhost:8000/api')) {
      console.error('[Global Axios] Unauthorized - Chuyển hướng đến trang đăng nhập');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Cấu hình hai instance của Axios
export const protectedApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const publicApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Thiết lập interceptors ngay sau khi tạo instances
protectedApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Protected API] Token đã được gắn:', token);
    } else {
      console.warn('[Protected API] Không tìm thấy token trong request');
    }
    return config;
  },
  (error) => {
    console.error('[Protected API Request Error]:', error);
    return Promise.reject(error);
  }
);

protectedApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      if (response.status === 401) {
        console.error('Token hết hạn hoặc không hợp lệ');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        window.location.href = '/auth/login';
      } else if (response.status === 403) {
        console.error('Không có quyền truy cập');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Component hiển thị khi đang tải
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column'
  }}>
    <div style={{ fontSize: '20px', marginBottom: '10px' }}>Đang tải...</div>
    <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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

        setLoading(false);
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
          const redirectUrl = userRole === 'admin' ? '/admin' : '/';
          navigate(redirectUrl, { replace: true });
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
    return <LoadingComponent />;
  }

  return !isAuthenticated ? <Outlet /> : null;
};

// Cấu hình router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/playingFilm',
    element: <PlayingFilm />,
  },
  {
    path: '/comingFilm',
    element: <ComingFilm />,
  },
  {
    path: '/cinemaFilm',
    element: <CinemaForest />,
  },
  {
    path: '/filmDetail/:id',
    element: <FilmDetail />,
  },
  {
    path: '/showtimes/:movieId',
    element: <Showtimes />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/booking/:showtimeId/:roomId',
        element: <Booking />,
      },
      {
        path: '/payment/:showtimeId',
        element: <Payment />,
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/auth/login',
        element: <Login />,
      },
      {
        path: '/auth/register',
        element: <Register />,
      },
      {
        path: '/auth/forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <FilmManage />,
          },
          {
            path: 'film',
            element: <FilmManage />,
          },
          {
            path: 'addFilm',
            element: <AddFilm />,
          },
          {
            path: 'stoppedMovie',
            element: <StoppedMovies />,
          },
          {
            path: 'calendarShow',
            element: <CalendarManage />,
          },
          {
            path: 'showtimes',
            element: <ShowtimesManage />,
          },
          {
            path: 'actors',
            element: <ActorsManage />,
          },
          {
            path: 'directors',
            element: <DirectorsManage />,
          },
          {
            path: 'genre',
            element: <GenresManage />,
          },
          {
            path: 'seats',
            element: <SeatPage />,
          },
          {
            path: 'rooms',
            element: <RoomPage />,
          },
          {
            path: 'orders',
            element: <OrderList />,
          },
          {
            path: 'order/orderDetail',
            element: <OrderDetail />,
          },
          {
            path: 'users',
            element: <Userlist />,
          },
          {
            path : 'userpage/useradd',
            element : <Useradd />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;