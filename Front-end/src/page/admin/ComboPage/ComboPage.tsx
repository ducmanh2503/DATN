<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import comboService from '../../../services/combo.service';
import { Combo } from '../../../types/combo.types';
import styles from './Combo.module.css';
=======
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import comboService from "../../../services/combo.service";
import { Combo } from "../../../types/combo.types";
import styles from "./Combo.module.css";
>>>>>>> main

const ComboPage = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
<<<<<<< HEAD
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    image: '', // Đây sẽ là URL dạng chuỗi
=======
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    image: "", // Đây sẽ là URL dạng chuỗi
>>>>>>> main
  });

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos();
<<<<<<< HEAD
      console.log('API Response:', response);
      setCombos(response.combo);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
      console.error('Error fetching combos:', error);
=======
      console.log("API Response:", response);
      setCombos(response.combo);
    } catch (error) {
      message.error("Không thể tải danh sách combo");
      console.error("Error fetching combos:", error);
>>>>>>> main
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
        image: combo.image,
      });
    } else {
      setIsEditMode(false);
      setCurrentCombo(null);
<<<<<<< HEAD
      setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
=======
      setFormData({
        name: "",
        description: "",
        quantity: 0,
        price: 0,
        image: "",
      });
>>>>>>> main
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
<<<<<<< HEAD
    setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
=======
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      image: "",
    });
>>>>>>> main
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.image) {
<<<<<<< HEAD
      message.error('Vui lòng nhập đầy đủ thông tin, bao gồm URL ảnh!');
=======
      message.error("Vui lòng nhập đầy đủ thông tin, bao gồm URL ảnh!");
>>>>>>> main
      return;
    }
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        price: formData.price,
        image: formData.image, // Chuỗi URL
      };

      await comboService.createCombo(dataToSend);
<<<<<<< HEAD
      message.success('Thêm combo thành công!');
=======
      message.success("Thêm combo thành công!");
>>>>>>> main
      fetchCombos();
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
<<<<<<< HEAD
        const errorMessages = Object.values(error.details).flat().join(', ');
        message.error(`Không thể thêm combo: ${errorMessages}`);
      } else {
        message.error('Không thể thêm combo');
      }
      console.error('Error creating combo:', error);
=======
        const errorMessages = Object.values(error.details).flat().join(", ");
        message.error(`Không thể thêm combo: ${errorMessages}`);
      } else {
        message.error("Không thể thêm combo");
      }
      console.error("Error creating combo:", error);
>>>>>>> main
    }
  };

  const handleUpdate = async () => {
    if (!currentCombo) return;
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        price: formData.price,
        image: formData.image, // Chuỗi URL
      };

      await comboService.updateCombo(currentCombo.id, dataToSend);
<<<<<<< HEAD
      message.success('Cập nhật combo thành công!');
=======
      message.success("Cập nhật combo thành công!");
>>>>>>> main
      fetchCombos();
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
<<<<<<< HEAD
        const errorMessages = Object.values(error.details).flat().join(', ');
        message.error(`Không thể cập nhật combo: ${errorMessages}`);
      } else {
        message.error('Không thể cập nhật combo');
      }
      console.error('Error updating combo:', error);
=======
        const errorMessages = Object.values(error.details).flat().join(", ");
        message.error(`Không thể cập nhật combo: ${errorMessages}`);
      } else {
        message.error("Không thể cập nhật combo");
      }
      console.error("Error updating combo:", error);
>>>>>>> main
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
<<<<<<< HEAD
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa combo này?',
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          message.success('Xóa combo thành công!');
          fetchCombos();
        } catch (error) {
          message.error('Không thể xóa combo');
=======
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa combo này?",
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          message.success("Xóa combo thành công!");
          fetchCombos();
        } catch (error) {
          message.error("Không thể xóa combo");
>>>>>>> main
          console.error(error);
        }
      },
    });
  };

  const columns = [
<<<<<<< HEAD
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString(),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => <img src={image} alt="combo" className={styles.tableImage} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Combo) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
=======
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
      render: (image: string) => (
        <img src={image} alt="combo" className={styles.tableImage} />
      ),
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
>>>>>>> main
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={styles.comboContainer}>
      <h2>Danh sách Combo</h2>
<<<<<<< HEAD
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Thêm Combo
      </Button>
      <Table columns={columns} dataSource={combos} rowKey="id" loading={loading} />
      <Modal
        title={isEditMode ? 'Sửa Combo' : 'Thêm Combo'}
=======
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
>>>>>>> main
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
<<<<<<< HEAD
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
=======
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
>>>>>>> main
          style={{ marginBottom: 16 }}
        />
        <Tooltip title="Số lượng phải là số nguyên lớn hơn hoặc bằng 1">
          <Input
            type="number"
            placeholder="Số lượng"
            value={formData.quantity}
<<<<<<< HEAD
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
=======
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
>>>>>>> main
            style={{ marginBottom: 16 }}
            min={1} // Giới hạn giá trị nhỏ nhất
          />
        </Tooltip>
        <Tooltip title="Giá phải là số lớn hơn hoặc bằng 0 (VNĐ)">
          <Input
            type="number"
            placeholder="Giá (VNĐ)"
            value={formData.price}
<<<<<<< HEAD
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
=======
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
>>>>>>> main
            style={{ marginBottom: 16 }}
            min={0} // Giới hạn giá trị nhỏ nhất
          />
        </Tooltip>
        <Input
          placeholder="URL ảnh combo"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          style={{ marginBottom: 16 }}
        />
      </Modal>
    </div>
  );
};

<<<<<<< HEAD
export default ComboPage;
=======
export default ComboPage;
>>>>>>> main
