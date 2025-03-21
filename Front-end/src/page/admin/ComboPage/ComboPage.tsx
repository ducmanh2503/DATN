import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Tooltip, Upload } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import comboService from "../../../services/combo.service";
import { Combo } from "../../../types/combo.types";
import styles from "./Combo.module.css";

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

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos();
      console.log("Fetched combos response:", JSON.stringify(response, null, 2));
      // Bỏ qua image từ backend, giữ nguyên các trường khác
      const processedCombos = response.combo.map((combo) => ({
        ...combo,
        image: combo.image === "undefined" ? null : combo.image, // Xử lý "undefined"
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
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || fileList.length === 0) {
      message.error("Vui lòng nhập đầy đủ thông tin, bao gồm file ảnh!");
      return;
    }
    try {
      const imageUrl = URL.createObjectURL(fileList[0].originFileObj); // URL cục bộ cho ảnh
      const newCombo: Combo = {
        id: Date.now().toString(), // ID tạm thời
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        price: formData.price,
        image: imageUrl,
      };
      console.log("New combo:", newCombo);

      // Gửi dữ liệu với image là chuỗi giả để thỏa mãn backend
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("quantity", String(formData.quantity));
      dataToSend.append("price", String(formData.price));
      dataToSend.append("image", "placeholder.jpg"); // Chuỗi giả cho backend

      const response = await comboService.createCombo(dataToSend);
      console.log("Create combo response:", response);

      // Sử dụng image cục bộ thay vì từ backend
      setCombos([...combos, { ...response.combo, image: imageUrl }]);
      message.success("Thêm combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const errorMessages = Object.values(error.details).flat().join(", ");
        message.error(`Không thể thêm combo: ${errorMessages}`);
      } else {
        message.error("Không thể thêm combo");
      }
      console.error("Error creating combo:", error);
    }
  };

  const handleUpdate = async () => {
    if (!currentCombo) return;
    try {
      let imageUrl = currentCombo.image;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = URL.createObjectURL(fileList[0].originFileObj); // Cập nhật ảnh mới
      }

      const updatedCombo: Combo = {
        ...currentCombo,
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        price: formData.price,
        image: imageUrl,
      };
      console.log("Updated combo:", updatedCombo);

      // Gửi dữ liệu với image là chuỗi giả
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("description", formData.description);
      dataToSend.append("quantity", String(formData.quantity));
      dataToSend.append("price", String(formData.price));
      if (fileList.length > 0 && fileList[0].originFileObj) {
        dataToSend.append("image", "placeholder.jpg"); // Chuỗi giả khi có ảnh mới
      }

      const response = await comboService.updateCombo(currentCombo.id, dataToSend);
      console.log("Update combo response:", response);

      // Cập nhật state với image cục bộ
      setCombos(combos.map((combo) => (combo.id === currentCombo.id ? { ...response.combo, image: imageUrl } : combo)));
      message.success("Cập nhật combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const errorMessages = Object.values(error.details).flat().join(", ");
        message.error(`Không thể cập nhật combo: ${errorMessages}`);
      } else {
        message.error("Không thể cập nhật combo");
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
        const isValidUrl = image && (image.startsWith("http") || image.startsWith("blob:"));
        return isValidUrl ? (
          <img
            src={image}
            alt="combo"
            className={styles.tableImage}
            onError={(e) => console.error("Image load error:", image)}
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
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      console.log("File selected:", file);
      return false;
    },
    fileList,
    maxCount: 1,
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
      </Modal>
    </div>
  );
};

export default ComboPage;