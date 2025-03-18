import axios from 'axios';
import { User } from '../types/user.type';

// Cập nhật URL dựa trên endpoint thực tế của backend
const API_URL = 'http://localhost:8000/api/users'; // Sửa từ 'user' thành 'users' nếu backend dùng số nhiều

// Lấy danh sách người dùng từ server
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(API_URL); // Gọi thẳng API_URL vì không cần thêm gì
    console.log('Dữ liệu từ server:', response.data); // Debug để kiểm tra dữ liệu trả về
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng:', error.message, error.response?.status);
    throw error; // Ném lỗi để component xử lý
  }
};

// Tìm kiếm người dùng theo tên hoặc email từ server
export const searchUsers = async (field: 'name' | 'email', keyword: string): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(`${API_URL}?${field}=${keyword}`);
    console.log('Dữ liệu tìm kiếm từ server:', response.data); // Debug
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Lỗi khi tìm kiếm người dùng:', error.message, error.response?.status);
    throw error;
  }
};

// Xóa người dùng từ server
export const deleteUser = async (email: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${email}`);
  } catch (error: any) {
    console.error('Lỗi khi xóa người dùng:', error.message, error.response?.status);
    throw error;
  }
};

// Thêm người dùng vào server
export const createUser = async (user: User): Promise<User> => {
  try {
    const response = await axios.post<User>(API_URL, user);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi tạo người dùng:', error.message, error.response?.status);
    throw error;
  }
};

// Cập nhật người dùng trên server
export const updateUser = async (email: string, user: Partial<User>): Promise<User> => {
  try {
    const response = await axios.put<User>(`${API_URL}/${email}`, user);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật người dùng:', error.message, error.response?.status);
    throw error;
  }
};