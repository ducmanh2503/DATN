import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, InputNumber, Row, Col, Space, Checkbox } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { SeatingMatrix, SeatCreateRequest, Seat } from "../../types/seat.types";

const { Option } = Select;

interface SeatType {
  id: number;
  name: string;
  price: number;
}

interface SeatFormProps {
  onSubmit: (data: SeatCreateRequest | SeatCreateRequest[] | Seat) => void;
  onDelete?: (id: number) => void;
  roomId: number;
  seatTypes: SeatType[];
  seat?: Seat | null;
  isEditing?: boolean;
  existingSeats: SeatingMatrix;
  maxSeats?: number;
}

const SeatForm: React.FC<SeatFormProps> = ({
  onSubmit,
  onDelete,
  roomId,
  seatTypes,
  seat,
  isEditing = false,
  existingSeats,
  maxSeats = 0,
}) => {
  const [form] = Form.useForm();
  const [batchMode, setBatchMode] = useState(false);
  const [rowStart, setRowStart] = useState<string>("");
  const [rowEnd, setRowEnd] = useState<string>("");
  const [columnStart, setColumnStart] = useState<number>(1);
  const [columnEnd, setColumnEnd] = useState<number>(1);
  const [skipOccupied, setSkipOccupied] = useState(true);

  useEffect(() => {
    if (isEditing && seat) {
      form.setFieldsValue({
        row: seat.row,
        column: seat.column,
        seat_type_id: seat.seat_type_id,
      });
    } else {
      form.resetFields();
    }
  }, [form, isEditing, seat]);

  const handleSubmit = (values: any) => {
    if (isEditing && seat) {
      const updatedSeat: Seat = {
        ...seat,
        row: values.row,
        column: values.column,
        seat_type_id: values.seat_type_id,
      };
      onSubmit(updatedSeat);
    } else if (batchMode) {
      const batchSeats: SeatCreateRequest[] = [];
      const startRowCode = rowStart.charCodeAt(0);
      const endRowCode = rowEnd.charCodeAt(0);

      for (let rowCode = startRowCode; rowCode <= endRowCode; rowCode++) {
        const currentRow = String.fromCharCode(rowCode);

        for (let col = columnStart; col <= columnEnd; col++) {
          const seatExists = existingSeats[currentRow]?.[col.toString()];
          if (skipOccupied && seatExists) {
            continue;
          }

          batchSeats.push({
            room_id: roomId,
            row: currentRow,
            column: col.toString(), // Đảm bảo column là string như backend yêu cầu
            seat_type_id: values.seat_type_id,
          });
        }
      }

      if (batchSeats.length === 0) {
        return;
      }

      if (maxSeats && batchSeats.length > maxSeats) {
        onSubmit(batchSeats.slice(0, maxSeats));
      } else {
        onSubmit(batchSeats);
      }
    } else {
      const newSeat: SeatCreateRequest = {
        room_id: roomId,
        row: values.row,
        column: values.column,
        seat_type_id: values.seat_type_id,
      };
      onSubmit(newSeat);
    }
  };

  const handleDelete = () => {
    if (isEditing && seat && onDelete) {
      onDelete(seat.id);
    }
  };

  const validateRow = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập hàng ghế"));
    }
    if (!/^[A-Z]$/.test(value)) {
      return Promise.reject(new Error("Hàng ghế phải là một chữ cái in hoa (A-Z)"));
    }
    return Promise.resolve();
  };

  const validateColumn = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập số ghế"));
    }
    if (!/^\d+$/.test(value)) {
      return Promise.reject(new Error("Số ghế phải là số nguyên dương"));
    }
    return Promise.resolve();
  };

  const validateRowRange = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập hàng ghế"));
    }
    if (!/^[A-Z]$/.test(value)) {
      return Promise.reject(new Error("Hàng ghế phải là một chữ cái in hoa (A-Z)"));
    }
    return Promise.resolve();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {!isEditing && (
        <Form.Item>
          <Checkbox checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)}>
            Thêm nhiều ghế cùng lúc
          </Checkbox>
        </Form.Item>
      )}

      {!batchMode ? (
        <>
          <Form.Item name="row" label="Hàng ghế" rules={[{ validator: validateRow }]}>
            <Input placeholder="Nhập hàng ghế" />
          </Form.Item>

          <Form.Item name="column" label="Số ghế" rules={[{ validator: validateColumn }]}>
            <Input placeholder="Nhập số ghế" />
          </Form.Item>

          <Form.Item
            name="seat_type_id"
            label="Loại ghế"
            rules={[{ required: true, message: "Vui lòng chọn loại ghế" }]}
            initialValue={seatTypes[0]?.id || 1}
          >
            <Select placeholder="Chọn loại ghế">
              {seatTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name} - {type.price.toLocaleString()}đ
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      ) : (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hàng bắt đầu" rules={[{ validator: validateRowRange }]}>
                <Input
                  placeholder="A"
                  maxLength={1}
                  style={{ textTransform: "uppercase" }}
                  value={rowStart}
                  onChange={(e) => setRowStart(e.target.value.toUpperCase())}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Hàng kết thúc" rules={[{ validator: validateRowRange }]}>
                <Input
                  placeholder="Z"
                  maxLength={1}
                  style={{ textTransform: "uppercase" }}
                  value={rowEnd}
                  onChange={(e) => setRowEnd(e.target.value.toUpperCase())}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Cột bắt đầu">
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="1"
                  style={{ width: "100%" }}
                  value={columnStart}
                  onChange={(value) => setColumnStart(Number(value))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cột kết thúc">
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="10"
                  style={{ width: "100%" }}
                  value={columnEnd}
                  onChange={(value) => setColumnEnd(Number(value))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="seat_type_id"
            label="Loại ghế"
            rules={[{ required: true, message: "Vui lòng chọn loại ghế" }]}
            initialValue={seatTypes[0]?.id || 1}
          >
            <Select placeholder="Chọn loại ghế">
              {seatTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name} - {type.price.toLocaleString()}đ
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Checkbox checked={skipOccupied} onChange={(e) => setSkipOccupied(e.target.checked)}>
              Bỏ qua các vị trí ghế đã tồn tại
            </Checkbox>
          </Form.Item>

          {maxSeats > 0 && (
            <div style={{ marginBottom: "15px", color: "blue" }}>
              Số ghế tối đa có thể thêm: {maxSeats}
            </div>
          )}
        </>
      )}

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              background: "var(--backgroud-product)",
              color: "var(--word-color)",
            }}
          >
            {isEditing ? "Cập Nhật" : "Thêm Ghế"}
          </Button>

          {isEditing && onDelete && (
            <Button
              danger
              onClick={handleDelete}
              icon={<DeleteOutlined />}
              style={{
                background: "var(--normal-rank)",
                color: "var(--word-color)",
              }}
            >
              Xóa Ghế
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SeatForm;