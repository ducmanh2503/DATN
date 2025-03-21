import React from "react";
import { Form, Input, Select, Button } from "antd";
import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "../../../types/room.types";

const { Option } = Select;

interface RoomFormProps {
  onSubmit: (data: RoomCreateRequest | RoomUpdateRequest) => void;
  onCancel: () => void;
  room?: Room | null;
  roomTypes: { id: number; name: string }[];
  loading: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({
  onSubmit,
  onCancel,
  room,
  roomTypes,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const formData: RoomCreateRequest | RoomUpdateRequest = {
      name: values.name,
      room_type_id: values.room_type_id,
    };
    onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={
        room
          ? {
              name: room.name,
              room_type_id: room.room_type_id,
            }
          : undefined
      }
    >
      <Form.Item
        label="Tên phòng"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
      >
        <Input placeholder="Nhập tên phòng" />
      </Form.Item>

      <Form.Item
        label="Loại phòng"
        name="room_type_id"
        rules={[{ required: true, message: "Vui lòng chọn loại phòng!" }]}
      >
        <Select placeholder="Chọn loại phòng">
          {roomTypes.map((type) => (
            <Option key={type.id} value={type.id}>
              {type.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ marginRight: 8 }}
        >
          {room ? "Cập nhật" : "Thêm mới"}
        </Button>
        <Button onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RoomForm;
