import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { GET_USER, UPDATE_USER_CLIENT } from "../UseContext/config/ApiConfig";
import { Modal, Button, Input } from "antd";

const fetchUserProfile = async () => {
    const token = localStorage.getItem("auth_token");
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
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const token = localStorage.getItem("auth_token");
            await axios.put(`${UPDATE_USER_CLIENT}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditMode(false);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin:", error);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                Hồ sơ người dùng
            </Button>
            <Modal
                title="Hồ sơ người dùng"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <div className="space-y-4">
                    <div>
                        <span className="font-semibold">Tên:</span>
                        {editMode ? (
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{user.name}</p>
                        )}
                    </div>
                    <div>
                        <span className="font-semibold">Email:</span>
                        {editMode ? (
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{user.email}</p>
                        )}
                    </div>
                    <div>
                        <span className="font-semibold">Số điện thoại:</span>
                        {editMode ? (
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{user.phone}</p>
                        )}
                    </div>
                    <div>
                        <span className="font-semibold">Vai trò:</span>
                        <p>{user.role}</p>
                    </div>
                    {user.role === "customer" && (
                        <Button
                            type="primary"
                            onClick={
                                editMode ? handleSave : () => setEditMode(true)
                            }
                        >
                            {editMode ? "Lưu" : "Chỉnh sửa"}
                        </Button>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default UserProfile;
