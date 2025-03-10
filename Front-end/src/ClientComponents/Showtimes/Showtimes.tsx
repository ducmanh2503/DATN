import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientLayout from "../../page/client/Layout";
import { fetchShowtimesByMovie } from "../../services/showtime.service";
import "./Showtimes.css";

interface Showtime {
  id: number;
  movie_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  date: string;
  price: number;
}

const Showtimes = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadShowtimes = async () => {
      if (!movieId) {
        setError("Không có ID phim");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetchShowtimesByMovie(movieId);
        // Ensure we're handling the data structure correctly
        const showtimeData = response?.data || [];
        setShowtimes(Array.isArray(showtimeData) ? showtimeData : []);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
        setError("Không thể tải lịch chiếu");
      } finally {
        setLoading(false);
      }
    };

    loadShowtimes();
  }, [movieId]);

  const handleSelectShowtime = (showtimeId: number, roomId: number) => {
    navigate(`/booking/${showtimeId}/${roomId}`);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  // Check if showtimes exists and has items before rendering
  return (
    <ClientLayout>
      <div className="showtimes-container">
        <h1>Lịch chiếu phim</h1>
        <div className="showtimes-grid">
          {showtimes && showtimes.length > 0 ? (
            showtimes.map((showtime) => (
              <div key={showtime.id} className="showtime-card">
                <p>
                  Ngày: {new Date(showtime.date).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  Giờ bắt đầu:{" "}
                  {new Date(showtime.start_time).toLocaleTimeString("vi-VN")}
                </p>
                <p>
                  Giờ kết thúc:{" "}
                  {new Date(showtime.end_time).toLocaleTimeString("vi-VN")}
                </p>
                <p>Phòng: {showtime.room_id}</p>
                <p>Giá vé: {showtime.price} VND</p>
                <button
                  className="book-btn"
                  onClick={() =>
                    handleSelectShowtime(showtime.id, showtime.room_id)
                  }
                >
                  Chọn suất và đặt vé
                </button>
              </div>
            ))
          ) : (
            <div className="not-found">Không có lịch chiếu</div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default Showtimes;
