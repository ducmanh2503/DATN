import React, { useState, useEffect } from "react";
import { Layout, Breadcrumb, Button, Modal, message, Spin } from "antd";
import seatService from "../../../services/seat.service";
import {
  SeatingMatrix,
  SeatMatrixItem,
  SeatCreateRequest,
  Seat,
  SeatType,
} from "../../../types/seat.types";
import SeatForm from "../../../AdminComponents/seat/SeatForm";
// import "./SeatPage.css";

const { Content } = Layout;

const SeatPage: React.FC = () => {
  const [seats, setSeats] = useState<SeatingMatrix>({});
  const [roomId, setRoomId] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeats();
    fetchSeatTypes();
  }, [roomId]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const data = await seatService.getSeatsByRoom(roomId);
      setSeats(data);
    } catch (error) {
      message.error(
        (error as { error?: string }).error || "Lỗi khi tải danh sách ghế"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatTypes = async () => {
    setLoading(true);
    try {
      const response = await seatService.getSeatTypes();
      const validSeatTypes = response.filter((st) =>
        ["Thường", "VIP", "Sweetbox"].includes(st.name)
      );
      setSeatTypes(validSeatTypes);
    } catch (error) {
      message.error("Lỗi khi tải danh sách loại ghế");
      setSeatTypes([
        { id: 1, name: "Thường", price: 50000 },
        { id: 2, name: "VIP", price: 100000 },
        { id: 3, name: "Sweetbox", price: 150000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeatStatus = async (
    seatId: number,
    newStatus: "available" | "booked"
  ) => {
    setLoading(true);
    try {
      const updatedSeat: Partial<Seat> = { seat_status: newStatus };
      await seatService.updateSeat(seatId, updatedSeat);
      message.success("Cập nhật trạng thái ghế thành công");
      fetchSeats();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeats = async (newSeats: SeatCreateRequest[] | Seat) => {
    setLoading(true);
    try {
      if (Array.isArray(newSeats)) {
        await seatService.createSeats(newSeats);
        message.success("Thêm ghế mới thành công");
      } else {
        // Cập nhật ghế hiện có
        const updatedSeat: Partial<Seat> = {
          id: newSeats.id,
          row: newSeats.row,
          column: newSeats.column,
          seat_type_id: newSeats.seat_type_id,
          seat_status: newSeats.seat_status,
        };
        await seatService.updateSeat(newSeats.id, updatedSeat);
        message.success("Cập nhật ghế thành công");
      }
      setIsModalOpen(false);
      setSelectedSeat(undefined);
      fetchSeats();
    } catch (error) {
      message.error(
        "Lỗi khi xử lý ghế: " + (error as Error).message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeat = async (seatId: number) => {
    setLoading(true);
    try {
      await seatService.deleteSeat(seatId);
      message.success("Xóa ghế thành công");
      fetchSeats();
    } catch (error) {
      message.error(
        "Lỗi khi xóa ghế: " + (error as Error).message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllSeats = async () => {
    setLoading(true);
    try {
      await seatService.deleteAllSeatsInRoom(roomId);
      message.success("Xóa tất cả ghế trong phòng thành công");
      fetchSeats();
    } catch (error) {
      message.error(
        "Lỗi khi xóa tất cả ghế: " + (error as Error).message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
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

  const renderSeatMatrix = () => {
    const rows = Object.keys(seats).sort();
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
                  className="seat-item seat-active"
                  style={{
                    backgroundColor: getSeatColor(seat.type),
                    border: "1px solid var(--border-color)",
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

  const handleSeatClick = (seat: SeatMatrixItem) => {
    const fullSeat: Seat = {
      id: seat.id,
      room_id: roomId,
      row: seat.seatCode.charAt(0),
      column: seat.seatCode.match(/\d+$/)?.[0] || "1",
      seat_type_id: seatTypes.find((t) => t.name === seat.type)?.id || 1,
      seat_status: seat.status,
      price: seat.price,
    };
    setSelectedSeat(fullSeat);
    setIsModalOpen(true);
  };

  return (
    <Layout className="full-page-layout">
      <Content className="full-page-content">
        <Spin spinning={loading}>
          <Breadcrumb
            items={[
              { title: "Trang quản lý ghế ngồi" },
              { title: "Hiển thị danh sách ghế trong rạp, từng phòng chiếu" },
            ]}
          />
          <div className="seat-page-header">
            <h2>Quản Lý Ghế Ngồi</h2>
            <div>
              <Button
                onClick={() => {
                  setSelectedSeat(undefined);
                  setIsModalOpen(true);
                }}
                style={{
                  background: "var(--backgroud-product)",
                  color: "var(--word-color)",
                  marginRight: 8,
                }}
                loading={loading}
                disabled={loading}
              >
                Thêm Ghế Mới
              </Button>
              <Button
                onClick={handleDeleteAllSeats}
                style={{ background: "#ff4d4f", color: "var(--word-color)" }}
                loading={loading}
                disabled={loading}
              >
                Xóa Tất Cả Ghế
              </Button>
            </div>
          </div>
          {renderSeatMatrix()}
          <Modal
            title={selectedSeat ? "Chỉnh sửa Ghế" : "Thêm Ghế Mới"}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedSeat(undefined);
            }}
            footer={null}
          >
            <SeatForm
              onSubmit={handleCreateSeats}
              onDelete={selectedSeat ? handleDeleteSeat : undefined}
              roomId={roomId}
              seatTypes={seatTypes}
              seat={selectedSeat}
              isEditing={!!selectedSeat}
              existingSeats={seats}
            />
          </Modal>
        </Spin>
      </Content>
    </Layout>
  );
};

export default SeatPage;
