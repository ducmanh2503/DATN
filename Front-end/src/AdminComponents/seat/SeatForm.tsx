import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Spin, Modal } from "antd";
import { SeatCreateRequest, Seat, SeatingMatrix } from "../../types/seat.types";
// import "./SeatForm.css";

const { Option } = Select;

interface SeatFormProps {
  onSubmit: (data: SeatCreateRequest[] | Seat) => void;
  onDelete?: (seatId: number) => void;
  roomId?: number;
  seatTypes: { id: number; name: string; price: number }[];
  seat?: Seat;
  isEditing?: boolean;
  existingSeats?: SeatingMatrix;
}

const SeatForm: React.FC<SeatFormProps> = ({
  onSubmit,
  onDelete,
  roomId,
  seatTypes,
  seat,
  isEditing = false,
  existingSeats,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [maxColumn, setMaxColumn] = useState<string>("1");

  const MAX_SEATS_PER_ROW = 40;

  useEffect(() => {
    if (seat && isEditing) {
      form.setFieldsValue({
        row: seat.row,
        column: seat.column,
        seat_type_id: seat.seat_type_id,
        seat_status: seat.seat_status,
      });
    } else {
      form.setFieldsValue({ column: maxColumn });
    }
  }, [seat, isEditing, form, maxColumn]);

  const calculateMaxColumn = (row: string) => {
    if (!existingSeats || !row || !existingSeats[row]) {
      return "1";
    }
    const columns = Object.values(existingSeats[row]).map((seat) =>
      parseInt(seat.seatCode.match(/\d+$/)?.[0] || "0", 10)
    );
    const maxCol = columns.length > 0 ? Math.max(...columns) : 0;
    return String(maxCol + 1);
  };

  const getCurrentSeatCount = (row: string) => {
    if (!existingSeats || !row || !existingSeats[row]) {
      return 0;
    }
    return Object.keys(existingSeats[row]).length;
  };

  const handleRowChange = (value: string) => {
    const newMaxColumn = calculateMaxColumn(value);
    setMaxColumn(newMaxColumn);
    form.setFieldsValue({ column: newMaxColumn });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const currentRow = values.row;
      const currentSeatCount = getCurrentSeatCount(currentRow);
      const numberOfSeats = values.numberOfSeats || 1;

      if (!isEditing && currentSeatCount + numberOfSeats > MAX_SEATS_PER_ROW) {
        message.error(
          `Hàng ${currentRow} chỉ cho phép tối đa ${MAX_SEATS_PER_ROW} ghế. Hiện tại đã có ${currentSeatCount} ghế.`
        );
        setLoading(false);
        return;
      }

      if (isEditing && seat) {
        const updatedSeat: Seat = {
          ...seat,
          row: values.row,
          column: values.column,
          seat_type_id: values.seat_type_id,
          seat_status: values.seat_status,
        };
        await onSubmit(updatedSeat);
        message.success("Cập nhật ghế thành công");
      } else {
        const newSeats: SeatCreateRequest[] = Array.from(
          { length: numberOfSeats },
          (_, index) => ({
            room_id: roomId!,
            row: values.row,
            column: String(parseInt(values.column, 10) + index),
            seat_type_id: values.seat_type_id,
            seat_status: values.seat_status || "available",
          })
        );
        await onSubmit(newSeats);
        message.success("Thêm ghế mới thành công");
      }
      form.resetFields();
    } catch (error) {
      message.error(
        "Lỗi khi xử lý ghế: " + (error as Error).message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (seat && onDelete) {
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (seat && onDelete) {
      setLoading(true);
      try {
        await onDelete(seat.id);
        message.success("Xóa ghế thành công");
        setIsDeleteConfirmOpen(false);
        form.resetFields();
      } catch (error) {
        message.error(
          "Lỗi khi xóa ghế: " + (error as Error).message || "Có lỗi xảy ra"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Spin spinning={loading}>
        <Form.Item
          name="row"
          label="Hàng (VD: A, B, C)"
          rules={[{ required: true, message: "Vui lòng chọn hàng ghế!" }]}
        >
          <Select
            onChange={handleRowChange}
            placeholder="Chọn hàng"
            disabled={isEditing}
          >
            {["A", "B", "C", "D", "E", "F", "G", "H", "J"].map((row) => (
              <Option key={row} value={row}>
                {row}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="column"
          label="Cột"
          rules={[
            { required: true, message: "Cột không hợp lệ!" },
            { pattern: /^[1-9]\d*$/, message: "Cột phải là số nguyên dương!" },
          ]}
        >
          <Input
            disabled={
              !isEditing &&
              getCurrentSeatCount(form.getFieldValue("row") || "") > 0
            }
          />
        </Form.Item>
        <Form.Item
          name="seat_type_id"
          label="Loại Ghế"
          // rules={[{ required: true, message: "Vui lòng chọn loại ghế!" }]}
        >
          <Select>
            {seatTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name} - {type.price} VND
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="seat_status"
          label="Trạng Thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select>
            <Option value="available">Trống</Option>
            <Option value="booked">Đã Đặt</Option>
          </Select>
        </Form.Item>
        {!isEditing && (
          <Form.Item
            name="numberOfSeats"
            label="Số lượng ghế"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng ghế!" },
              {
                validator: (_, value) => {
                  if (!value || parseInt(value) <= 0) {
                    return Promise.reject(
                      new Error("Số lượng ghế phải lớn hơn 0!")
                    );
                  }
                  const currentRow = form.getFieldValue("row");
                  const currentSeatCount = getCurrentSeatCount(currentRow);
                  if (currentSeatCount + parseInt(value) > MAX_SEATS_PER_ROW) {
                    return Promise.reject(
                      new Error(
                        `Hàng ${currentRow} chỉ cho phép tối đa ${MAX_SEATS_PER_ROW} ghế. Hiện tại đã có ${currentSeatCount} ghế.`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        )}
        <Form.Item>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                background: "var(--backgroud-product)",
                color: "var(--word-color)",
              }}
              disabled={loading}
            >
              {loading
                ? "Đang xử lý..."
                : isEditing
                ? "Cập nhật Ghế"
                : "Thêm Ghế"}
            </Button>
            {isEditing && onDelete && (
              <Button
                onClick={handleDelete}
                style={{
                  background: "var(--normal-rank)",
                  color: "var(--word-color)",
                }}
                disabled={loading}
              >
                Xóa Ghế
              </Button>
            )}
          </div>
        </Form.Item>
      </Spin>
      <Modal
        title="Xác nhận xóa ghế"
        open={isDeleteConfirmOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: "var(--normal-rank)",
            color: "var(--word-color)",
          },
        }}
      >
        <p>Bạn có chắc muốn xóa ghế này?</p>
      </Modal>
    </Form>
  );
};

export default SeatForm;
