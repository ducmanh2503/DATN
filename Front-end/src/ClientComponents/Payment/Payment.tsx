import { useLocation, useNavigate } from "react-router-dom";
import ClientLayout from "../../page/client/Layout";
import "./Payment.css";

const Payment = () => {
    const location = useLocation();
    const { selectedSeats, totalPrice } = location.state || {};
    const navigate = useNavigate();

    const handleConfirmPayment = () => {
        alert(`Đặt vé thành công! Tổng tiền: ${totalPrice} VND`);
        navigate("/"); // Quay lại trang chính sau khi thanh toán
    };

    if (!selectedSeats || !totalPrice) {
        return <div className="error">Không có thông tin đặt vé</div>;
    }

    return (
        <ClientLayout>
            <div className="payment-container">
                <h1>Xác nhận thanh toán</h1>
                <div className="payment-details">
                    <h3>Thông tin vé:</h3>
                    <ul>
                        {selectedSeats.map((seat: any) => (
                            <li key={seat.id}>
                                Ghế {seat.seatCode} ({seat.type} - {seat.price} VND)
                            </li>
                        ))}
                    </ul>
                    <p>Tổng cộng: {totalPrice} VND</p>
                    <button className="confirm-btn" onClick={handleConfirmPayment}>
                        Xác nhận thanh toán
                    </button>
                </div>
            </div>
        </ClientLayout>
    );
};

export default Payment;