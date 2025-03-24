// src/ClientComponents/FilmDetail/FilmDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientLayout from "../../page/client/Layout";
import "./FilmDetail.css";
import axios from "axios";

interface MovieDetail {
  id: number;
  title: string;
  poster: string | null;
  genres: { id: number; name_genre: string }[];
  release_date: string;
  description: string | null;
  running_time: string;
  language: string;
  rated: string;
  trailer: string | null;
  directors: { id: number; name_director: string }[];
  actors: { id: number; name_actor: string }[];
}

interface RelatedMovie {
  id: number;
  title: string;
  poster: string | null;
}

const HARD_CODED_RELATED_MOVIES: RelatedMovie[] = [
  {
    id: 1,
    title: "Phim Hành Động 1",
    poster: "https://picsum.photos/200/300?random=1",
  },
  {
    id: 2,
    title: "Phim Hành Động 2",
    poster: "https://picsum.photos/200/300?random=2",
  },
  {
    id: 3,
    title: "Phim Hành Động 3",
    poster: "https://picsum.photos/200/300?random=3",
  },
  {
    id: 4,
    title: "Phim Hành Động 4",
    poster: "https://picsum.photos/200/300?random=4",
  },
  {
    id: 5,
    title: "Phim Hành Động 5",
    poster: "https://picsum.photos/200/300?random=5",
  },
];

const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setError("Không có ID phim");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Sử dụng endpoint movies-details thay vì movies
        const response = await axios.get(`http://localhost:8000/api/movies-details/${id}`);
        console.log("Movie data:", response.data);
        setMovie(response.data.data);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Không thể tải thông tin phim");
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!movie) return <div className="not-found">Không tìm thấy phim</div>;

  const handleViewShowtimesAndBook = () => {
    navigate(`/showtimes/${movie.id}`);
  };

  return (
    <ClientLayout>
      <div className="film-detail">
        <div className="film-header">
          <div className="poster-container">
            <img
              src={movie.poster ? `http://localhost:8000${movie.poster}` : "https://picsum.photos/300/450"}
              alt={movie.title}
              className="film-poster"
            />
          </div>
          <div className="film-info">
            <h1 className="film-title">{movie.title}</h1>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Thể loại:</span>
                <span className="info-value">
                  {movie.genres && movie.genres.length > 0 
                    ? movie.genres.map((g) => g.name_genre).join(", ")
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày phát hành:</span>
                <span className="info-value">
                  {movie.release_date 
                    ? new Date(movie.release_date).toLocaleDateString("vi-VN")
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Thời lượng:</span>
                <span className="info-value">{movie.running_time || "Không có thông tin"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngôn ngữ:</span>
                <span className="info-value">{movie.language || "Không có thông tin"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Đánh giá:</span>
                <span className="info-value">{movie.rated || "Không có thông tin"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Đạo diễn:</span>
                <span className="info-value">
                  {movie.directors && movie.directors.length > 0
                    ? movie.directors[0]?.name_director
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Diễn viên:</span>
                <span className="info-value">
                  {movie.actors && movie.actors.length > 0
                    ? movie.actors.map((a) => a.name_actor).join(", ")
                    : "Không có thông tin"}
                </span>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="action-btn book-ticket-btn"
                onClick={handleViewShowtimesAndBook}
              >
                Xem lịch chiếu và đặt vé
              </button>
            </div>
          </div>
        </div>
        <div className="film-description">
          <h2 className="section-title">Mô tả</h2>
          <p>{movie.description || "Không có mô tả"}</p>
        </div>
        {movie.trailer && (
          <div className="film-trailer">
            <h2 className="section-title">Trailer</h2>
            <div className="trailer-container">
              <iframe
                width="100%"
                height="400"
                src={movie.trailer}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
        {HARD_CODED_RELATED_MOVIES.length > 0 && (
          <div className="related-movies">
            <h2 className="section-title">Phim cùng thể loại</h2>
            <div className="related-movies-grid">
              {HARD_CODED_RELATED_MOVIES.map((relatedMovie) => (
                <div key={relatedMovie.id} className="related-movie-card">
                  <img
                    src={relatedMovie.poster || "https://picsum.photos/200/300"}
                    alt={relatedMovie.title}
                    className="related-movie-poster"
                    onClick={() => navigate(`/filmDetail/${relatedMovie.id}`)}
                  />
                  <p className="related-movie-title">{relatedMovie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default FilmDetail;
