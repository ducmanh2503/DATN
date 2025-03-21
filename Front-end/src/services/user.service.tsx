import axios from "axios";
import { User } from "../types/user.type";

const API_URL = "http://localhost:8000/api/user-management";

interface RawUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  role: string;
}

interface UserResponse {
  users: RawUser[];
  trashedUsers: RawUser[];
}

export const getUsers = async (): Promise<{ users: User[]; trashedUsers: User[] }> => {
  try {
    const response = await axios.get<UserResponse>(API_URL);
    const userData = response.data.users || [];
    const trashedUserData = response.data.trashedUsers || [];
    return {
      users: userData.map((rawUser: RawUser) => ({
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        is_verified: rawUser.is_verified,
        role: rawUser.role,
        is_deleted: trashedUserData.some((t) => t.id === rawUser.id),
      })),
      trashedUsers: trashedUserData.map((rawUser: RawUser) => ({
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        is_verified: rawUser.is_verified,
        role: rawUser.role,
        is_deleted: true,
      })),
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

export const searchUsers = async (
  field: "name" | "email",
  keyword: string
): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(API_URL);
    const userData = response.data.users || [];
    const filteredUsers = userData.filter((user: RawUser) =>
      user[field].toLowerCase().includes(keyword.toLowerCase())
    );
    return filteredUsers.map((rawUser: RawUser) => ({
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      is_verified: rawUser.is_verified,
      role: rawUser.role,
      is_deleted: response.data.trashedUsers.some((t) => t.id === rawUser.id),
    }));
  } catch (error: any) {
    console.error("Lỗi khi tìm kiếm người dùng:", error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error("Lỗi khi khóa người dùng:", error);
    throw error;
  }
};

export const restoreUser = async (id: number): Promise<void> => {
  try {
    await axios.put(`${API_URL}/restore/${id}`);
  } catch (error: any) {
    console.error("Lỗi khi khôi phục người dùng:", error);
    throw error;
  }
};

export const updateUser = async (
  id: number,
  user: Partial<User>
): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, user);
    return { ...response.data.data, is_deleted: false };
  } catch (error: any) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    throw error;
  }
};