import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Upload,
  message,
  Popconfirm,
  Image,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import sliderService from "../../../services/slider.service";
import { Slider, SliderFormData } from "../../../types/slider";
import styles from "../globalAdmin.module.css";

const SliderPage: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Lấy danh sách slider
  const fetchSliders = async () => {
    setLoading(true);
    try {
      const data = await sliderService.getSliders();
      setSliders(data);
    } catch (error) {
      message.error("Không thể tải danh sách slider");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Mở modal thêm/sửa
  const showModal = (slider?: Slider) => {
    setFileList([]);
    if (slider) {
      setEditingId(slider.id);
      form.setFieldsValue({
        title: slider.title,
        is_active: slider.is_active,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  // Xử lý lưu form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: SliderFormData = {
        title: values.title,
        image: fileList.length > 0 ? (fileList[0].originFileObj as File) : null,
        is_active: values.is_active,
      };

      if (editingId) {
        // Cập nhật slider
        await sliderService.updateSlider(editingId, formData);
        message.success("Cập nhật slider thành công");
      } else {
        // Thêm mới slider
        if (!formData.image) {
          message.error("Vui lòng chọn hình ảnh cho slider");
          return;
        }
        await sliderService.createSlider(formData);
        message.success("Thêm slider mới thành công");
      }

      handleCancel();
      fetchSliders();
    } catch (error) {
      console.error("Lỗi khi lưu slider:", error);
      message.error("Lỗi khi lưu slider");
    }
  };

  // Xóa slider
  const handleDelete = async (id: number) => {
    try {
      await sliderService.deleteSlider(id);
      message.success("Xóa slider thành công");
      fetchSliders();
    } catch (error) {
      console.error("Lỗi khi xóa slider:", error);
      message.error("Lỗi khi xóa slider");
    }
  };

  // Thay đổi trạng thái active
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await sliderService.toggleActive(id, isActive);
      message.success(
        `Slider đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"}`
      );
      fetchSliders();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      message.error("Lỗi khi thay đổi trạng thái");
    }
  };

  // Cấu hình upload hình ảnh
  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error("Kích thước file không được vượt quá 5MB");
        return Upload.LIST_IGNORE;
      }
      // Kiểm tra định dạng file
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ chấp nhận file hình ảnh");
        return Upload.LIST_IGNORE;
      }
      setFileList([file as UploadFile]);
      return false;
    },
    fileList,
  };

  // Cấu hình bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image_path",
      key: "image_path",
      render: (text: string) => (
        <Image
          src={text}
          width={200}
          height={80}
          style={{ objectFit: "cover" }}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Slider</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm Slider mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sliders}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingId ? "Sửa Slider" : "Thêm Slider mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề cho slider" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
            rules={[
              {
                required: !editingId,
                message: "Vui lòng chọn hình ảnh!",
              },
            ]}
          >
            <Upload {...uploadProps} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SliderPage;
