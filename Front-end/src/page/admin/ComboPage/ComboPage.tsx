import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Form, Upload } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import comboService from "../../../services/combo.service";
import { Combo } from "../../../types/combo.types";
import styles from "./Combo.module.css";

const ComboPage = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos(true);
      console.log("Fetched combos:", response);
      setCombos(response.combo);
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
      form.setFieldsValue({
        name: combo.name,
        description: combo.description,
        quantity: combo.quantity,
        price: combo.price,
      });
      setPreviewUrl(combo.image || "");
    } else {
      setIsEditMode(false);
      setCurrentCombo(null);
      form.resetFields();
      setPreviewUrl("");
    }
    setImageFile(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values before sending:", values);
      
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity);
      formData.append("price", values.price);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      const response = await comboService.createCombo(formData);
      console.log("Create combo response:", response);

      setCombos([...combos, response.combo]);
      message.success("Thêm combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (error.response?.data?.errors) {
        // Hiển thị lỗi validation từ server
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().map(msg => String(msg));
        errorMessages.forEach(msg => message.error(msg));
      } else {
        message.error(`Không thể thêm combo: ${error.message || error}`);
        console.error("Error creating combo:", error);
      }
    }
  };

  const handleUpdate = async () => {
    if (!currentCombo) return;
    try {
      const values = await form.validateFields();
      console.log("Form values before updating:", values);
      
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity);
      formData.append("price", values.price);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      const response = await comboService.updateCombo(currentCombo.id, formData);
      console.log("Update combo response:", response);

      setCombos(
        combos.map((combo) =>
          combo.id === currentCombo.id ? response.combo : combo
        )
      );
      message.success("Cập nhật combo thành công!");
      handleCancel();
    } catch (error: any) {
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (error.response?.data?.errors) {
        // Hiển thị lỗi validation từ server
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().map(msg => String(msg));
        errorMessages.forEach(msg => message.error(msg));
      } else {
        message.error(`Không thể cập nhật combo: ${error.message || error}`);
        console.error("Error updating combo:", error);
      }
    }
  };

  const handleSoftDelete = (id: string | number) => {
    Modal.confirm({
      title: "Xác nhận xóa mềm",
      content: "Bạn có chắc chắn muốn xóa mềm combo này?",
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          setCombos(
            combos.map((combo) =>
              combo.id === id ? { ...combo, deleted_at: new Date().toISOString() } : combo
            )
          );
          message.success("Xóa mềm combo thành công!");
        } catch (error) {
          message.error("Không thể xóa mềm combo");
          console.error(error);
        }
      },
    });
  };

  const handleRestore = (id: string | number) => {
    Modal.confirm({
      title: "Xác nhận khôi phục",
      content: "Bạn có chắc chắn muốn khôi phục combo này?",
      async onOk() {
        try {
          await comboService.restoreCombo(id);
          setCombos(
            combos.map((combo) =>
              combo.id === id ? { ...combo, deleted_at: null } : combo
            )
          );
          message.success("Khôi phục combo thành công!");
        } catch (error) {
          message.error("Không thể khôi phục combo");
          console.error(error);
        }
      },
    });
  };

  const handleSoftDeleteMultiple = () => {
    // Lọc ra những combo chưa bị xóa mềm từ danh sách đã chọn
    const selectedActiveCombos = combos.filter(
      combo => selectedRowKeys.includes(combo.id) && combo.deleted_at === null
    );

    if (selectedActiveCombos.length === 0) {
      message.warning("Vui lòng chọn combo chưa bị xóa để xóa mềm!");
      return;
    }

    // Convert selectedRowKeys to array of string | number
    const selectedIds = selectedActiveCombos.map(combo => String(combo.id));
    
    Modal.confirm({
      title: "Xác nhận xóa mềm nhiều combo",
      content: `Bạn có chắc chắn muốn xóa mềm ${selectedActiveCombos.length} combo?`,
      async onOk() {
        try {
          await comboService.deleteMultipleCombos(selectedIds);
          setCombos(
            combos.map((combo) =>
              selectedIds.includes(String(combo.id))
                ? { ...combo, deleted_at: new Date().toISOString() }
                : combo
            )
          );
          setSelectedRowKeys([]);
          message.success("Xóa mềm nhiều combo thành công!");
        } catch (error) {
          message.error("Không thể xóa mềm nhiều combo");
          console.error(error);
        }
      },
    });
  };

  const handleRestoreMultiple = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một combo để khôi phục!");
      return;
    }

    // Convert selectedRowKeys to array of string | number
    const selectedIds = selectedRowKeys.map(key => String(key));
    
    Modal.confirm({
      title: "Xác nhận khôi phục nhiều combo",
      content: `Bạn có chắc chắn muốn khôi phục ${selectedRowKeys.length} combo?`,
      async onOk() {
        try {
          await comboService.restoreMultipleCombos(selectedIds);
          setCombos(
            combos.map((combo) =>
              selectedRowKeys.includes(combo.id)
                ? { ...combo, deleted_at: null }
                : combo
            )
          );
          setSelectedRowKeys([]);
          message.success("Khôi phục nhiều combo thành công!");
        } catch (error) {
          message.error("Không thể khôi phục nhiều combo");
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
        if (!image || image === "undefined") {
          return <span>Không có ảnh</span>;
        }
        return (
          <img
            src={image}
            alt="combo"
            className={styles.tableImage}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.png";
              console.error("Image load error:", image);
            }}
          />
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "deleted_at",
      key: "status",
      render: (deleted_at: string | null) => (deleted_at ? "Đã xóa mềm" : "Hoạt động"),
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
            disabled={!!record.deleted_at}
          >
            Sửa
          </Button>
          {record.deleted_at ? (
            <Button
              type="dashed"
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleRestore(record.id)}
            >
              Khôi phục
            </Button>
          ) : (
            <Button
              type="dashed"
              icon={<EyeInvisibleOutlined />}
              onClick={() => handleSoftDelete(record.id)}
            >
              Xóa mềm
            </Button>
          )}
        </>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className={styles.comboContainer}>
      <h2>Danh sách Combo</h2>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ marginRight: 8 }}
        >
          Thêm Combo
        </Button>
        <Button
          type="dashed"
          icon={<EyeInvisibleOutlined />}
          onClick={handleSoftDeleteMultiple}
          style={{ marginRight: 8 }}
          disabled={selectedRowKeys.length === 0}
        >
          Xóa mềm nhiều
        </Button>
        <Button
          type="dashed"
          icon={<EyeInvisibleOutlined />}
          onClick={handleRestoreMultiple}
          disabled={selectedRowKeys.length === 0}
        >
          Khôi phục nhiều
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={combos}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => (record.deleted_at ? styles.softDeleted : "")}
      />
      <Modal
        title={isEditMode ? "Sửa Combo" : "Thêm Combo"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={isEditMode ? handleUpdate : handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên combo"
            rules={[{ required: true, message: "Vui lòng nhập tên combo!" }]}
          >
            <Input placeholder="Tên combo" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea placeholder="Mô tả" />
          </Form.Item>
          
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              {
                validator: async (_, value) => {
                  if (value <= 0) {
                    throw new Error('Số lượng phải lớn hơn 0!');
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error('Số lượng phải là số nguyên!');
                  }
                }
              }
            ]}
          >
            <Input 
              type="number" 
              min={1} 
              step={1}
              placeholder="Số lượng"
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('.')) {
                  e.target.value = String(Math.floor(Number(value)));
                }
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              {
                validator: async (_, value) => {
                  if (value < 0) {
                    throw new Error('Giá không được âm!');
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error('Giá phải là số nguyên!');
                  }
                }
              }
            ]}
          >
            <Input 
              type="number" 
              min={0} 
              step={1000}
              placeholder="Giá (VNĐ)"
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('.')) {
                  e.target.value = String(Math.floor(Number(value)));
                }
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="Hình ảnh"
            rules={[
              { required: !isEditMode, message: "Vui lòng tải lên hình ảnh!" }
            ]}
          >
            <div>
              <Upload
                accept="image/*"
                beforeUpload={(file) => {
                  setImageFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  return false;
                }}
                fileList={imageFile ? [{ uid: '-1', name: imageFile.name, status: 'done', url: previewUrl }] : []}
                onRemove={() => {
                  setImageFile(null);
                  setPreviewUrl("");
                }}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
              {previewUrl && !imageFile && (
                <div style={{ marginTop: 10 }}>
                  <p>Ảnh hiện tại:</p>
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComboPage;
