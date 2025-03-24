import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Input, message, Form, Upload } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import comboService, { URL_IMAGE } from "../../../services/combo.service";
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
  const [currentPage, setCurrentPage] = useState(1); // State cho phân trang
  const [pageSize, setPageSize] = useState(10); // Số bản ghi trên mỗi trang

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
        image: combo.image
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: `${URL_IMAGE}${combo.image}`,
              },
            ]
          : [],
      });
    } else {
      setIsEditMode(false);
      setCurrentCombo(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values before sending:", values);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("quantity", values.quantity.toString());
      formData.append("price", values.price.toString());

      if (
        values.image &&
        values.image.length > 0 &&
        values.image[0].originFileObj
      ) {
        formData.append("image", values.image[0].originFileObj);
      } else {
        throw new Error("Vui lòng chọn hình ảnh!");
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
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
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .map((msg) => String(msg));
        errorMessages.forEach((msg) => message.error(msg));
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
      if (values.name) formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
      if (values.quantity)
        formData.append("quantity", values.quantity.toString());
      if (values.price) formData.append("price", values.price.toString());

      if (
        values.image &&
        values.image.length > 0 &&
        values.image[0].originFileObj
      ) {
        formData.append("image", values.image[0].originFileObj);
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await comboService.updateCombo(
        currentCombo.id,
        formData
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
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .map((msg) => String(msg));
        errorMessages.forEach((msg) => message.error(msg));
      } else {
        message.error(`Không thể cập nhật combo: ${error.message || error}`);
        console.error("Error updating combo:", error);
      }
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: "Xác nhận xóa vĩnh viễn",
      content: "Bạn có chắc chắn muốn xóa vĩnh viễn combo này?",
      async onOk() {
        try {
          await comboService.permanentDeleteCombo(id);
          setCombos(combos.filter((combo) => combo.id !== id));
          message.success("Xóa vĩnh viễn combo thành công!");
        } catch (error) {
          message.error("Không thể xóa vĩnh viễn combo");
          console.error(error);
        }
      },
    });
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
              combo.id === id
                ? { ...combo, deleted_at: new Date().toISOString() }
                : combo
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

  const handleForceDeleteMultiple = () => {
    const selectedDeletedCombos = combos.filter(
      (combo) => selectedRowKeys.includes(combo.id) && combo.deleted_at !== null
    );

    if (selectedDeletedCombos.length === 0) {
      message.warning("Vui lòng chọn combo đã bị xóa mềm để xóa vĩnh viễn!");
      return;
    }

    const selectedIds = selectedDeletedCombos.map((combo) => String(combo.id));

    Modal.confirm({
      title: "Xác nhận xóa vĩnh viễn nhiều combo",
      content: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedDeletedCombos.length} combo?`,
      async onOk() {
        try {
          await comboService.forceDeleteMultipleCombos(selectedIds);
          setCombos(
            combos.filter((combo) => !selectedIds.includes(String(combo.id)))
          );
          setSelectedRowKeys(
            selectedRowKeys.filter((key) => !selectedIds.includes(String(key)))
          );
          message.success("Xóa vĩnh viễn nhiều combo thành công!");
        } catch (error) {
          message.error("Không thể xóa vĩnh viễn nhiều combo");
          console.error(error);
        }
      },
    });
  };

  const handleSoftDeleteMultiple = () => {
    const selectedActiveCombos = combos.filter(
      (combo) => selectedRowKeys.includes(combo.id) && combo.deleted_at === null
    );

    if (selectedActiveCombos.length === 0) {
      message.warning("Vui lòng chọn combo chưa bị xóa để xóa mềm!");
      return;
    }

    const selectedIds = selectedActiveCombos.map((combo) => String(combo.id));

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

    const selectedIds = selectedRowKeys.map((key) => String(key));

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

  const columns = useMemo(
    () => [
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
          const fullImageUrl = `${URL_IMAGE}${image}`;
          return (
            <img
              src={fullImageUrl}
              alt="combo"
              className={styles.tableImage}
              onError={(e: any) => {
                // Sử dụng thuộc tính tùy chỉnh để ngăn lặp vô hạn
                if (!e.target.dataset.errorHandled) {
                  e.target.dataset.errorHandled = true; // Đánh dấu đã xử lý lỗi
                  e.target.src = "/placeholder-image.png"; // Thay đổi src
                }
              }}
            />
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "deleted_at",
        key: "status",
        render: (deleted_at: string | null) =>
          deleted_at ? "Đã xóa mềm" : "Hoạt động",
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
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                style={{ marginRight: 8 }}
              >
                Xóa vĩnh viễn
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
            {record.deleted_at && (
              <Button
                type="dashed"
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleRestore(record.id)}
              >
                Khôi phục
              </Button>
            )}
          </>
        ),
      },
    ],
    [styles.tableImage]
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Xử lý thay đổi trang
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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
          danger
          icon={<DeleteOutlined />}
          onClick={handleForceDeleteMultiple}
          style={{ marginRight: 8 }}
          disabled={selectedRowKeys.length === 0}
        >
          Xóa vĩnh viễn nhiều
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
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: combos.length,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
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
                    throw new Error("Số lượng phải lớn hơn 0!");
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error("Số lượng phải là số nguyên!");
                  }
                },
              },
            ]}
          >
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="Số lượng"
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes(".")) {
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
                    throw new Error("Giá không được âm!");
                  }
                  if (!Number.isInteger(Number(value))) {
                    throw new Error("Giá phải là số nguyên!");
                  }
                },
              },
            ]}
          >
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Giá (VNĐ)"
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes(".")) {
                  e.target.value = String(Math.floor(Number(value)));
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              {
                required: !isEditMode,
                message: "Vui lòng chọn hình ảnh!",
                validator: (_, value) => {
                  if (!isEditMode && (!value || value.length === 0)) {
                    return Promise.reject("Vui lòng chọn hình ảnh!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload beforeUpload={() => false} accept="image/*" maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComboPage;
