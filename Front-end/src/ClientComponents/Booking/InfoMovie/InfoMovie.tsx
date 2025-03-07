import { Divider, Image } from "antd";
import "./InfoMovie.css";
import { useMessageContext } from "../../UseContext/ContextState";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_IMAGE } from "../../../config/ApiConfig";
import SeatInfo from "../SeatInfo/SeatInfo";
import ComboInfo from "../ComboInfo/ComboInfo";
import dayjs from "dayjs";
const InfoMovie = () => {
    const {
        filmId,
        showtimesTime,
        showtimesDate,
        totalPrice,
        quantitySeats,
        quantityCombo,
    } = useMessageContext();
    const { data: detailFilm } = useQuery({
        queryKey: ["film", filmId],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/movie-details-booking/${filmId}`
            );
            console.log("http://localhost:8000", data);

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
    });
    return (
        <div className=" info-movie">
            <div className="booking-film">
                <div className="film-image">
                    <Image
                        className="film-thumbnail"
                        src={`${URL_IMAGE}${detailFilm?.poster}`}
                    />
                </div>
                <div className="film-info">
                    <div className="info-title cliptextTitle">
                        {detailFilm?.title}
                    </div>
                    <div className="info-genres">
                        {detailFilm?.genres.map((genre: any, index: number) => (
                            <span key={index} className="genre-item">
                                {genre.name_genre}
                            </span>
                        ))}
                    </div>
                    <div className="info-sub">
                        <span className="sub-room-type">2D</span>
                        <span className="sub-form">{detailFilm?.language}</span>
                        <div className="sub-rated">{detailFilm?.rated}</div>
                    </div>
                </div>
            </div>

            <div className="booking-detail">
                <span>
                    Suất:{" "}
                    <span className="detail-time">
                        {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")}
                    </span>
                </span>{" "}
                -<span className="detail-day"> {showtimesDate}</span>
            </div>

            <>
                {(quantitySeats && <SeatInfo />) === 0 ? "" : <SeatInfo />}
                {(quantityCombo && <ComboInfo />) === 0 ? "" : <ComboInfo />}
            </>

            <div className="booking-total">
                <Divider className="divider-custom" dashed />
                <div className="total-info">
                    <div className="total-label">Tổng cộng</div>
                    <div className="total-price">{parseInt(totalPrice)}đ</div>
                </div>
            </div>
        </div>
    );
};
export default InfoMovie;
