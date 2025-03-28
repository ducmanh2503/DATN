import { useState } from 'react';
import { Table, Button, Input, Modal, message, Upload } from 'antd';
import { PlusOutlined, EditOutlined, SaveOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import styles from './Combo.module.css';

// Định nghĩa type cho dữ liệu combo
type Combo = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
};

const Combo = () => {
  const [combos, setCombos] = useState<Combo[]>([
    {
      id: 'COMBO001',
      name: 'Combo A',
      description: 'Gói combo tiết kiệm',
      quantity: 10,
      price: 150000,
      image: 'https://example.com/images/comboA.jpg',
    },
    {
      id: 'COMBO002',
      name: 'Combo B',
      description: 'Gói combo gia đình',
      quantity: 5,
      price: 250000,
      image: 'https://example.com/images/comboB.jpg',
    },
    {
      id: 'COMBO003',
      name: 'Combo C',
      description: 'Gói combo cao cấp',
      quantity: 8,
      price: 350000,
      image: 'https://example.com/images/comboC.jpg',
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    image: '',
  });
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Mở modal để thêm hoặc sửa
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
      setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: combo.image }]);
    } else {
      setIsEditMode(false);
      setCurrentCombo(null);
      setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({ name: '', description: '', quantity: 0, price: 0, image: '' });
    setFileList([]);
  };

  // Xử lý upload file
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].status === 'done') {
      setFormData({ ...formData, image: newFileList[0].url || '' });
    }
  };

  // Thêm combo mới
  const handleAdd = () => {
    if (!formData.name || !formData.price || fileList.length === 0) {
      message.error('Vui lòng nhập đầy đủ thông tin và chọn hình ảnh!');
      return;
    }
    const newCombo: Combo = {
      id: `COMBO${(combos.length + 1).toString().padStart(3, '0')}`,
      ...formData,
      image: fileList[0].url || 'https://example.com/images/default.jpg', // Giả lập URL từ file
    };
    setCombos([...combos, newCombo]);
    message.success('Thêm combo thành công!');
    handleCancel();
  };

  // Cập nhật combo
  const handleUpdate = () => {
    if (!currentCombo || !formData.name || !formData.price || fileList.length === 0) {
      message.error('Vui lòng nhập đầy đủ thông tin và chọn hình ảnh!');
      return;
    }
    const updatedCombos = combos.map((combo) =>
      combo.id === currentCombo.id
        ? { ...combo, ...formData, image: fileList[0].url || combo.image }
        : combo
    );
    setCombos(updatedCombos);
    message.success('Cập nhật combo thành công!');
    handleCancel();
  };

  // Xóa combo
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa combo này?',
      onOk: () => {
        setCombos(combos.filter((combo) => combo.id !== id));
        message.success('Xóa combo thành công!');
      },
    });
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên Combo',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
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
      render: (image: string) => (
        <img src={image} alt="combo" className={styles.tableImage} />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Combo) => (
        <div>
          <Button
            type="primary"
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
        </div>
      ),
    },
  ];

  return (
    <div className={styles.comboContainer}>
      <h2 className={styles.title}>Danh sách Combo</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        className={styles.addButton}
      >
        Thêm Combo
      </Button>

      <Table
        columns={columns}
        dataSource={combos}
        rowKey="id"
        className={styles.comboTable}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={isEditMode ? 'Sửa Combo' : 'Thêm Combo'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            onClick={isEditMode ? handleUpdate : handleAdd}
          >
            {isEditMode ? 'Update' : 'Thêm'}
          </Button>,
        ]}
      >
        <Input
          placeholder="Tên combo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={styles.inputField}
        />
        <Input
          placeholder="Mô tả"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={styles.inputField}
        />
        <Input
          type="number"
          placeholder="Số lượng"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: Number(e.target.value) })
          }
          className={styles.inputField}
        />
        <Input
          type="number"
          placeholder="Giá (VNĐ)"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          className={styles.inputField}
        />
        <Upload
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={() => false} // Ngăn upload tự động, chỉ lưu file tạm thời
          listType="picture"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default Combo;