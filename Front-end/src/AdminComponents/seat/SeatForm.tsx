// src/AdminComponents/seat/SeatForm.tsx
import React, { useState } from 'react';
import { Form, Input, Select, Button, message, Spin } from 'antd';
import { SeatCreateRequest } from '../../types/seat.types';
import './SeatForm.css';

const { Option } = Select;

interface SeatFormProps {
    onSubmit: (data: SeatCreateRequest[]) => void;
    roomId: number;
    seatTypes: { id: number; name: string; price: number }[];
}

const SeatForm: React.FC<SeatFormProps> = ({ onSubmit, roomId, seatTypes }) => {
    const [form] = Form.useForm();
    const [seats, setSeats] = useState<SeatCreateRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const newSeats: SeatCreateRequest[] = Array.from({ length: values.numberOfSeats || 1 }, (_, index) => ({
                room_id: roomId,
                row: values.row,
                column: String(index + 1),
                seat_type_id: values.seat_type_id,
                seat_status: 'available',
            }));
            setSeats(newSeats);
            await onSubmit(newSeats);
            message.success('Thêm ghế mới thành công');
            form.resetFields();
        } catch (error) {
            message.error('Lỗi khi thêm ghế mới: ' + (error as Error).message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading}>
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="row"
                    label="Hàng (VD: A, B, C)"
                    rules={[{ required: true, message: 'Vui lòng nhập hàng ghế!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="seat_type_id"
                    label="Loại Ghế"
                    rules={[{ required: true, message: 'Vui lòng chọn loại ghế!' }]}
                >
                    <Select>
                        {seatTypes.map(type => (
                            <Option key={type.id} value={type.id}>{type.name} - {type.price} VND</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="numberOfSeats"
                    label="Số lượng ghế"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng ghế!' }]}
                >
                    <Input type="number" min={1} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ background: 'var(--backgroud-product)', color: 'var(--word-color)' }} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Thêm Ghế'}
                    </Button>
                </Form.Item>
            </Form>
        </Spin>
    );
};

export default SeatForm; // Đảm bảo export default