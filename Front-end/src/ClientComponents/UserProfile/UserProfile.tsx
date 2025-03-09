import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { GET_USER } from "../../config/ApiConfig";
import { UPDATE_USER_CLIENT } from "../../config/ApiConfig";
import styles from "./UserProfile.module.css";

const fetchUserProfile = async () => {
  // Add Authorization header with bearer token
  const token = localStorage.getItem("auth_token"); // Assuming you store your token in localStorage
  const { data } = await axios.get(`${GET_USER}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const UserProfile = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Add Authorization header with bearer token for the PUT request as well
      const token = localStorage.getItem("auth_token");
      await axios.put(`${UPDATE_USER_CLIENT}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditMode(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <h2>Hồ sơ người dùng</h2>
      <div className={styles.field}>
        <span className={styles.label}>Tên:</span>
        {editMode ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <span className={styles.value}>{user.name}</span>
        )}
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Email:</span>
        {editMode ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <span className={styles.value}>{user.email}</span>
        )}
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Số điện thoại:</span>
        {editMode ? (
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <span className={styles.value}>{user.phone}</span>
        )}
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Vai trò:</span>
        <span className={styles.value}>{user.role}</span>
      </div>
      {user.role === "customer" &&
        (editMode ? (
          <button onClick={handleSave} className={styles.button}>
            Lưu
          </button>
        ) : (
          <button onClick={() => setEditMode(true)} className={styles.button}>
            Chỉnh sửa
          </button>
        ))}
    </div>
  );
};

export default UserProfile;
