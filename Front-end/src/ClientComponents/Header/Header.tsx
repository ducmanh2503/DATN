import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faFilm as faSolidFilm } from "@fortawesome/free-solid-svg-icons";
import {
  AudioOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Input, message, List } from "antd";
import type { GetProps } from "antd";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import authService from "../../services/auth.service";
import styles from "./header.module.css";
import { searchMovies } from "../../services/search.service";
import { SearchMovie, MovieGenre } from "../../types/search.types";
import { URL_IMAGE } from "../../config/ApiConfig";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: "#1677ff",
    }}
  />
);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const [suggestedMovies, setSuggestedMovies] = useState<SearchMovie[]>([]);
  const [keyword, setKeyword] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const userName = localStorage.getItem("user_name") || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSuggestedMovies([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await authService.logout();
      message.success(response.message || "Đăng xuất thành công!");
      navigate("/auth/login");
    } catch (error: any) {
      console.error("[Header] Logout Error:", error);
      message.error(error.message || "Đăng xuất thất bại.");
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestedMovies([]);
    }
  };

  const fetchSuggestions = async (value: string) => {
    if (!value.trim()) {
      setSuggestedMovies([]);
      return;
    }

    try {
      const results = await searchMovies({ keyword: value });
      setSuggestedMovies(results.slice(0, 5));
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phim gợi ý:", error);
      setSuggestedMovies([]);
    }
  };

  const onSearch: SearchProps["onSearch"] = (value) => {
    if (!value.trim()) return;

    // Navigate to search page with the search query
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
    setSuggestedMovies([]);
  };

  const handleMovieClick = (movieId: number) => {
    setSuggestedMovies([]);
    navigate(`/filmDetail/${movieId}`);
  };

  const menu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: handleProfile,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: handleLogout,
      },
    ],
  };

  return (
    <div>
      <header className={clsx(styles.headerClient)}>
        <div className={clsx(styles.flex, styles.row)}>
          <p className={clsx(styles.slogan)}>
            Phim đỉnh cao, vé siêu nhanh - chỉ một cú chạm!
          </p>
          <div>
            <div className={clsx(styles.flex)}>
              <div className={clsx(styles.network)}>
                <FontAwesomeIcon
                  className={clsx(styles.iconNetwork)}
                  icon={faFacebookF}
                />
                <FontAwesomeIcon
                  className={clsx(styles.iconNetwork)}
                  icon={faInstagram}
                />
                <FontAwesomeIcon
                  className={clsx(styles.iconNetwork)}
                  icon={faSolidFilm}
                />
              </div>
              <div className={clsx(styles.flex)}>
                {isAuthenticated ? (
                  <Dropdown menu={menu} trigger={["click"]}>
                    <div className={clsx(styles.boxProfile)}>
                      <Avatar className={clsx(styles.avatar)}>
                        {firstLetter}
                      </Avatar>
                    </div>
                  </Dropdown>
                ) : (
                  <>
                    <Link className={clsx(styles.signUp)} to="/auth/login">
                      Đăng nhập
                    </Link>
                    <Link className={clsx(styles.signIn)} to="/auth/register">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={clsx(styles.logoSearch, styles.flex)}>
          <Link className={clsx(styles.logo)} to="/">
            Logo
          </Link>
          <div className={styles.searchContainer} ref={searchRef}>
            <Search
              className={clsx(styles.sreach)}
              placeholder="Tìm kiếm phim, diễn viên, đạo diễn, thể loại..."
              allowClear
              onSearch={onSearch}
              value={keyword}
              onChange={handleInputChange}
            />
            {suggestedMovies.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                <List
                  itemLayout="horizontal"
                  dataSource={suggestedMovies}
                  renderItem={(movie) => (
                    <List.Item
                      className={styles.suggestionItem}
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <div className={styles.suggestionContent}>
                        <img
                          src={`${URL_IMAGE}${movie.poster}`}
                          alt={movie.title}
                          className={styles.suggestionImage}
                        />
                        <div className={styles.suggestionInfo}>
                          <div className={styles.suggestionTitle}>
                            {movie.title}
                          </div>
                          <div className={styles.suggestionGenres}>
                            {movie.genres
                              .slice(0, 2)
                              .map((genre: MovieGenre) => (
                                <span
                                  key={genre.id}
                                  className={styles.suggestionGenre}
                                >
                                  {genre.name_genre}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
                <div
                  className={styles.viewAllResults}
                  onClick={() => onSearch(keyword)}
                ></div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
