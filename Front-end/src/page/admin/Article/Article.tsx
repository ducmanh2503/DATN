import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  GET_ARTICLE,
  DELETE_ARTICLE,
  UPDATE_ARTICLE,
} from "../../../config/ApiConfig";
import "./ArticleList.css";

const { TextArea } = Input;

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    body: "",
    status: "",
    file: null,
    imageUrl: "",
    _method: "PUT",
  });

  // Fetch danh sách bài viết
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_ARTICLE);
      setArticles(response.data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
    setLoading(false);
  };

  // Xóa bài viết
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await axios.delete(DELETE_ARTICLE(id));
        setArticles(articles.filter((article) => article.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
      }
    }
  };

  // Khi nhấn nút "Sửa"
  const handleEditClick = (article: any) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || "",
      author: article.author || "",
      category: article.category || "",
      body: article.body || "",
      status: article.status || "",
      file: null,
      imageUrl: article.image || "",
      _method: "PUT",
    });
    setIsModalOpen(true);
  };

  // Cập nhật bài viết
  const handleUpdatePost = async () => {
    if (!editingArticle) {
      message.error("Không có bài viết nào được chọn để cập nhật!");
      return;
    }

    const { id } = editingArticle;
    const { title, author, category, body, status, file } = formData;

    const data = new FormData();
    data.append("title", title);
    data.append("author", author);
    data.append("category", category);
    data.append("body", body);
    data.append("status", status);
    data.append("_method", "PUT");
    if (file) data.append("image", file);

    try {
      await axios.post(UPDATE_ARTICLE(id), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Bài viết đã được cập nhật!");
      setIsModalOpen(false);
      fetchArticles();
    } catch (error) {
      message.error("Lỗi khi cập nhật bài viết!");
      console.error("Lỗi:", error);
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
          <Button onClick={fetchArticles}>🔄 Refresh</Button>
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
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: any) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.author}</td>
                  <td>{article.category}</td>
                  <td>{article.views}</td>
                  <td>{article.status}</td>
                  <td>{article.createdAt}</td>
                  <td>
                    <Button onClick={() => handleEditClick(article)}>
                      ✏️ Sửa
                    </Button>
                    <Button danger onClick={() => handleDelete(article.id)}>
                      ❌ Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cập nhật bài viết */}
      <Modal
        title="Cập nhật bài viết"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdatePost}>
            Cập nhật
          </Button>,
        ]}
      >
        <Input
          placeholder="Tiêu đề"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          placeholder="Tác giả"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
        <Upload
          beforeUpload={(file: any) => {
            setFormData({
              ...formData,
              file,
              imageUrl: URL.createObjectURL(file),
            });
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>

        {/* Hiển thị ảnh preview */}
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="uploaded-image"
          />
        )}

        <Select
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={[
            { value: "Khuyến mãi", label: "Khuyến mãi" },
            { value: "Tin tức", label: "Tin tức" },
          ]}
        />
        <TextArea
          placeholder="Nội dung"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
      </Modal>
    </div>
  );
};

export default ArticleList;
