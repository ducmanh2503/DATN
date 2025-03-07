import { Divider, Image } from "antd";
import "./InfoMovie.css";
import { useMessageContext } from "../../UseContext/ContextState";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { GET_FILM_DETAIL, URL_IMAGE } from "../../../config/ApiConfig";
import SeatInfo from "../SeatInfo/SeatInfo";
import ComboInfo from "../ComboInfo/ComboInfo";
const InfoMovie = () => {
    const {
        filmId,
        showtimesTime,
        showtimesDate,
        currentStep,
        totalPrice,
        quantitySeats,
        quantityCombo,
    } = useMessageContext();
    const { data: detailFilm } = useQuery({
        queryKey: ["film", filmId],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_DETAIL(filmId));
            console.log("check-data-detail", data);

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
                        // src={`${URL_IMAGE}${detailFilm.poster}`}
                    />
                </div>
                <div className="film-info">
                    <div className="info-title cliptextTitle">
                        {/* {detailFilm.title} */}
                    </div>
                    <div className="info-genres">
                        {/* {detailFilm.genres
                            .map((genre: any) => genre.name_genre)
                            .join(", ")} */}
                    </div>
                    <div className="info-sub">
                        <span className="sub-room-type">2D</span>
                        <span className="sub-form">lồng tiếng</span>
                        {/* <span className="sub-rated">{detailFilm.rated}</span> */}
                    </div>
                </div>
            </div>

            <div className="booking-detail">
                {/* <span className="detail-time">Suất: {showtimesTime}</span> - */}
                {/* <span className="detail-day"> {showtimesDate}</span> */}
            </div>
            {/* {currentStep === 1 || currentStep === 2 ? ( */}
            <>
                {(quantitySeats && <SeatInfo />) === 0 ? "" : <SeatInfo />}
                {(quantityCombo && <ComboInfo />) === 0 ? "" : <ComboInfo />}
            </>
            {/* ) : null} */}
            <div className="booking-total">
                <Divider className="divider-custom" dashed />
                <div className="total-info">
                    <div className="total-label">Tổng cộng</div>
                    <div className="total-price">{totalPrice}đ</div>
                </div>
            </div>
        </div>
    );
};
export default InfoMovie;
