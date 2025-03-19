import axios from "axios";
import { User } from "../types/user.type";

// Cập nhật URL dựa trên endpoint thực tế của backend
const API_URL = "http://localhost:8000/api/user-management";

// Định nghĩa kiểu dữ liệu thô từ backend
interface RawUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  created_at: string;
  updated_at: string;
  role: string;
  is_verified: boolean; // Thêm trường is_verified
}

// Định nghĩa kiểu dữ liệu trả về từ backend (object chứa users và trashedUsers)
interface UserResponse {
  users: RawUser[];
  trashedUsers: RawUser[];
}

// Lấy danh sách người dùng từ server
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(API_URL);
    console.log("Dữ liệu từ server:", response.data); // Debug dữ liệu thô

    // Lấy mảng users từ response.data.users
    const userData = response.data.users || [];

    // Kiểm tra xem userData có phải là mảng không
    if (!Array.isArray(userData)) {
      console.error("Dữ liệu users từ server không phải là mảng:", userData);
      return []; // Trả về mảng rỗng nếu không phải mảng
    }

    // Chuyển đổi dữ liệu từ RawUser sang User
    const transformedData = userData.map((rawUser: RawUser) => ({
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified, // Sử dụng is_verified từ backend
      role: rawUser.role,
    }));

    return transformedData;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách người dùng:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Tìm kiếm người dùng theo tên hoặc email từ server
export const searchUsers = async (
  field: "name" | "email",
  keyword: string
): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(
      `${API_URL}?${field}=${keyword}`
    );
    console.log("Dữ liệu tìm kiếm từ server:", response.data); // Debug

    // Lấy mảng users từ response.data.users
    const userData = response.data.users || [];

    // Kiểm tra xem userData có phải là mảng không
    if (!Array.isArray(userData)) {
      console.error(
        "Dữ liệu tìm kiếm users từ server không phải là mảng:",
        userData
      );
      return []; // Trả về mảng rỗng nếu không phải mảng
    }

    // Chuyển đổi dữ liệu từ RawUser sang User
    const transformedData = userData.map((rawUser: RawUser) => ({
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified, // Sử dụng is_verified từ backend
      role: rawUser.role,
    }));

    return transformedData;
  } catch (error: any) {
    console.error(
      "Lỗi khi tìm kiếm người dùng:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Xóa người dùng từ server
export const deleteUser = async (email: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${email}`);
  } catch (error: any) {
    console.error(
      "Lỗi khi xóa người dùng:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Thêm người dùng vào server
export const createUser = async (user: User): Promise<User> => {
  try {
    const response = await axios.post<User>(API_URL, user);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi tạo người dùng:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Cập nhật người dùng trên server
export const updateUser = async (
  email: string,
  user: Partial<User>
): Promise<User> => {
  try {
    const response = await axios.put<User>(`${API_URL}/${email}`, user);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật người dùng:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};
