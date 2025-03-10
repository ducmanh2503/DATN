import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { GET_USER } from "../../config/ApiConfig";
import styles from "./UserProfile.module.css";

const fetchUserProfile = async () => {
  const { data } = await axios.get(`${GET_USER}`);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${GET_USER}`, formData);
      setEditMode(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Hồ sơ người dùng</h2>
      <div className={styles.info}>
        <label>Tên:</label>
        {editMode ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <p>{user.name}</p>
        )}
      </div>
      <div className={styles.info}>
        <label>Email:</label>
        {editMode ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <p>{user.email}</p>
        )}
      </div>
      <div className={styles.info}>
        <label>Số điện thoại:</label>
        {editMode ? (
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <p>{user.phone}</p>
        )}
      </div>
      <div className={styles.info}>
        <label>Vai trò:</label>
        <p className={styles.role}>{user.role}</p>
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
