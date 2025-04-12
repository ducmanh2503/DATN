import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Article } from "../../types/Article.type";
import Header from "../Header/Header";
import AppFooter from "../Footer/footer";
import InfomationProduct from "../InfomationBox/InfomationProduct/InfomationProduct";
import "./ArticleDetail.css";
import { URL_IMAGE } from "../../config/ApiConfig";

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/articles/${id}/client`
        );
        console.log("Dữ liệu bài viết:", response.data);
        setArticle(response.data);

        const relatedResponse = await axios.get(
          "http://localhost:8000/api/articles-client"
        );
        const allArticles = relatedResponse.data;

        const related = allArticles.filter(
          (a: Article) =>
            a.id !== response.data.id && a.category === response.data.category
        );
        setRelatedArticles(related);
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleDetail();
    }
  }, [id]);

  useEffect(() => {
    if (article) {
      console.log("Đường dẫn ảnh:", article.image);
    }
  }, [article]);

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading-container">
          <div className="loading">Đang tải bài viết...</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Header />
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-container">
        <Header />
        <div className="not-found-container">
          <div className="not-found">Không tìm thấy bài viết</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="article-detail-container">
          <div className="article-detail">
            <div className="article-header">
              <div className="article-category-tag">{article.category}</div>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <span className="article-author">
                  <i className="fas fa-user"></i> {article.author}
                </span>
                <span className="article-date">
                  <i className="fas fa-calendar-alt"></i>{" "}
                  {new Date(article.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {article.image && (
              <div className="article-image">
                <img src={`${URL_IMAGE}${article.image}`} alt={article.title} />
              </div>
            )}

            <div className="article-content">
              {article.body || (
                <p>
                  Đây là nội dung mẫu. Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              )}
            </div>
          </div>

          {relatedArticles.length > 0 && (
            <div className="related-articles">
              <h2 className="related-title">
                Bài viết liên quan ({relatedArticles.length})
              </h2>
              <div className="related-articles-grid">
                {relatedArticles.map((relatedArticle) => (
                  <InfomationProduct
                    key={relatedArticle.id}
                    id={relatedArticle.id}
                    image={`${URL_IMAGE}${relatedArticle.image}`}
                    category={relatedArticle.category}
                    created_at={relatedArticle.created_at}
                    title={relatedArticle.title}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default ArticleDetail;
