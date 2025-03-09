import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "./ArticleList.css";
import { GET_ARTICLE } from "../../../config/ApiConfig";

interface Article {
  id: number;
  title: string;
  author: string;
  category: string;
  views: number;
  status: string;
  createdAt: string;
}

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_ARTICLE);
      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">Danh sách bài viết</h2>
        <div className="button-group">
          <button
            className="btn create"
            onClick={() => navigate("/create-article")}
          >
            + Viết bài
          </button>
          <button className="btn refresh" onClick={fetchArticles}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="title-cell">{article.title}</td>
                  <td>{article.author}</td>
                  <td>
                    <span className="category">{article.category}</span>
                  </td>
                  <td className="text-center">{article.views}</td>
                  <td>
                    <span
                      className={`status ${
                        article.status === "Công khai" ? "public" : "private"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="text-gray">{article.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
