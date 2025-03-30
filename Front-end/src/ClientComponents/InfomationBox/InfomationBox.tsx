import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchArticlesForClient, Article } from "../../services/Article.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faNewspaper, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./InfomationBox.module.css";

const InfomationBox = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy danh sách bài viết khi component được mount
  useEffect(() => {
    const getArticles = async () => {
      try {
        setLoading(true);
        const response = await fetchArticlesForClient();
        // API trả về trực tiếp mảng bài viết, không có data wrapper
        setArticles(response);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu bài viết:", err);
        setError("Không thể tải dữ liệu bài viết");
        setLoading(false);
      }
    };

    getArticles();
  }, []);

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Hàm rút gọn nội dung
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải dữ liệu bài viết...</p>
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
  if (articles.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <p>Chưa có bài viết nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.infomationBox}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FontAwesomeIcon icon={faNewspaper} className={styles.icon} />
          Tin tức điện ảnh
        </h2>
        <Link to="/news" className={styles.viewAll}>
          Xem tất cả <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      <div className={styles.articleList}>
        {articles.map((article) => (
          <div key={article.id} className={styles.articleItem}>
            <div className={styles.articleImage}>
              {article.image && (
                <img src={article.image} alt={article.title} />
              )}
              {!article.image && (
                <img src="/images/default-article.jpg" alt={article.title} />
              )}
            </div>
            <div className={styles.articleContent}>
              <h3 className={styles.articleTitle}>
                <Link to={`/news/${article.id}`}>{article.title}</Link>
              </h3>
              <div className={styles.articleMeta}>
                <span className={styles.articleDate}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {formatDate(article.created_at)}
                </span>
                {article.author && (
                  <span className={styles.articleAuthor}>
                    {article.author}
                  </span>
                )}
              </div>
              <p className={styles.articleSummary}>
                {truncateContent(article.body, 150)}
              </p>
              <Link to={`/news/${article.id}`} className={styles.readMore}>
                Đọc tiếp
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfomationBox;
