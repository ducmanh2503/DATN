import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, Alert } from 'antd';
import { Room, RoomCreateRequest, RoomUpdateRequest } from '../../types/room.types';

const { Option } = Select;

interface RoomFormProps {
  onSubmit: (values: RoomCreateRequest | RoomUpdateRequest) => void;
  onCancel?: () => void;
  room?: Room | null;
  roomTypes?: any[];
  loading?: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({ 
  onSubmit, 
  onCancel, 
  room, 
  roomTypes = [
    { id: 1, name: '2D' },
    { id: 2, name: '3D' },
    { id: 3, name: '4D' }
  ], 
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu có dữ liệu phòng, điền vào form
    if (room) {
      form.setFieldsValue({
        name: room.name,
        capacity: room.capacity || 0,
        room_type_id: room.room_type_id,
      });
    } else {
      form.resetFields();
    }
  }, [form, room]);

  const handleSubmit = async (values: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error: any) {
      setFormError(error.message || 'Đã xảy ra lỗi khi xử lý form');
      console.error('Form submission error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        name: '',
        capacity: 0,
        room_type_id: roomTypes.length > 0 ? roomTypes[0].id : '',
      }}
    >
      {formError && (
        <Form.Item>
          <Alert message={formError} type="error" showIcon closable onClose={() => setFormError(null)} />
        </Form.Item>
      )}

      <Form.Item 
        name="name" 
        label="Tên Phòng"
        rules={[
          { required: true, message: 'Vui lòng nhập tên phòng!' },
          { max: 50, message: 'Tên phòng không được vượt quá 50 ký tự!' }
        ]}
      >
        <Input placeholder="Nhập tên phòng" maxLength={50} />
      </Form.Item>

      <Form.Item 
        name="capacity" 
        label="Sức Chứa"
        rules={[
          { required: true, message: 'Vui lòng nhập sức chứa phòng!' },
          { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0!' },
          { type: 'number', max: 999, message: 'Sức chứa không được vượt quá 999!' }
        ]}
        tooltip="Số lượng ghế tối đa trong phòng chiếu"
      >
        <InputNumber 
          min={1}
          max={999}
          style={{ width: '100%' }}
          placeholder="Nhập sức chứa phòng"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      </Form.Item>

      <Form.Item 
        name="room_type_id" 
        label="Loại Phòng"
        rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
        tooltip="Loại phòng chiếu (2D, 3D, 4D)"
      >
        <Select placeholder="Chọn loại phòng">
          {roomTypes.map(type => (
            <Option key={type.id} value={type.id}>{type.name}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || formLoading}
            style={{
              background: "var(--backgroud-product)",
              color: "var(--word-color)",
            }}
          >
            {room ? 'Cập Nhật' : 'Thêm Mới'}
          </Button>
          <Button 
            onClick={onCancel || (() => form.resetFields())}
            disabled={loading || formLoading}
          >
            {onCancel ? 'Hủy' : 'Làm Mới'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RoomForm;