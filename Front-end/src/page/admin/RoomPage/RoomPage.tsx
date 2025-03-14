import React, { useState, useEffect } from "react";
import { Layout, Breadcrumb, Button, Table, Modal, message, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import roomService from "../../../services/room.service";
import seatService from "../../../services/seat.service";
import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "../../../types/room.types";
import {
  SeatingMatrix,
  SeatInMatrix,
  SeatCreateRequest,
  Seat,
  SeatUpdateRequest,
} from "../../../types/seat.types";
import RoomForm from "../../../AdminComponents/room/RoomForm";
import SeatForm from "../../../AdminComponents/seat/SeatForm";

const { Content } = Layout;

interface RoomTableDataSource {
  key: string;
  name: string;
  capacity: number;
  room_type: string;
}

interface SeatType {
  id: number;
  name: string;
  price: number;
}

const RoomPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [seats, setSeats] = useState<SeatingMatrix>({});
  const [selectedSeat, setSelectedSeat] = useState<Seat | null | undefined>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const seatTypes: SeatType[] = [
    { id: 1, name: "Thường", price: 50000 },
    { id: 2, name: "VIP", price: 100000 },
    { id: 3, name: "Sweetbox", price: 150000 },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomService.getRooms();
      setRooms(response.rooms);
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
      const response = await roomService.createRoom(newRoom);
      await fetchRooms();
      setIsRoomModalOpen(false);
      message.success(response.message || "Thêm phòng mới thành công");
    } catch (error: any) {
      message.error(error.error || error.message || "Lỗi khi tạo phòng");
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
      const response = await roomService.updateRoom(roomId, updatedRoom);
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
      await seatService.createSeat(newSeat);
      message.success("Thêm ghế mới thành công");
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Lỗi khi tạo ghế";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultipleSeats = async (newSeats: SeatCreateRequest[]) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      if (
        selectedRoom &&
        Object.keys(seats).length + newSeats.length > selectedRoom.capacity
      ) {
        message.error(
          `Không thể thêm. Tổng số ghế không được vượt quá sức chứa phòng (${selectedRoom.capacity})`
        );
        return;
      }

      const responses = await Promise.all(
        newSeats.map((seat) => seatService.createSeat(seat))
      );
      message.success(`Đã thêm ${responses.length} ghế mới thành công`);
      setSelectedSeat(null);
      fetchSeats(selectedRoomId);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Lỗi khi tạo ghế";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeat = async (
    seatId: number,
    updatedSeat: Partial<Seat>
  ) => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      const seatData: SeatUpdateRequest = {
        row: updatedSeat.row,
        column: updatedSeat.column,
        seat_type_id: updatedSeat.seat_type_id,
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
      content:
        "Bạn có chắc muốn xóa tất cả ghế trong phòng này? Hành động này không thể hoàn tác.",
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
      setSelectedRoom(room);
      setSelectedRoomId(roomId);
      fetchSeats(roomId);
      setIsSeatModalOpen(true);
      setSelectedSeat(null);
    } else {
      message.error("Không tìm thấy thông tin phòng");
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
              onClick={() => showSeatModal(Number(room.id))}
              style={{
                background: "var(--primary-color)",
                color: "var(--word-color)",
                marginRight: 8,
              }}
              disabled={loading}
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

  const getTotalSeatsCount = (): number => {
    let count = 0;
    Object.keys(seats).forEach((row) => {
      count += Object.keys(seats[row]).length;
    });
    return count;
  };

  const renderSeatMatrix = () => {
    const rows = Object.keys(seats).sort();
    if (rows.length === 0) {
      return (
        <div className="empty-seats">Chưa có ghế nào trong phòng này.</div>
      );
    }

    return (
      <div className="seat-matrix">
        {rows.map((row) => {
          const rowSeats = Object.values(seats[row] || {}).sort((a, b) => {
            const getColumnNumber = (seatCode: string): number => {
              const numberMatch = seatCode.match(/\d+$/);
              return numberMatch ? parseInt(numberMatch[0], 10) : 0;
            };
            return getColumnNumber(a.seatCode) - getColumnNumber(b.seatCode);
          });
          return (
            <div key={row} className="seat-row">
              <div className="seat-row-label">{row}</div>
              {rowSeats.map((seat) => (
                <div
                  key={seat.seatCode}
                  className={`seat-item ${
                    seat.status === "booked" ? "seat-booked" : "seat-available"
                  }`}
                  style={{
                    backgroundColor: getSeatColor(seat.type),
                    border: "1px solid var(--border-color)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSeatClick(seat)}
                >
                  {seat.seatCode}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSeatClick = (seat: SeatInMatrix) => {
    const fullSeat: Seat = {
      id: seat.id,
      room_id: selectedRoomId!,
      row: seat.seatCode.charAt(0),
      column: seat.seatCode.substring(1),
      seat_type_id: seatTypes.find((t) => t.name === seat.type)?.id || 1,
    };
    setSelectedSeat(fullSeat);
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

  const handleSeatSubmit = (
    data: SeatCreateRequest | SeatCreateRequest[] | Seat
  ) => {
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
            open={isRoomModalOpen}
            onCancel={() => {
              setIsRoomModalOpen(false);
              setEditingRoom(null);
            }}
            footer={null}
            maskClosable={false}
            key={editingRoom ? `room-${editingRoom.id}` : "new-room"}
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

          <Modal
            title={
              selectedRoom
                ? `Quản lý ghế - Phòng ${
                    selectedRoom.name
                  } (${getTotalSeatsCount()}/${selectedRoom.capacity} ghế)`
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
          >
            <div className="seat-page-header" style={{ marginBottom: "20px" }}>
              <Button
                onClick={() => setSelectedSeat(undefined)}
                style={{
                  background: "var(--backgroud-product)",
                  color: "var(--word-color)",
                  marginRight: 8,
                }}
                disabled={
                  loading ||
                  (selectedRoom &&
                    getTotalSeatsCount() >= selectedRoom.capacity)
                }
              >
                Thêm Ghế Mới
              </Button>
              <Button
                onClick={handleDeleteAllSeats}
                style={{ background: "#ff4d4f", color: "var(--word-color)" }}
                disabled={loading || getTotalSeatsCount() === 0}
              >
                Xóa Tất Cả Ghế
              </Button>
            </div>

            {selectedRoom && getTotalSeatsCount() >= selectedRoom.capacity && (
              <div style={{ color: "orange", marginBottom: "10px" }}>
                Đã đạt giới hạn sức chứa của phòng. Không thể thêm ghế mới.
              </div>
            )}

            {renderSeatMatrix()}
          </Modal>

          <Modal
            title="Thêm Ghế Mới"
            open={selectedSeat === undefined}
            onCancel={() => setSelectedSeat(null)}
            footer={null}
          >
            <SeatForm
              onSubmit={handleSeatSubmit}
              roomId={selectedRoomId!}
              seatTypes={seatTypes}
              existingSeats={seats}
              maxSeats={
                selectedRoom ? selectedRoom.capacity - getTotalSeatsCount() : 0
              }
            />
          </Modal>

          {selectedSeat && (
            <Modal
              title="Chỉnh sửa Ghế"
              open={!!selectedSeat}
              onCancel={() => setSelectedSeat(null)}
              footer={null}
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
