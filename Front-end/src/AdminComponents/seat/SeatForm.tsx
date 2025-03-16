import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Divider, Row, Col, InputNumber, Alert } from 'antd';
import { SeatCreateRequest, Seat, SeatingMatrix } from '../../types/seat.types';

interface SeatFormProps {
  onSubmit: (values: SeatCreateRequest | SeatCreateRequest[] | Seat) => void;
  onDelete?: (seatId: number) => void;
  roomId: number;
  seatTypes: { id: number; name: string; price: number }[];
  seat?: Seat | null;
  isEditing?: boolean;
  existingSeats: SeatingMatrix;
  maxSeats?: number;
}

const { Option } = Select;

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
  const [loading, setLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [rowStart, setRowStart] = useState('A');
  const [rowEnd, setRowEnd] = useState('A');
  const [columnStart, setColumnStart] = useState(1);
  const [columnEnd, setColumnEnd] = useState(1);
  const [selectedSeatType, setSelectedSeatType] = useState(1);

  // Available rows for seats (A-Z)
  const availableRows = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  // Initialize form with seat data if editing
  useEffect(() => {
    if (seat && isEditing) {
      form.setFieldsValue({
        row: seat.row,
        column: seat.column,
        seat_type_id: seat.seat_type_id,
        seat_status: seat.seat_status || 'available'
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        room_id: roomId,
        seat_type_id: seatTypes[0]?.id || 1,
        seat_status: 'available' // Mặc định là available
      });
    }
  }, [form, seat, isEditing, roomId, seatTypes]);

  const handleSingleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // If editing, include the seat ID
      if (isEditing && seat) {
        await onSubmit({ ...values, id: seat.id });
      } else {
        await onSubmit({ ...values, room_id: roomId });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = () => {
    setLoading(true);
    try {
      const seats: SeatCreateRequest[] = [];
      const rowStartCode = rowStart.charCodeAt(0);
      const rowEndCode = rowEnd.charCodeAt(0);

      // Generate seats based on row and column ranges
      for (let r = rowStartCode; r <= rowEndCode; r++) {
        const currentRow = String.fromCharCode(r);
        
        for (let c = columnStart; c <= columnEnd; c++) {
          // Check if this seat already exists
          const seatExists = existingSeats[currentRow] && 
                            existingSeats[currentRow][c];
          
          if (!seatExists) {
            seats.push({
              room_id: roomId,
              row: currentRow,
              column: String(c),
              seat_type_id: selectedSeatType,
              seat_status: 'available' // Mặc định là available
            });
          }
        }
      }

      if (seats.length === 0) {
        throw new Error('Tất cả ghế trong phạm vi đã tồn tại');
      }

      // Don't exceed the maximum number of seats
      if (maxSeats && seats.length > maxSeats) {
        throw new Error(`Bạn chỉ có thể thêm tối đa ${maxSeats} ghế`);
      }

      onSubmit(seats);
    } catch (error: any) {
      console.error('Error creating batch seats:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (seat && onDelete) {
      onDelete(seat.id);
    }
  };

  // Count how many seats will be created in batch mode
  const getBatchSeatsCount = (): number => {
    if (!batchMode) return 0;
    
    const rowStartCode = rowStart.charCodeAt(0);
    const rowEndCode = rowEnd.charCodeAt(0);
    const rowCount = rowEndCode - rowStartCode + 1;
    const colCount = columnEnd - columnStart + 1;
    
    let existingCount = 0;
    for (let r = rowStartCode; r <= rowEndCode; r++) {
      const currentRow = String.fromCharCode(r);
      for (let c = columnStart; c <= columnEnd; c++) {
        if (existingSeats[currentRow] && existingSeats[currentRow][c]) {
          existingCount++;
        }
      }
    }
    
    return Math.max(0, rowCount * colCount - existingCount);
  };

  const batchSeatsCount = getBatchSeatsCount();

  return (
    <div>
      {!isEditing && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            onClick={() => setBatchMode(!batchMode)}
            style={{
              background: batchMode ? "var(--primary-color)" : "var(--backgroud-product)",
              color: "var(--word-color)",
              marginBottom: 16
            }}
          >
            {batchMode ? "Tạo Một Ghế" : "Tạo Nhiều Ghế"}
          </Button>
        </div>
      )}

      {!batchMode ? (
        // Single seat form
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSingleSubmit}
        >
          <Form.Item name="room_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="seat_status" hidden initialValue="available">
            <Input />
          </Form.Item>

          <Form.Item 
            name="row" 
            label="Hàng"
            rules={[{ required: true, message: 'Vui lòng chọn hàng!' }]}
          >
            <Select placeholder="Chọn hàng">
              {availableRows.map(row => (
                <Option key={row} value={row}>{row}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="column" 
            label="Cột"
            rules={[{ required: true, message: 'Vui lòng nhập cột!' }]}
          >
            <Input placeholder="Nhập số cột (1, 2, ...)" />
          </Form.Item>

          <Form.Item 
            name="seat_type_id" 
            label="Loại Ghế"
            rules={[{ required: true, message: 'Vui lòng chọn loại ghế!' }]}
          >
            <Select placeholder="Chọn loại ghế">
              {seatTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name} - {type.price.toLocaleString('vi-VN')} VND
                </Option>
              ))}
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
                {isEditing ? 'Cập Nhật' : 'Thêm Ghế'}
              </Button>
              
              {isEditing && onDelete && (
                <Button 
                  danger
                  onClick={handleDelete}
                  disabled={loading}
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
      ) : (
        // Batch seat creation form
        <div>
          <Alert
            message={`Số ghế sẽ được tạo: ${batchSeatsCount}`}
            type={batchSeatsCount > 0 ? "info" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
          />

          {maxSeats > 0 && batchSeatsCount > maxSeats && (
            <Alert
              message={`Vượt quá số ghế có thể thêm (tối đa ${maxSeats} ghế)`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider>Phạm vi hàng</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div className="ant-form-item-label">
                  <label>Hàng bắt đầu</label>
                </div>
                <Select 
                  value={rowStart} 
                  onChange={setRowStart} 
                  style={{ width: '100%' }}
                >
                  {availableRows.map(row => (
                    <Option key={row} value={row}>{row}</Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div className="ant-form-item-label">
                  <label>Hàng kết thúc</label>
                </div>
                <Select 
                  value={rowEnd} 
                  onChange={setRowEnd} 
                  style={{ width: '100%' }}
                >
                  {availableRows
                    .filter(row => row.charCodeAt(0) >= rowStart.charCodeAt(0))
                    .map(row => (
                      <Option key={row} value={row}>{row}</Option>
                    ))}
                </Select>
              </div>
            </Col>
          </Row>

          <Divider>Phạm vi cột</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div className="ant-form-item-label">
                  <label>Cột bắt đầu</label>
                </div>
                <InputNumber 
                  value={columnStart} 
                  onChange={value => setColumnStart(value || 1)} 
                  min={1} 
                  max={50}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div className="ant-form-item-label">
                  <label>Cột kết thúc</label>
                </div>
                <InputNumber 
                  value={columnEnd} 
                  onChange={value => setColumnEnd(value || columnStart)} 
                  min={columnStart} 
                  max={50}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
          </Row>

          <Divider>Loại ghế</Divider>
          <div style={{ marginBottom: 16 }}>
            <div className="ant-form-item-label">
              <label>Loại ghế</label>
            </div>
            <Select 
              value={selectedSeatType} 
              onChange={setSelectedSeatType} 
              style={{ width: '100%' }}
            >
              {seatTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name} - {type.price.toLocaleString('vi-VN')} VND
                </Option>
              ))}
            </Select>
          </div>

          <Button 
            type="primary" 
            onClick={handleBatchSubmit} 
            loading={loading}
            disabled={batchSeatsCount === 0 || (maxSeats > 0 && batchSeatsCount > maxSeats)}
            style={{
              background: "var(--backgroud-product)",
              color: "var(--word-color)",
              marginTop: 16
            }}
          >
            Tạo {batchSeatsCount} Ghế
          </Button>
        </div>
      )}
    </div>
  );
};

export default SeatForm;