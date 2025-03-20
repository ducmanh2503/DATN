import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Layout, Breadcrumb, Button, Table, Modal, message, Spin, Tag } from "antd";
=======
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Modal,
  message,
  Spin,
  Tag,
} from "antd";
>>>>>>> main
import { ColumnsType } from "antd/es/table";
import roomService from "../../../services/room.service";
import seatService from "../../../services/seat.service";
import { Room, RoomCreateRequest, RoomUpdateRequest } from "../../../types/room.types";
import {
  SeatingMatrix,
  SeatInMatrix,
  SeatCreateRequest,
  Seat,
  SeatUpdateRequest,
  SeatType,
} from "../../../types/seat.types";
import RoomForm from "../../../AdminComponents/room/RoomForm";
import SeatForm from "../../../AdminComponents/seat/SeatForm";

const { Content } = Layout;

interface RoomTableDataSource {
  key: string;
  name: string;
  capacity: number;
  room_type: string;
  status: string;
}

const RoomPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [seats, setSeats] = useState<SeatingMatrix>({});
  const [selectedSeat, setSelectedSeat] = useState<Seat | null | undefined>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
<<<<<<< HEAD
=======

>>>>>>> main
  const seatTypes = [
    { id: 1, name: "Thường", price: 50000 },
    { id: 2, name: "VIP", price: 100000 },
    { id: 3, name: "Sweetbox", price: 150000 },
  ];
  const roomTypes = [
    { id: 1, name: '2D' },
    { id: 2, name: '3D' },
    { id: 3, name: '4D' }
  ];

  const roomTypes = [
    { id: 1, name: "2D" },
    { id: 2, name: "3D" },
    { id: 3, name: "4D" },
    { id: 4, name: "IMAX" },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomService.getRooms();
<<<<<<< HEAD
      const roomsWithCapacity = response.rooms.map(room => ({
        ...room,
        capacity: room.capacity !== null && room.capacity !== undefined ? Number(room.capacity) : 0
=======
      const roomsWithCapacity = response.rooms.map((room) => ({
        ...room,
        capacity:
          room.capacity !== null && room.capacity !== undefined
            ? Number(room.capacity)
            : 0,
>>>>>>> main
      }));
      setRooms(roomsWithCapacity);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (roomId: number) => {
    setLoading(true);
    try {
      const data = await seatService.getSeats(roomId);
      setSeats(data);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải danh sách ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (newRoom: RoomCreateRequest) => {
    setLoading(true);
    try {
      const roomData = {
        ...newRoom,
        capacity: Number(newRoom.capacity)
      };
      const response = await roomService.createRoom(roomData);
      await fetchRooms();
      setIsRoomModalOpen(false);
      message.success(response.message || "Thêm phòng mới thành công");
    } catch (error: any) {
      message.error(error.error || error.message || "Lỗi khi tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string | number, updatedRoom: RoomUpdateRequest) => {
    setLoading(true);
    try {
      const roomData = {
        ...updatedRoom,
        capacity: updatedRoom.capacity !== undefined ? Number(updatedRoom.capacity) : undefined
      };
      const response = await roomService.updateRoom(roomId, roomData);
      await fetchRooms();
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      message.success(response.message || "Cập nhật phòng thành công");
    } catch (error: any) {
      message.error(error.error || error.message || "Lỗi khi cập nhật phòng");
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
      const response = await roomService.deleteRooms({ ids });
      await fetchRooms();
      setSelectedRowKeys([]);
      message.success(response.message || "Xóa phòng thành công");
    } catch (error: any) {
      message.error(error.message || "Lỗi khi xóa phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRoom = async (roomId: string | number) => {
    setLoading(true);
    try {
      const response = await roomService.restoreRoom(roomId);
      await fetchRooms();
      message.success(response.message || "Khôi phục phòng thành công");
    } catch (error: any) {
      message.error(error.message || "Lỗi khi khôi phục phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeat = async (newSeat: SeatCreateRequest) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
<<<<<<< HEAD
      console.log('Dữ liệu ghế chuẩn bị tạo:', newSeat);
      if (!newSeat.seat_status) {
        newSeat.seat_status = 'available';
=======
      console.log("Dữ liệu ghế chuẩn bị tạo:", newSeat);
      if (!newSeat.seat_status) {
        newSeat.seat_status = "available";
>>>>>>> main
      }
      await seatService.createSeat(newSeat);
      message.success("Thêm ghế mới thành công");
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi khi tạo ghế";
<<<<<<< HEAD
      console.error('Chi tiết lỗi tạo ghế:', error);
      if (error.status === 422) {
        if (error.details && error.details.seat_status) {
          message.error(`Lỗi: trường seat_status ${error.details.seat_status[0]}`);
        } else {
          message.error('Dữ liệu ghế không hợp lệ. Vui lòng kiểm tra thông tin ghế.');
=======
      console.error("Chi tiết lỗi tạo ghế:", error);
      if (error.status === 422) {
        if (error.details && error.details.seat_status) {
          message.error(
            `Lỗi: trường seat_status ${error.details.seat_status[0]}`
          );
        } else {
          message.error(
            "Dữ liệu ghế không hợp lệ. Vui lòng kiểm tra thông tin ghế."
          );
>>>>>>> main
        }
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultipleSeats = async (newSeats: SeatCreateRequest[]) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
<<<<<<< HEAD
      if (selectedRoom) {
        const totalSeatsCount = getTotalSeatsCount() + newSeats.length;
        if (totalSeatsCount > selectedRoom.capacity) {
          throw new Error(`Không thể thêm. Tổng số ghế không được vượt quá sức chứa phòng (${selectedRoom.capacity})`);
        }
      }
=======
>>>>>>> main
      const responses = await Promise.all(
        newSeats.map((seat) => seatService.createSeat(seat))
      );
      message.success(`Đã thêm ${responses.length} ghế mới thành công`);
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      const errorMessage = error.error || error.message || "Lỗi khi tạo ghế";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeat = async (seatId: number, updatedSeat: Partial<Seat>) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      const seatData: SeatUpdateRequest = {
        row: updatedSeat.row,
        column: updatedSeat.column,
        seat_type_id: updatedSeat.seat_type_id,
        seat_status: updatedSeat.seat_status,
      };
      await seatService.updateSeat(seatId, seatData);
      message.success("Cập nhật ghế thành công");
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi cập nhật ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeat = async (seatId: number) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      await seatService.deleteSeat(seatId);
      message.success("Xóa ghế thành công");
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi xóa ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSeats = async () => {
    if (!selectedRoomId) return;
    Modal.confirm({
      title: "Xác nhận xóa tất cả ghế",
      content: "Bạn có chắc muốn xóa tất cả ghế trong phòng này? Hành động này không thể hoàn tác.",
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await seatService.deleteAllSeatsInRoom(selectedRoomId);
          message.success("Xóa tất cả ghế trong phòng thành công");
          fetchSeats(selectedRoomId);
        } catch (error: any) {
          message.error(error.message || "Lỗi khi xóa tất cả ghế");
        } finally {
          setLoading(false);
        }
      },
      okButtonProps: {
        style: {
          background: "var(--normal-rank)",
          color: "var(--word-color)",
          border: "none",
        },
      },
    });
  };

  const showSeatModal = (roomId: number) => {
    const room = rooms.find((r) => Number(r.id) === roomId);
    if (room) {
      setSelectedRoomId(roomId);
      setSelectedRoom(room);
      fetchSeats(roomId);
      setIsSeatModalOpen(true);
      setSelectedSeat(null);
    } else {
      message.error("Không tìm thấy thông tin phòng");
    }
  };

  const getTotalSeatsCount = (): number => {
    if (!seats || Object.keys(seats).length === 0) {
      return 0;
    }
    let count = 0;
    Object.keys(seats).forEach((row) => {
<<<<<<< HEAD
      if (seats[row] && typeof seats[row] === 'object') {
=======
      if (seats[row] && typeof seats[row] === "object") {
>>>>>>> main
        count += Object.keys(seats[row]).length;
      }
    });
    return count;
  };

  const handleSeatClick = (seat: SeatInMatrix) => {
    const fullSeat: Seat = {
      id: seat.id,
      room_id: selectedRoomId!,
      row: seat.seatCode.charAt(0),
      column: seat.seatCode.substring(1),
      seat_type_id: seatTypes.find((t) => t.name === seat.type)?.id || 1,
      seat_status: seat.status,
    };
    setSelectedSeat(fullSeat);
  };

  const columns: ColumnsType<RoomTableDataSource> = [
    { title: "Tên Phòng", dataIndex: "name", key: "name" },
    { title: "Sức Chứa", dataIndex: "capacity", key: "capacity" },
    { title: "Loại Phòng", dataIndex: "room_type", key: "room_type" },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
<<<<<<< HEAD
      render: (status: string) => (
        status === 'active' 
          ? <Tag color="green">Hoạt động</Tag> 
          : <Tag color="red">Đang bảo trì</Tag>
      ),
=======
      render: (status: string) =>
        status === "active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Đang bảo trì</Tag>
        ),
>>>>>>> main
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_: any, record: RoomTableDataSource) => {
        const room = rooms.find((r) => String(r.id) === String(record.key));
        if (!room) return null;
        const isDeleted = !!room.deleted_at;
        return (
<<<<<<< HEAD
          <div style={{ display: 'flex', gap: '8px' }}>
=======
          <div style={{ display: "flex", gap: "8px" }}>
>>>>>>> main
            <Button
              onClick={() => showSeatModal(Number(room.id))}
              style={{
                background: "var(--primary-color)",
                color: "var(--word-color)",
              }}
              disabled={loading || isDeleted}
            >
              Quản lý Ghế
            </Button>
            <Button
              onClick={() => {
                setEditingRoom(room);
                setIsRoomModalOpen(true);
              }}
              style={{
                background: "var(--primary-color)",
                color: "var(--word-color)",
              }}
              disabled={loading || isDeleted}
            >
              Sửa
            </Button>
            {!isDeleted ? (
              <Button
                onClick={() => showDeleteConfirm([String(room.id)])}
                style={{
                  background: "var(--normal-rank)",
                  color: "var(--word-color)",
                }}
                disabled={loading}
              >
                Xóa
              </Button>
            ) : (
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
          </div>
        );
      },
    },
  ];

  const dataSource: RoomTableDataSource[] = rooms.map((room) => {
<<<<<<< HEAD
    // Find the room type name based on room_type_id
    const roomType = roomTypes.find(type => type.id === room.room_type_id);
    return {
      key: String(room.id),
      name: room.name,
      capacity: Number(room.capacity) || 0, // Ensure capacity is a number
      room_type: roomType ? roomType.name : 'Unknown',
      status: room.deleted_at ? 'deleted' : 'active',
=======
    const roomType = roomTypes.find((type) => type.id === room.room_type_id);
    return {
      key: String(room.id),
      name: room.name,
      capacity: Number(room.capacity) || 0,
      room_type: roomType ? roomType.name : "Unknown",
      status: room.deleted_at ? "deleted" : "active",
>>>>>>> main
    };
  });

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

  const renderSeatMatrix = () => {
    const rows = Object.keys(seats).sort();
    if (rows.length === 0) {
      return <div className="empty-seats">Chưa có ghế nào trong phòng này.</div>;
    }

    return (
      <div className="seat-matrix">
        {rows.map((row) => {
          const rowSeats = Object.values(seats[row] || {})
<<<<<<< HEAD
            .filter(seat => seat && typeof seat === 'object')
            .sort((a, b) => {
              const getColumnNumber = (seatCode: string): number => {
                if (!seatCode || typeof seatCode !== 'string') return 0;
=======
            .filter((seat) => seat && typeof seat === "object")
            .sort((a, b) => {
              const getColumnNumber = (seatCode: string): number => {
                if (!seatCode || typeof seatCode !== "string") return 0;
>>>>>>> main
                const numberMatch = seatCode.match(/\d+$/);
                return numberMatch ? parseInt(numberMatch[0], 10) : 0;
              };
              return getColumnNumber(a.seatCode) - getColumnNumber(b.seatCode);
            });
<<<<<<< HEAD
          
          return (
            <div key={row} className="seat-row">
              <div className="seat-row-label">{row}</div>
              <div className="seat-row-items" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {rowSeats.map((seat) => {
                  const seatCode = typeof seat.seatCode === 'string' ? seat.seatCode : `${row}?`;
                  const status = typeof seat.status === 'string' ? seat.status : 'available';
                  const type = typeof seat.type === 'string' ? seat.type : 'Thường';
                  return (
                    <div
                      key={seatCode}
                      className={`seat-item ${status === "booked" ? "seat-booked" : "seat-available"}`}
=======

          return (
            <div key={row} className="seat-row">
              <div className="seat-row-label">{row}</div>
              <div
                className="seat-row-items"
                style={{ display: "flex", flexWrap: "wrap" }}
              >
                {rowSeats.map((seat) => {
                  const seatCode =
                    typeof seat.seatCode === "string"
                      ? seat.seatCode
                      : `${row}?`;
                  const status =
                    typeof seat.status === "string" ? seat.status : "available";
                  const type =
                    typeof seat.type === "string" ? seat.type : "Thường";
                  return (
                    <div
                      key={seatCode}
                      className={`seat-item ${
                        status === "booked" ? "seat-booked" : "seat-available"
                      }`}
>>>>>>> main
                      style={{
                        backgroundColor: getSeatColor(type),
                        color: "white",
                        padding: "8px",
                        borderRadius: "4px",
                        textAlign: "center",
                        margin: "4px",
                        cursor: "pointer",
<<<<<<< HEAD
                        width: "40px",
                        height: "40px",
=======
                        width: "20px",
                        height: "20px",
>>>>>>> main
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seatCode}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getSeatColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "thường":
        return "var(--normal-rank)";
      case "vip":
        return "var(--first-rank)";
      case "sweetbox":
        return "var(--secound-rank)";
      default:
        return "var(--mainBase-color)";
    }
  };

  const handleSeatSubmit = (data: SeatCreateRequest | SeatCreateRequest[] | Seat) => {
    if (Array.isArray(data)) {
      handleCreateMultipleSeats(data);
    } else if ("id" in data) {
      handleUpdateSeat(data.id, data);
    } else {
      handleCreateSeat(data);
    }
  };

  return (
    <Layout className="full-page-layout">
<<<<<<< HEAD
      <Content className="full-page-content" style={{ padding: '24px' }}>
=======
      <Content className="full-page-content" style={{ padding: "24px" }}>
>>>>>>> main
        <Spin spinning={loading}>
          <Breadcrumb
            items={[
              { title: "Trang quản lý phòng chiếu" },
              { title: "Hiển thị danh sách phòng chiếu (2D, 3D, 4D, IMAX)" },
            ]}
          />
<<<<<<< HEAD
          <div className="room-page-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            margin: '24px 0' 
          }}>
=======
          <div
            className="room-page-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "24px 0",
            }}
          >
>>>>>>> main
            <h2>Quản Lý Phòng Chiếu</h2>
            <div>
              <Button
                onClick={() => {
                  setEditingRoom(null);
                  setIsRoomModalOpen(true);
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
            </div>
          </div>
<<<<<<< HEAD
          
=======

>>>>>>> main
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={paginationConfig}
            loading={loading}
            rowKey="key"
          />

          {/* Room Modal */}
          <Modal
            title={editingRoom ? "Cập nhật phòng" : "Thêm phòng mới"}
            open={isRoomModalOpen}
            onCancel={() => {
              setIsRoomModalOpen(false);
              setEditingRoom(null);
            }}
            footer={null}
            maskClosable={false}
            destroyOnClose
          >
            <RoomForm
              onSubmit={
                editingRoom
                  ? (data) => handleUpdateRoom(editingRoom.id, data as RoomUpdateRequest)
                  : (data) => handleCreateRoom(data as RoomCreateRequest)
              }
              room={editingRoom}
              roomTypes={roomTypes}
              loading={loading}
              onCancel={() => {
                setIsRoomModalOpen(false);
                setEditingRoom(null);
              }}
            />
          </Modal>

          {/* Seat Matrix Modal */}
          <Modal
            title={
              selectedRoomId
<<<<<<< HEAD
                ? `Quản lý ghế - Phòng ${selectedRoom?.name} (${getTotalSeatsCount()}/${selectedRoom?.capacity} ghế)`
=======
                ? `Quản lý ghế - Phòng ${
                    selectedRoom?.name
                  } (${getTotalSeatsCount()}/${selectedRoom?.capacity} ghế)`
>>>>>>> main
                : "Quản lý ghế"
            }
            open={isSeatModalOpen}
            onCancel={() => {
              setIsSeatModalOpen(false);
              setSelectedRoomId(null);
              setSelectedRoom(null);
              setSelectedSeat(null);
            }}
            footer={null}
            width={800}
            destroyOnClose
          >
<<<<<<< HEAD
            <div className="seat-page-header" style={{ marginBottom: "20px", display: 'flex', gap: '8px' }}>
=======
            <div
              className="seat-page-header"
              style={{ marginBottom: "20px", display: "flex", gap: "8px" }}
            >
>>>>>>> main
              <Button
                onClick={() => setSelectedSeat(undefined)}
                style={{
                  background: "var(--backgroud-product)",
                  color: "var(--word-color)",
                }}
<<<<<<< HEAD
                // disabled={loading || (selectedRoom && getTotalSeatsCount() >= selectedRoom.capacity)}
=======
>>>>>>> main
              >
                Thêm Ghế Mới
              </Button>
              <Button
                onClick={handleDeleteAllSeats}
<<<<<<< HEAD
                style={{ 
                  background: "var(--normal-rank)", 
                  color: "var(--word-color)" 
=======
                style={{
                  background: "var(--normal-rank)",
                  color: "var(--word-color)",
>>>>>>> main
                }}
                disabled={loading || getTotalSeatsCount() === 0}
              >
                Xóa Tất Cả Ghế
              </Button>
            </div>

<<<<<<< HEAD
            {selectedRoomId && selectedRoom && getTotalSeatsCount() >= selectedRoom.capacity && (
              <div style={{ color: "orange", marginBottom: "10px" }}>
                Đã đạt giới hạn sức chứa của phòng. Không thể thêm ghế mới.
              </div>
            )}

            <div className="seat-matrix-container" style={{ 
              marginTop: '20px',
              padding: '20px', 
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9' 
            }}>
              <div className="screen" style={{ 
                height: '30px', 
                backgroundColor: '#ddd', 
                marginBottom: '30px',
                textAlign: 'center',
                borderRadius: '4px',
                position: 'relative'
              }}>
                <span style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)' }}>
                  Màn hình
                </span>
              </div>
              {seats && Object.keys(seats).length > 0 ? (
                renderSeatMatrix()
              ) : (
                <div className="empty-seats">Chưa có ghế nào trong phòng này.</div>
=======
            <div
              className="seat-matrix-container"
              style={{
                marginTop: "20px",
                padding: "20px",
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div
                className="screen"
                style={{
                  height: "30px",
                  backgroundColor: "#ddd",
                  marginBottom: "30px",
                  textAlign: "center",
                  borderRadius: "4px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "40px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Màn hình
                </span>
              </div>
              {seats && Object.keys(seats).length > 0 ? (
                renderSeatMatrix()
              ) : (
                <div className="empty-seats">
                  Chưa có ghế nào trong phòng này.
                </div>
>>>>>>> main
              )}
            </div>
          </Modal>

          {/* Add Seat Modal */}
          <Modal
            title="Thêm Ghế Mới"
            open={selectedSeat === undefined}
            onCancel={() => setSelectedSeat(null)}
            footer={null}
            destroyOnClose
          >
            <SeatForm
              onSubmit={handleSeatSubmit}
              roomId={selectedRoomId!}
              seatTypes={seatTypes}
              existingSeats={seats}
<<<<<<< HEAD
              maxSeats={selectedRoomId && selectedRoom ? selectedRoom.capacity - getTotalSeatsCount() : 0}
=======
              maxSeats={
                selectedRoomId && selectedRoom
                  ? selectedRoom.capacity - getTotalSeatsCount()
                  : 0
              }
>>>>>>> main
            />
          </Modal>

          {/* Edit Seat Modal */}
          {selectedSeat && (
            <Modal
              title="Chỉnh sửa Ghế"
              open={!!selectedSeat}
              onCancel={() => setSelectedSeat(null)}
              footer={null}
              destroyOnClose
            >
              <SeatForm
                onSubmit={handleSeatSubmit}
                onDelete={handleDeleteSeat}
                roomId={selectedRoomId!}
                seatTypes={seatTypes}
                seat={selectedSeat}
                isEditing={true}
                existingSeats={seats}
              />
            </Modal>
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default RoomPage;