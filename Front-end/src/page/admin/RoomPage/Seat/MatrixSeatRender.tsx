import clsx from "clsx";
import styles from "./SeatManage.module.css";
import { useGetSeatsByRoom } from "../../../../services/adminServices/seatManage.service";
import { Spin } from "antd";
import { useAdminContext } from "../../../../AdminComponents/UseContextAdmin/adminContext";
import { useEffect, useState } from "react";
import EditSeats from "./EditSeats";

const MatrixSeatRender = ({ roomId }: { roomId: string }) => {
    const [selectedSeat, setSelectedSeat] = useState<{
        row: string;
        col: string;
        id: number;
        type: string;
    } | null>(null); // lưu ghế chọn vào state
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { setRowSeats } = useAdminContext();
    const { data: SeatsByRoom, isLoading } = useGetSeatsByRoom(Number(roomId)); // api lấy danh sách loại ghế

    useEffect(() => {
        if (SeatsByRoom && typeof SeatsByRoom === "object") {
            const rows = Object.keys(SeatsByRoom); // Lấy danh sách hàng
            setRowSeats(rows);
        }
    }, [SeatsByRoom, setRowSeats]);

    const handleSeatClick = (
        row: string,
        col: string,
        id: number,
        type: string
    ) => {
        setSelectedSeat({ row, col, id, type });
        setIsModalOpen(true);
    };
    return (
        <div>
            <div className={clsx(styles.screen)}>MÀN HÌNH</div>
            {isLoading ? (
                <div className={clsx(styles.loadingIcon)}>
                    <Spin></Spin>
                </div>
            ) : (
                <div className={styles.seatMatrix}>
                    {Object.entries(SeatsByRoom).map(([row, cols]) => {
                        if (!cols || typeof cols !== "object") return null; // Kiểm tra cols có hợp lệ không

                        return (
                            <div key={row} className={styles.seatRow}>
                                <div className={clsx(styles.rowLabel)}>
                                    {row}
                                </div>
                                <div className={clsx(styles.rowSeats)}>
                                    {Object.entries(cols).map(([col, seat]) => {
                                        if (!seat || typeof seat !== "object")
                                            return null; // Kiểm tra seat hợp lệ

                                        let normalType = seat.type === "Thường";
                                        let VIPType = seat.type === "VIP";
                                        let SweetboxType =
                                            seat.type === "Sweetbox";
                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                className={clsx(
                                                    styles.seat,
                                                    normalType &&
                                                        styles.normalType,
                                                    VIPType && styles.VIPType,
                                                    SweetboxType &&
                                                        styles.SweetboxType
                                                )}
                                                onClick={() =>
                                                    handleSeatClick(
                                                        row,
                                                        col,
                                                        seat.id,
                                                        seat.type
                                                    )
                                                }
                                            >
                                                {row}
                                                {col}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <EditSeats
                isModalOpen={isModalOpen}
                handleOk={() => setIsModalOpen(false)}
                handleCancel={() => setIsModalOpen(false)}
                selectedSeat={selectedSeat}
            />
        </div>
    );
};

export default MatrixSeatRender;
