import { Divider } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import "../InfoMovie/InfoMovie.css";
const SeatInfo = () => {
    const { quantitySeats, typeSeats, nameSeats, totalSeatPrice } =
        useMessageContext();
    return (
        <div>
            <Divider className="divider-custom" dashed />
            <div className="booking-seats">
                <div className="seat-item">
                    <div className="seat-info">
                        <div className="seat-count">
                            <span className="number">
                                {quantitySeats === 0
                                    ? ""
                                    : `${quantitySeats} x `}
                            </span>
                            <span className="seat-type">
                                Ghế đơn{typeSeats}
                            </span>
                        </div>
                        <span className="seat-numbers">
                            <span>Ghế:</span>
                            <span className="seat-name">
                                {nameSeats.join(",")}
                            </span>
                        </span>
                    </div>
                    <div className="seat-price">
                        {parseInt(totalSeatPrice)}đ
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatInfo;
