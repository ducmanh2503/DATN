import { useState } from "react";
import "./BookingSeat.css";
import { Card, message, Tooltip } from "antd";
interface SeatType {
    id: string;
    type: "normal" | "vip" | "seatbox" | "empty";
    seatNumber: string;
}
const BookingSeat = ({ className }: any) => {
    const [selectedRoom, setSelectedRoom] = useState<string>("P01");
    const [selectedType, setSelectedType] = useState<
        "normal" | "vip" | "seatbox" | "empty"
    >("normal");
    const [matrixSize, setMatrixSize] = useState({ rows: 10, cols: 16 });
    const [rowInput, setRowInput] = useState("10");
    const [colInput, setColInput] = useState("16");

    const [matrix, setMatrix] = useState<SeatType[][]>(
        Array(matrixSize.rows)
            .fill(null)
            .map((_, rowIndex) =>
                Array(matrixSize.cols)
                    .fill(null)
                    .map((_, colIndex) => ({
                        id: `${String.fromCharCode(65 + rowIndex)}${(
                            colIndex + 1
                        )
                            .toString()
                            .padStart(2, "0")}`,
                        type: "normal",
                        seatNumber: `${String.fromCharCode(65 + rowIndex)}${(
                            colIndex + 1
                        )
                            .toString()
                            .padStart(2, "0")}`,
                    }))
            )
    );

    const handleSeatClick = (rowIndex: number, colIndex: number) => {
        const newMatrix = [...matrix];
        newMatrix[rowIndex][colIndex] = {
            ...newMatrix[rowIndex][colIndex],
            type: selectedType,
        };
        setMatrix(newMatrix);
    };

    const getSeatColor = (type: string) => {
        switch (type) {
            case "normal":
                return "#8c8c8c";
            case "vip":
                return "#1890ff";
            case "seatbox":
                return "#f5222d";
            case "empty":
                return "transparent";
            default:
                return "#8c8c8c";
        }
    };

    const handleUpdateMatrix = () => {
        const rows = parseInt(rowInput);
        const cols = parseInt(colInput);
        if (rows > 0 && cols > 0 && rows <= 26 && cols <= 20) {
            setMatrixSize({ rows, cols });
            setMatrix(
                Array(rows)
                    .fill(null)
                    .map((_, rowIndex) =>
                        Array(cols)
                            .fill(null)
                            .map((_, colIndex) => ({
                                id: `${String.fromCharCode(65 + rowIndex)}${(
                                    colIndex + 1
                                )
                                    .toString()
                                    .padStart(2, "0")}`,
                                type: "normal",
                                seatNumber: `${String.fromCharCode(
                                    65 + rowIndex
                                )}${(colIndex + 1)
                                    .toString()
                                    .padStart(2, "0")}`,
                            }))
                    )
            );
        } else {
            message.error("Số hàng tối đa là 26 và số cột tối đa là 20");
        }
    };
    return (
        <div className={`booking-seat ${className}`}>
            <div>
                <Card
                    title="Sơ đồ phòng chiếu"

                    // bodyStyle={{ padding: "32px" }}
                >
                    <div
                        style={{
                            backgroundColor: "#1a1a1a",
                            padding: "12px",
                            textAlign: "center",
                            color: "white",
                            marginBottom: "32px",

                            transform: "perspective(300px) rotateX(-10deg)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            width: "80%",
                            margin: "0 auto 40px",
                        }}
                    >
                        MÀN HÌNH
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            overflowX: "auto",
                            padding: "20px",
                        }}
                    >
                        {matrix.map((row, rowIndex) => (
                            <div
                                key={rowIndex}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "30px",
                                        textAlign: "center",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {String.fromCharCode(65 + rowIndex)}
                                </div>
                                {row.map((seat, colIndex) => (
                                    <Tooltip
                                        key={seat.id}
                                        title={`${
                                            seat.seatNumber
                                        } - ${seat.type.toUpperCase()}`}
                                    >
                                        <button
                                            style={{
                                                width: "35px",
                                                height: "35px",
                                                backgroundColor: getSeatColor(
                                                    seat.type
                                                ),
                                                border:
                                                    seat.type === "empty"
                                                        ? "1px dashed #ccc"
                                                        : "none",
                                                color:
                                                    seat.type === "empty"
                                                        ? "#ccc"
                                                        : "white",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "11px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                margin: "2px",
                                                transition: "all 0.3s",
                                            }}
                                            onClick={() =>
                                                handleSeatClick(
                                                    rowIndex,
                                                    colIndex
                                                )
                                            }
                                        >
                                            {colIndex + 1}
                                        </button>
                                    </Tooltip>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: "32px",
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px",
                            padding: "16px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "#8c8c8c",
                                    borderRadius: "4px",
                                }}
                            />
                            <span>Ghế thường</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "#1890ff",
                                    borderRadius: "4px",
                                }}
                            />
                            <span>Ghế VIP</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "#f5222d",
                                    borderRadius: "4px",
                                }}
                            />
                            <span>Ghế seatbox</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    border: "1px dashed #ccc",
                                    borderRadius: "4px",
                                }}
                            />
                            <span>Ô trống</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BookingSeat;
