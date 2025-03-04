import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import axios from 'axios';

// Hàm kiểm tra vai trò từ token
const getUserRole = async (): Promise<string | null> => {
  const token = authService.getToken();
  if (!token) {
    console.log('No token found');
    return null;
  }

  try {
    const response = await axios.get('http://localhost:8000/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('API /user response:', response.data);
    // Lấy role từ users[0] thay vì trực tiếp từ response.data
    const userRole = response.data.users && response.data.users.length > 0 ? response.data.users[0].role : null;
    return userRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    localStorage.removeItem('auth_token');
    return null;
  }
};

// Component bảo vệ route với useEffect
const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      console.log('Checking authentication:', { isAuthenticated, requiredRole });

      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to /auth/login');
        navigate('/auth/login', { replace: true });
        setLoading(false);
        return;
      }

      const userRole = await getUserRole();
      console.log('User role fetched:', userRole);

      setRole(userRole);
      setLoading(false);

      if (requiredRole && userRole !== requiredRole) {
        console.log(`Role mismatch: ${userRole} !== ${requiredRole}, redirecting to /`);
        navigate('/', { replace: true });
      } else {
        console.log('Role matched or no role required, rendering Outlet');
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    console.log('Loading state active');
    return <div>Loading...</div>;
  }

  return role === requiredRole || !requiredRole ? <Outlet /> : null;
};

export const router = createBrowserRouter([
  // Route công khai
  { path: '/', element: <Home /> },
  { path: '/playingFilm', element: <PlayingFilm /> },
  { path: '/comingFilm', element: <ComingFilm /> },
  { path: '/cinemaFilm', element: <CinemaForest /> },
  { path: '/filmDetail/:id', element: <FilmDetail /> },
  { path: '/showtimes/:movieId', element: <Showtimes /> },
  { path: '/booking/:showtimeId/:roomId', element: <Booking /> },
  { path: '/payment/:showtimeId', element: <Payment /> },
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/register', element: <Register /> },

  // Route admin
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <FilmManage /> }, // Trang mặc định khi vào /admin
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