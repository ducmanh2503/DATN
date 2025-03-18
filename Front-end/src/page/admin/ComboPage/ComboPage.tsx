import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import comboService from '../../../services/combo.service';
import { Combo } from '../../../types/combo.types';
import styles from './Combo.module.css';

const ComboPage = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    image: '', // Đây sẽ là URL dạng chuỗi
  });

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboService.getCombos();
      console.log('API Response:', response);
      setCombos(response.combo);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
      console.error('Error fetching combos:', error);
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
      setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      message.error('Vui lòng nhập đầy đủ thông tin, bao gồm URL ảnh!');
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
      message.success('Thêm combo thành công!');
      fetchCombos();
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const errorMessages = Object.values(error.details).flat().join(', ');
        message.error(`Không thể thêm combo: ${errorMessages}`);
      } else {
        message.error('Không thể thêm combo');
      }
      console.error('Error creating combo:', error);
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
      message.success('Cập nhật combo thành công!');
      fetchCombos();
      handleCancel();
    } catch (error: any) {
      if (error.status === 422 && error.details) {
        const errorMessages = Object.values(error.details).flat().join(', ');
        message.error(`Không thể cập nhật combo: ${errorMessages}`);
      } else {
        message.error('Không thể cập nhật combo');
      }
      console.error('Error updating combo:', error);
    }
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa combo này?',
      async onOk() {
        try {
          await comboService.deleteCombo(id);
          message.success('Xóa combo thành công!');
          fetchCombos();
        } catch (error) {
          message.error('Không thể xóa combo');
          console.error(error);
        }
      },
    });
  };

  const columns = [
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
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={styles.comboContainer}>
      <h2>Danh sách Combo</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Thêm Combo
      </Button>
      <Table columns={columns} dataSource={combos} rowKey="id" loading={loading} />
      <Modal
        title={isEditMode ? 'Sửa Combo' : 'Thêm Combo'}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ marginBottom: 16 }}
        />
        <Tooltip title="Số lượng phải là số nguyên lớn hơn hoặc bằng 1">
          <Input
            type="number"
            placeholder="Số lượng"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            style={{ marginBottom: 16 }}
            min={1} // Giới hạn giá trị nhỏ nhất
          />
        </Tooltip>
        <Tooltip title="Giá phải là số lớn hơn hoặc bằng 0 (VNĐ)">
          <Input
            type="number"
            placeholder="Giá (VNĐ)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
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

export default ComboPage;