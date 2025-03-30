import axios from "axios";

const API_URL = "http://localhost:8000/api"; // URL của backend

// Hàm lấy danh sách bài viết từ API
export const fetchArticlesForClient = async () => {
  try {
    const url = `${API_URL}/articles-client`;
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu bài viết:", error);
    throw error;
  }
};

// Định nghĩa kiểu dữ liệu cho đối tượng bài viết
export interface Article {
  id: number;
  title: string;
  author: string;
  image: string | null;
  category: string;
  body: string;
  view: number;
  status: string;
  created_at: string;
  updated_at: string;
}
