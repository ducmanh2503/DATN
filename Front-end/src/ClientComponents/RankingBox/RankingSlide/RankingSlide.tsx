import React, { useRef, useState, useEffect } from "react";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RankingProduct from "../RankingProduct/RankingProduct";
import "./RankingSlide.css";

interface Movie {
  id: number;
  title: string;
  poster: string;
  ticket_count?: number;
}

interface Product {
  id: number;
  name: string;
  img: string;
}

const RankingSlide = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex] = useState(0);
  const visibleItems = 3;
  const listRef = useRef(null);

  useEffect(() => {
    const fetchRankingMovies = async () => {
      try {
        // Thử lấy danh sách phim từ API movies-index trước
        const response = await fetch("http://localhost:8000/api/movies-index");
        const data = await response.json();

        // Kiểm tra xem có dữ liệu phim đang chiếu không
        if (data && data.now_showing && Array.isArray(data.now_showing)) {
          // Chuyển đổi dữ liệu sang định dạng Product
          const mappedProducts = data.now_showing.map((movie: Movie) => ({
            id: movie.id,
            name: movie.title,
            img: movie.poster,
          }));

          // Cập nhật state với danh sách phim
          setProducts(mappedProducts);
        } else {
          console.error("Không có dữ liệu phim hợp lệ");
          setProducts([]); // Set mảng rỗng nếu không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phim:", error);
        setProducts([]); // Set mảng rỗng khi có lỗi
      }
    };

    fetchRankingMovies();
  }, []);

  const handleNext = () => {
    if (index + visibleItems < products.length) {
      setIndex(index + visibleItems);
    }
  };

  const handlePrev = () => {
    if (index + visibleItems >= 0) {
      setIndex(index - visibleItems);
    }
  };

  return (
    <div>
      <div className="carousel-container">
        <button
          className="prev-btn"
          onClick={handlePrev}
          disabled={index === 0}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="carousel-wrapper">
          <div
            className="carousel-list"
            ref={listRef}
            style={{
              transform: `translateX(-${index * (310 + 75)}px)`,
            }}
          >
            {products.map((product, index) => (
              <RankingProduct
                key={product.id}
                className="carousel-item"
                number={index + 1}
                name={product.name}
                image={product.img}
                id={product.id}
              ></RankingProduct>
            ))}
          </div>
        </div>
        <button
          className="next-btn"
          onClick={handleNext}
          disabled={index + visibleItems >= products.length}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default RankingSlide;
