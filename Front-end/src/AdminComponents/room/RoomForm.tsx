import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Space } from "antd";
import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "../../types/room.types";

const { Option } = Select;

interface RoomFormProps {
  onSubmit: (values: RoomCreateRequest | RoomUpdateRequest) => void;
  room?: Room | null;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, room }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with room data if editing
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
  }, [form, room]);

  const handleSubmit = async (
    values: RoomCreateRequest | RoomUpdateRequest
  ) => {
    setLoading(true);
    try {
      await onSubmit(values);
      if (!room) {
        form.resetFields();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        name: "",
        capacity: 100,
        room_type: "2D",
      }}
    >
      <Form.Item
        name="name"
        label="Tên Phòng"
        rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
      >
        <Input placeholder="Nhập tên phòng" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="capacity"
        label="Sức Chứa"
        rules={[{ required: true, message: "Vui lòng nhập sức chứa phòng!" }]}
      >
        <InputNumber
          min={1}
          max={999}
          style={{ width: "100%" }}
          placeholder="Nhập sức chứa phòng"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          // parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
        />
      </Form.Item>

      <Form.Item
        name="room_type"
        label="Loại Phòng"
        rules={[{ required: true, message: "Vui lòng chọn loại phòng!" }]}
      >
        <Select placeholder="Chọn loại phòng">
          <Option value="2D">2D</Option>
          <Option value="3D">3D</Option>
          <Option value="4D">4D</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              background: "var(--backgroud-product)",
              color: "var(--word-color)",
            }}
          >
            {room ? "Cập Nhật" : "Thêm Mới"}
          </Button>
          <Button onClick={() => form.resetFields()} disabled={loading}>
            Làm Mới
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RoomForm;
