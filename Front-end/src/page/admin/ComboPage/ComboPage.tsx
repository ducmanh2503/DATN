import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Tooltip, Upload } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import comboService from "../../../services/combo.service";
import { Combo } from "../../../types/combo.types";
import styles from "./Combo.module.css";
import { URL_IMAGE } from "../../../config/ApiConfig";

const ComboPage = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
  });
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Thêm state để hiển thị preview ảnh

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos();
      console.log(
        "Fetched combos response:",
        JSON.stringify(response, null, 2)
      );
      const processedCombos = response.combo.map((combo) => ({
        ...combo,
        image: combo.image === "undefined" ? null : combo.image,
      }));
      setCombos(processedCombos);
    } catch (error) {
      message.error("Không thể tải danh sách combo");
      console.error("Error fetching combos:", error);
    }
    setLoading(false);
  };

  const showModal = (combo?: Combo) => {
    if (combo) {
      setIsEditMode(true);
      setCurrentCombo(combo);
      setFormData({
        name: combo.name,
        description: combo.description,
        quantity: combo.quantity,
        price: combo.price,
      });
      setFileList([]);
      // Đảm bảo previewImage hiển thị ảnh hiện tại
      setPreviewImage(combo.image || null);
    } else {
      setIsEditMode(false);
      setCurrentCombo(null);
      setFormData({
        name: "",
        description: "",
        quantity: 0,
        price: 0,
      });
      setFileList([]);
      setPreviewImage(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      price: 0,
    });
    setFileList([]);
    setPreviewImage(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || fileList.length === 0) {
      message.error("Vui lòng nhập đầy đủ thông tin, bao gồm file ảnh!");
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("quantity", String(formData.quantity));
      dataToSend.append("price", String(formData.price));
      dataToSend.append("image", fileList[0].originFileObj); // Gửi file thực tế

      const response = await comboService.createCombo(dataToSend);
      console.log("Create combo response:", response);

      setCombos([...combos, response.combo]);
      message.success("Thêm combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        message.error(`Không thể thêm combo: ${errorMessages}`);
      } else {
        message.error(
          "Không thể thêm combo: " + (error.message || "Lỗi không xác định")
        );
      }
      console.error("Error creating combo:", error);
    }
  };

  const handleUpdate = async () => {
    if (!currentCombo) return;

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("quantity", String(formData.quantity));
      dataToSend.append("price", String(formData.price));
      if (fileList.length > 0 && fileList[0].originFileObj) {
        dataToSend.append("image", fileList[0].originFileObj); // Gửi file thực tế
      }

      const response = await comboService.updateCombo(
        currentCombo.id,
        dataToSend
      );
      console.log("Update combo response:", response);

      setCombos(
        combos.map((combo) =>
          combo.id === currentCombo.id ? response.combo : combo
        )
      );
      message.success("Cập nhật combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        message.error(`Không thể cập nhật combo: ${errorMessages}`);
      } else {
        message.error(
          "Không thể cập nhật combo: " + (error.message || "Lỗi không xác định")
        );
      }
      console.error("Error updating combo:", error);
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa combo này?",
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          setCombos(combos.filter((combo) => combo.id !== id));
          message.success("Xóa combo thành công!");
        } catch (error) {
          message.error("Không thể xóa combo");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString(),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) => {
        console.log("Image URL in table:", image);
        // Nếu image tồn tại và không phải là URL blob (dùng cho preview), nối URL_IMAGE
        const fullImageUrl =
          image && !image.startsWith("blob:") ? `${URL_IMAGE}${image}` : image;
        const isValidUrl =
          fullImageUrl &&
          (fullImageUrl.startsWith("http") || fullImageUrl.startsWith("blob:"));
        return isValidUrl ? (
          <img
            src={fullImageUrl}
            alt="combo"
            className={styles.tableImage}
            onError={(e) => console.error("Image load error:", fullImageUrl)}
          />
        ) : (
          <span>Không có ảnh</span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Combo) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage(null);
    },
    beforeUpload: (file: any) => {
      // Kiểm tra xem file có phải là đối tượng File không
      if (!(file instanceof File)) {
        message.error("File không hợp lệ!");
        return false;
      }

      // Kiểm tra loại file
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!validImageTypes.includes(file.type)) {
        message.error("Vui lòng chọn file ảnh (jpeg, png, jpg, gif)!");
        return false;
      }

      // Kiểm tra kích thước file
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        message.error("Kích thước file ảnh không được vượt quá 2MB!");
        return false;
      }

      // Log file để debug
      console.log("File selected:", file);
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      // Lưu file vào fileList
      const fileWithOrigin = { ...file, originFileObj: file };
      setFileList([fileWithOrigin]);

      // Tạo URL preview
      try {
        const url = URL.createObjectURL(file);
        setPreviewImage(url);
      } catch (error) {
        console.error("Error creating preview URL:", error);
        message.error("Không thể tạo preview cho file này!");
        return false;
      }

      return false; // Ngăn upload tự động
    },
    fileList,
    maxCount: 1,
    accept: "image/jpeg,image/png,image/jpg,image/gif",
  };

  return (
    <div className={styles.comboContainer}>
      <h2>Danh sách Combo</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Thêm Combo
      </Button>
      <Table
        columns={columns}
        dataSource={combos}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={isEditMode ? "Sửa Combo" : "Thêm Combo"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={isEditMode ? handleUpdate : handleCreate}
      >
        <Input
          placeholder="Tên combo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ marginBottom: 16 }}
        />
        <Input
          placeholder="Mô tả"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          style={{ marginBottom: 16 }}
        />
        <Tooltip title="Số lượng phải là số nguyên lớn hơn hoặc bằng 1">
          <Input
            type="number"
            placeholder="Số lượng"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            style={{ marginBottom: 16 }}
            min={1}
          />
        </Tooltip>
        <Tooltip title="Giá phải là số lớn hơn hoặc bằng 0 (VNĐ)">
          <Input
            type="number"
            placeholder="Giá (VNĐ)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            style={{ marginBottom: 16 }}
            min={0}
          />
        </Tooltip>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Tải lên ảnh combo</Button>
        </Upload>
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            style={{ width: "100%", marginTop: 16 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ComboPage;
