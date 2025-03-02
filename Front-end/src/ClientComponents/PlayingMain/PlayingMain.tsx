import React, { useState, useEffect } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import "./PlayingMain.css";
import { fetchMovies } from "../../services/movie.service";
import { useNavigate } from "react-router-dom";

interface Movie {
    id: number;
    title: string;
    poster: string | null;
    genres: { id: number; name_genre: string }[];
    release_date: string;
    trailer: string | null;
}

interface PlayingMainProps {
    showChill?: (movieId: number) => void;
}

const PlayingMain: React.FC<PlayingMainProps> = ({ showChill }) => {
    const [showMore, setShowMore] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadMovies = async () => {
            try {
                setLoading(true);
                const data = await fetchMovies();
                const formattedMovies = data.now_showing.map((movie: any) => ({
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster || 'https://picsum.photos/300/450',
                    genres: movie.genres,
                    release_date: movie.release_date,
                    trailer: movie.trailer,
                }));
                setMovies(formattedMovies);
            } catch (err) {
                setError("Không thể tải danh sách phim");
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, []);

    const handleMovieClick = (movieId: number) => {
        if (showChill) {
            showChill(movieId);
        } else {
            navigate(`/filmDetail/${movieId}`);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="playingMain main-base">
            {movies.map((movie, index) => (
                <PlayingProduct
                    key={movie.id}
                    className={`item-main ${
                        index >= 4 && !showMore ? "hidden" : ""
                    }`}
                    image={movie.poster || 'https://picsum.photos/300/450'}
                    category={movie.genres[0]?.name_genre || "Khác"}
                    date={new Date(movie.release_date).toLocaleDateString("vi-VN")}
                    startDay={new Date(movie.release_date).toLocaleDateString("vi-VN")}
                    name={movie.title}
                    movieId={movie.id}
                    showChill={() => handleMovieClick(movie.id)}
                />
            ))}
            {movies.length > 4 && (
                <button
                    className="show-more-btn"
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? "Ẩn bớt" : "Xem thêm..."}
                </button>
            )}
        </div>
    );
};

export default PlayingMain;