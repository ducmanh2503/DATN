import React, { useState, useEffect } from "react";
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Modal,
  message,
  Spin,
  ColumnsType,
} from "antd";
import roomService from "../../../services/room.service";
import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
  RoomTableDataSource,
} from "../../../types/room.types";
import RoomForm from "../../../AdminComponents/room/RoomForm";
// import './RoomPage.css';

const { Content } = Layout;

const RoomPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomService.getRooms();
      setRooms(response.rooms);
    } catch (error: any) {
      message.error(error.error || "Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (newRoom: RoomCreateRequest) => {
    setLoading(true);
    try {
      await roomService.createRoom(newRoom);
      await fetchRooms();
      setIsModalOpen(false);
      message.success("Thêm phòng mới thành công");
    } catch (error: any) {
      message.error(error.error || "Lỗi khi tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async (
    roomId: string | number,
    updatedRoom: RoomUpdateRequest
  ) => {
    setLoading(true);
    try {
      await roomService.updateRoom(roomId, updatedRoom);
      await fetchRooms();
      setIsModalOpen(false);
      setEditingRoom(null);
      message.success("Cập nhật phòng thành công");
    } catch (error: any) {
      message.error(error.error || "Lỗi khi cập nhật phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRooms = async (ids: string[]) => {
    if (!ids.length) {
      message.warning("Vui lòng chọn ít nhất một phòng để xóa");
      return;
    }
    setLoading(true);
    try {
      await roomService.deleteRooms({ ids });
      await fetchRooms();
      setSelectedRowKeys([]);
      message.success("Xóa phòng thành công");
    } catch (error: any) {
      message.error(error.error || "Lỗi khi xóa phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRoom = async (roomId: string | number) => {
    setLoading(true);
    try {
      await roomService.restoreRoom(roomId);
      await fetchRooms();
      message.success("Khôi phục phòng thành công");
    } catch (error: any) {
      message.error(error.error || "Lỗi khi khôi phục phòng");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<RoomTableDataSource> = [
    { title: "Tên Phòng", dataIndex: "name", key: "name" },
    { title: "Sức Chứa", dataIndex: "capacity", key: "capacity" },
    { title: "Loại Phòng", dataIndex: "room_type", key: "room_type" },
    {
      title: "Hành Động",
      key: "action",
      render: (_: any, record: RoomTableDataSource) => {
        const room = rooms.find((r) => String(r.id) === String(record.key));
        if (!room) return null;
        return (
          <>
            <Button
              onClick={() => {
                setEditingRoom(room);
                setIsModalOpen(true);
              }}
              style={{
                background: "var(--primary-color)",
                color: "var(--word-color)",
                marginRight: 8,
              }}
              disabled={loading}
            >
              Sửa
            </Button>
            <Button
              onClick={() => showDeleteConfirm([String(room.id)])}
              style={{
                background: "var(--normal-rank)",
                color: "var(--word-color)",
                marginRight: 8,
              }}
              disabled={loading || !!room.deleted_at}
            >
              Xóa
            </Button>
            {room.deleted_at && (
              <Button
                onClick={() => handleRestoreRoom(room.id)}
                style={{
                  background: "var(--backgroud-product)",
                  color: "var(--word-color)",
                }}
                disabled={loading}
              >
                Khôi Phục
              </Button>
            )}
          </>
        );
      },
    },
  ];

  const dataSource: RoomTableDataSource[] = rooms.map((room) => ({
    key: String(room.id),
    name: room.name,
    capacity: room.capacity,
    room_type: room.room_type,
  }));

  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    total: dataSource.length,
    showTotal: (total: number, range: [number, number]) =>
      `Hiển thị ${range[0]}-${range[1]} trong ${total} phòng`,
  };

  const showDeleteConfirm = (ids: string[]) => {
    Modal.confirm({
      title: "Xác nhận xóa phòng",
      content:
        "Bạn có chắc muốn xóa các phòng đã chọn? Hành động này sẽ xóa mềm (có thể khôi phục).",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => handleDeleteRooms(ids),
      okButtonProps: {
        style: {
          background: "var(--normal-rank)",
          color: "var(--word-color)",
          border: "none",
        },
      },
      cancelButtonProps: { disabled: loading },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys.map(String));
    },
    getCheckboxProps: (record: RoomTableDataSource) => ({
      disabled:
        rooms.find((r) => String(r.id) === String(record.key))?.deleted_at !==
        null,
    }),
  };

  return (
    <Layout className="full-page-layout">
      <Content className="full-page-content">
        <Spin spinning={loading}>
          <Breadcrumb
            items={[
              { title: "Trang quản lý phòng chiếu" },
              { title: "Hiển thị danh sách phòng chiếu (2D, 3D, 4D)" },
            ]}
          />
          <div className="room-page-header">
            <h2>Quản Lý Phòng Chiếu</h2>
            <div>
              <Button
                onClick={() => {
                  setEditingRoom(null);
                  setIsModalOpen(true);
                }}
                style={{
                  background: "var(--backgroud-product)",
                  color: "var(--word-color)",
                  marginRight: 8,
                }}
                disabled={loading}
              >
                Thêm Phòng Mới
              </Button>
              <Button
                onClick={() => showDeleteConfirm(selectedRowKeys)}
                style={{
                  background: "#ff4d4f",
                  color: "var(--word-color)",
                  border: "none",
                }}
                disabled={loading || !selectedRowKeys.length}
              >
                Xóa Nhiều Phòng
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={paginationConfig}
            rowSelection={rowSelection}
            className="full-page-table"
          />
          <Modal
            title={editingRoom ? "Cập Nhật Phòng" : "Thêm Phòng Mới"}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingRoom(null);
            }}
            footer={null}
            maskClosable={false}
            key={editingRoom ? editingRoom.id : "new"} // Thêm key để reset modal khi editingRoom thay đổi
          >
            <RoomForm
              onSubmit={
                editingRoom
                  ? (data) =>
                      handleUpdateRoom(
                        editingRoom.id,
                        data as RoomUpdateRequest
                      )
                  : (data) => handleCreateRoom(data as RoomCreateRequest)
              }
              room={editingRoom}
            />
          </Modal>
        </Spin>
      </Content>
    </Layout>
  );
};

export default RoomPage;
