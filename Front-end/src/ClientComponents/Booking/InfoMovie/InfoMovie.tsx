import { Divider, Image } from "antd";
import "./InfoMovie.css";
const InfoMovie = () => {
    return (
        <div className=" info-movie">
            <div className="booking-film">
                <div className="film-image">
                    <Image className="film-thumbnail" />
                </div>
                <div className="film-info">
                    <div className="info-title cliptextTitle">
                        Tên phim sadasd asdsad asda sdasdas á
                    </div>
                    <div className="info-genres">Thể loại</div>
                    <div className="info-sub">
                        <span className="sub-room-type">2D</span>
                        <span className="sub-form">lồng tiếng</span>
                        <span className="sub-rated">T16</span>
                    </div>
                </div>
            </div>

            <div className="booking-detail">
                <span className="detail-time">Suất: 13:15</span> -
                <span className="detail-day"> Ngày chiếu</span>
            </div>
            <Divider className="divider-custom" dashed />
            <div className="booking-seats">
                <div className="seat-item">
                    <div className="seat-info">
                        <div className="seat-count">
                            <span className="number">2</span> x
                            <span className="seat-type"> Ghế đơn</span>
                        </div>
                        <span className="seat-numbers">
                            Ghế: <span className="seat-name">E10</span>
                        </span>
                    </div>
                    <div className="seat-price">100.000đ</div>
                </div>
            </div>
            <div className="booking-combo">
                <Divider className="divider-custom" dashed />
                <div className="combo-item">
                    <div className="combo-info">
                        <span className="combo-count">1</span>x
                        <span className="combo-name">iCombo 2 Big STD</span>
                    </div>
                    <div className="combo-price">100.000đ</div>
                </div>
            </div>

            <div className="booking-total">
                <Divider className="divider-custom" dashed />
                <div className="total-info">
                    <div className="total-label">Tổng cộng</div>
                    <div className="total-price">100.000đ</div>
                </div>
            </div>
        </div>
    );
};

export default InfoMovie;
