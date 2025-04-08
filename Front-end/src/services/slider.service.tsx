import axios from "axios";
import {
  Slider,
  SliderDetailResponse,
  SliderFormData,
  SliderResponse,
} from "../types/slider";

const API_URL = "http://localhost:8000/api/sliders";

class SliderService {
  // Lấy danh sách slider
  async getSliders(): Promise<Slider[]> {
    try {
      const response = await axios.get<SliderResponse>(API_URL);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách slider:", error);
      return [];
    }
  }

  // Lấy thông tin một slider
  async getSlider(id: number): Promise<Slider | null> {
    try {
      const response = await axios.get<SliderDetailResponse>(
        `${API_URL}/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin slider id=${id}:`, error);
      return null;
    }
  }

  // Thêm slider mới
  async createSlider(formData: SliderFormData): Promise<any> {
    try {
      const form = new FormData();
      form.append("title", formData.title);
      if (formData.image) {
        form.append("image", formData.image);
      }
      form.append("is_active", formData.is_active ? "1" : "0");

      const response = await axios.post(API_URL, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo slider mới:", error);
      throw error;
    }
  }

  // Cập nhật slider
  async updateSlider(id: number, formData: SliderFormData): Promise<any> {
    try {
      const form = new FormData();
      form.append("title", formData.title);
      if (formData.image) {
        form.append("image", formData.image);
      }
      form.append("is_active", formData.is_active ? "1" : "0");
      form.append("method_", "PUT");

      const response = await axios.post(`${API_URL}/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật slider id=${id}:`, error);
      throw error;
    }
  }

  // Xóa slider
  async deleteSlider(id: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa slider id=${id}:`, error);
      throw error;
    }
  }

  // Thay đổi trạng thái active
  async toggleActive(id: number, isActive: boolean): Promise<any> {
    try {
      const form = new FormData();
      form.append("is_active", isActive ? "1" : "0");
      form.append("method_", "PUT");

      const response = await axios.post(`${API_URL}/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái slider id=${id}:`, error);
      throw error;
    }
  }
}

export default new SliderService();
