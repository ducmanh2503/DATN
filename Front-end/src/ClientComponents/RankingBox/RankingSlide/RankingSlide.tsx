import { useRef, useState, useEffect } from "react";
import {
  faChevronLeft,
  faChevronRight,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RankingProduct from "../RankingProduct/RankingProduct";
import clsx from "clsx";
import { fetchMoviesRanking, MovieRanking } from "../../../services/FilmRanking.service";

import styles from "./RankingSlide.module.css";

const RankingSlide = () => {
  const [movies, setMovies] = useState<MovieRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy dữ liệu xếp hạng phim khi component được mount
  useEffect(() => {
    const getMoviesRanking = async () => {
      try {
        setLoading(true);
        const response = await fetchMoviesRanking();
        if (response && response.data) {
          // Thêm một placeholder cho movie_id nếu không có
          const moviesWithFallbackId = response.data.map((movie: MovieRanking) => ({
            ...movie,
            // Nếu không có movie_id, sử dụng undefined
            movie_id: movie.movie_id || undefined
          }));
          setMovies(moviesWithFallbackId);
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu xếp hạng phim:", err);
        setError("Không thể tải dữ liệu xếp hạng phim");
        setLoading(false);
      }
    };

    getMoviesRanking();
  }, []);

  const [index, setIndex] = useState(0);
  const visibleItems = 3;
  const listRef = useRef(null);

  const handleNext = () => {
    if (index + visibleItems < movies.length) {
      setIndex(index + visibleItems);
    }
  };

  const handlePrev = () => {
    if (index - visibleItems >= 0) {
      setIndex(index - visibleItems);
    } else {
      setIndex(0);
    }
  };

  // Hiển thị thông báo loading
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải dữ liệu xếp hạng phim...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có dữ liệu
  if (movies.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <p>Chưa có dữ liệu xếp hạng phim</p>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách xếp hạng phim
  return (
    <div>
      <div className={clsx(styles.rankingHeader)}>
        <h2 className={styles.rankingTitle}>
          <FontAwesomeIcon icon={faTrophy} className={styles.trophyIcon} />
          Xếp hạng phim tháng {movies[0]?.month_year || ""}
        </h2>
      </div>
      <div className={clsx(styles.carouselContainer)}>
        <button
          className={clsx(styles.prevBtn)}
          onClick={handlePrev}
          disabled={index === 0}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className={clsx(styles.carouselWrapper)}>
          <div
            className={clsx(styles.carouselList)}
            ref={listRef}
            style={{
              transform: `translateX(-${index * (310 + 75)}px)`,
            }}
          >
            {movies.map((movie, idx) => (
              <RankingProduct
                key={idx}
                className={clsx(
                  styles.carouselItem,
                  idx === 0 && styles.firstPlace,
                  idx === 1 && styles.secondPlace,
                  idx === 2 && styles.thirdPlace
                )}
                number={idx + 1}
                name={movie.movie_title}
                tickets={movie.total_tickets}
                movieId={movie.movie_id}
                image="https://img.freepik.com/free-vector/cinema-realistic-poster-with-illuminated-bucket-popcorn-drink-3d-glasses-reel-tickets-blue-background-with-glares-vector-illustration_1284-77013.jpg"
              />
            ))}
          </div>
        </div>
        <button
          className={clsx(styles.nextBtn)}
          onClick={handleNext}
          disabled={index + visibleItems >= movies.length}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default RankingSlide;
