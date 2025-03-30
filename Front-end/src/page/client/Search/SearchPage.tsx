<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Tag, Spin, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../../../services/search.service';
import { SearchMovie, MovieGenre, MovieActor } from '../../../types/search.types';
import { URL_IMAGE } from '../../../config/ApiConfig';
import styles from './SearchPage.module.css';
=======
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Tag, Spin, Empty, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../../../services/search.service";
import {
  SearchMovie,
  MovieGenre,
  MovieActor,
} from "../../../types/search.types";
import { URL_IMAGE } from "../../../config/ApiConfig";
import styles from "./SearchPage.module.css";
>>>>>>> main

const { Search } = Input;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<SearchMovie[]>([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  useEffect(() => {
    const currentKeyword = searchParams.get('keyword');
=======
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  useEffect(() => {
    const currentKeyword = searchParams.get("keyword");
>>>>>>> main
    if (currentKeyword) {
      setKeyword(currentKeyword);
      performSearch(currentKeyword);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
<<<<<<< HEAD
    
    setLoading(true);
    
=======

    setLoading(true);

>>>>>>> main
    try {
      const results = await searchMovies({ keyword: searchTerm });
      setSearchResults(results);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phim:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
<<<<<<< HEAD
    
=======

>>>>>>> main
    // Update URL with new search term
    setSearchParams({ keyword: value });
    performSearch(value);
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/filmDetail/${movieId}`);
  };

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchHeader}>
        <h1>Tìm kiếm phim</h1>
        <Search
          className={styles.searchInput}
          placeholder="Tìm kiếm phim, diễn viên, đạo diễn, thể loại..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className={styles.searchResultsContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : searchResults.length === 0 ? (
<<<<<<< HEAD
          <Empty 
            description={
              <span>
                {keyword ? "Không tìm thấy kết quả phù hợp" : "Vui lòng nhập từ khóa để tìm kiếm"}
              </span>
            } 
=======
          <Empty
            description={
              <span>
                {keyword
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Vui lòng nhập từ khóa để tìm kiếm"}
              </span>
            }
>>>>>>> main
          />
        ) : (
          <>
            <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
            <p>Tìm thấy {searchResults.length} kết quả</p>
<<<<<<< HEAD
            
            <div className={styles.movieGrid}>
              {searchResults.map((movie) => (
                <Card 
=======

            <div className={styles.movieGrid}>
              {searchResults.map((movie) => (
                <Card
>>>>>>> main
                  key={movie.id}
                  hoverable
                  className={styles.movieCard}
                  cover={
<<<<<<< HEAD
                    <img 
                      alt={movie.title} 
                      src={`${URL_IMAGE}${movie.poster}`} 
=======
                    <img
                      alt={movie.title}
                      src={`${URL_IMAGE}${movie.poster}`}
>>>>>>> main
                      className={styles.moviePoster}
                    />
                  }
                  onClick={() => handleMovieClick(movie.id)}
                >
<<<<<<< HEAD
                  <Card.Meta 
                    title={movie.title} 
=======
                  <Card.Meta
                    title={movie.title}
>>>>>>> main
                    description={
                      <div className={styles.movieDetails}>
                        <div>
                          <strong>Ngày phát hành:</strong> {movie.release_date}
                        </div>
                        <div className={styles.tagsContainer}>
                          <strong>Thể loại:</strong>
                          {movie.genres.map((genre: MovieGenre) => (
<<<<<<< HEAD
                            <Tag key={genre.id} color="blue">{genre.name_genre}</Tag>
=======
                            <Tag key={genre.id} color="blue">
                              {genre.name_genre}
                            </Tag>
>>>>>>> main
                          ))}
                        </div>
                        <div className={styles.tagsContainer}>
                          <strong>Diễn viên:</strong>
                          {movie.actors.slice(0, 3).map((actor: MovieActor) => (
<<<<<<< HEAD
                            <Tag key={actor.id} color="green">{actor.name_actor}</Tag>
                          ))}
                          {movie.actors.length > 3 && <Tag color="green">+{movie.actors.length - 3}</Tag>}
                        </div>
                        <div>
                          <strong>Đạo diễn:</strong> {movie.directors?.name_director || "Không có thông tin"}
=======
                            <Tag key={actor.id} color="green">
                              {actor.name_actor}
                            </Tag>
                          ))}
                          {movie.actors.length > 3 && (
                            <Tag color="green">+{movie.actors.length - 3}</Tag>
                          )}
                        </div>
                        <div>
                          <strong>Đạo diễn:</strong>{" "}
                          {movie.directors?.name_director ||
                            "Không có thông tin"}
>>>>>>> main
                        </div>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
