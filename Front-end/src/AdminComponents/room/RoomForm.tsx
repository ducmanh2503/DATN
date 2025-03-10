import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Spin } from "antd";
import {
    Room,
    RoomCreateRequest,
    RoomUpdateRequest,
} from "../../types/room.types";
// import "./RoomForm.css";

const { Option } = Select;

interface RoomFormProps {
    onSubmit: (data: RoomCreateRequest | RoomUpdateRequest) => Promise<void>;
    room?: Room | null;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, room }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Cập nhật giá trị form khi room thay đổi
    useEffect(() => {
        if (room) {
            form.setFieldsValue({
                name: room.name,
                capacity: room.capacity,
                room_type: room.room_type,
            });
        } else {
            form.resetFields();
        }
    }, [room, form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const roomData: RoomCreateRequest | RoomUpdateRequest = {
                name: values.name,
                capacity: Number(values.capacity), // Đảm bảo capacity là số
                room_type: values.room_type as "2D" | "3D" | "4D",
            };
            await onSubmit(roomData);
            if (!room) form.resetFields(); // Reset form chỉ khi tạo mới
        } catch (error: any) {
            message.error(error.error || "Có lỗi xảy ra khi xử lý");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading}>
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên Phòng"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên phòng!" },
                        {
                            max: 255,
                            message: "Tên phòng không được vượt quá 255 ký tự!",
                        },
                    ]}
                >
                    <Input disabled={loading} />
                </Form.Item>
                <Form.Item
                    name="capacity"
                    label="Sức Chứa"
                    rules={[
                        { required: true, message: "Vui lòng nhập sức chứa!" },
                        {
                            validator: (_, value) => {
                                if (!value || Number(value) <= 0) {
                                    return Promise.reject(
                                        "Sức chứa phải lớn hơn 0!"
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input type="number" disabled={loading} />
                </Form.Item>
                <Form.Item
                    name="room_type"
                    label="Loại Phòng"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại phòng!",
                        },
                    ]}
                >
                    <Select disabled={loading}>
                        <Option value="2D">2D</Option>
                        <Option value="3D">3D</Option>
                        <Option value="4D">4D</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            background: "var(--backgroud-product)",
                            color: "var(--word-color)",
                        }}
                        disabled={loading}
                    >
                        {room ? "Cập Nhật" : "Thêm Phòng"}
                    </Button>
                </Form.Item>
            </Form>
        </Spin>
    );
};

export default RoomForm;
