import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  GET_DISCOUNT_CODE,
  CREATE_DISCOUNT_CODE,
  DELETE_DISCOUNT_CODE,
} from "../../../config/ApiConfig";

const { Option } = Select;

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(GET_DISCOUNT_CODE);
      setDiscounts(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách mã khuyến mãi");
    }
  };

  const handleAddDiscount = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      };
      await axios.post(CREATE_DISCOUNT_CODE, formattedValues);
      message.success("Thêm mã khuyến mãi thành công!");
      fetchDiscounts();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Lỗi khi tạo mã khuyến mãi");
    }
  };

  const handleDelete = async (id: any) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`${DELETE_DISCOUNT_CODE(id)}`);
          setDiscounts(discounts.filter((discount) => discount.id !== id));
          message.success("Xóa mã khuyến mãi thành công!");
        } catch (error) {
          message.error("Lỗi khi xóa mã khuyến mãi");
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "name_code",
      key: "name_code",
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "percent",
      key: "percent",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (status === "active" ? "Kích hoạt" : "Ẩn"),
    },
    {
      title: "Thời gian áp dụng",
      key: "date",
      render: (_, record) => `${record.start_date} - ${record.end_date}`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý khuyến mãi</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Thêm mã khuyến mãi
      </Button>

      <Table
        dataSource={discounts}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 20 }}
      />

      {/* Modal thêm mã khuyến mãi */}
      <Modal
        title="Thêm mã khuyến mãi"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddDiscount} layout="vertical">
          <Form.Item
            name="name_code"
            label="Mã khuyến mãi"
            rules={[{ required: true, message: "Nhập mã khuyến mãi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="percent"
            label="Phần trăm giảm"
            rules={[{ required: true, message: "Nhập phần trăm giảm" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select>
              <Option value="active">Kích hoạt</Option>
              <Option value="inactive">Ẩn</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountManagement;
