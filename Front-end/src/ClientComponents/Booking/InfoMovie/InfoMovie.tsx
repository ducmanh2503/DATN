import { Divider, Image } from "antd";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { URL_IMAGE } from "../../../config/ApiConfig";
import SeatInfo from "../SeatInfo/SeatInfo";
import ComboInfo from "../ComboInfo/ComboInfo";
import clsx from "clsx";
import styles from "./InfoMovie.module.css";
import { useMessageContext } from "../../UseContext/ContextState";
import { useEffect } from "react";

const InfoMovie = () => {
    const {
        filmId,
        showtimesTime,
        showtimesDate,
        totalPrice,
        quantitySeats,
        quantityCombo,
        setDataDetailFilm,
    } = useMessageContext();
    const { data: detailFilm } = useQuery({
        queryKey: ["film", filmId],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/movie-details-booking/${filmId}`
            );
            console.log("http://localhost:8000", data);
            console.log("detail-id", data.data);

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
    });
    useEffect(() => {
        setDataDetailFilm(detailFilm);
    }, detailFilm);
    return (
        <div className={clsx(styles.infoMovie)}>
            <div className={clsx(styles.bookingFilm)}>
                <div className={clsx(styles.filmImage)}>
                    <Image
                        className={clsx(styles.filmThumbnail)}
                        src={`${URL_IMAGE}${detailFilm?.poster}`}
                    />
                </div>
                <div className={clsx(styles.filmInfo)}>
                    <div className={clsx(styles.infoTitle, "cliptextTitle")}>
                        {detailFilm?.title}
                    </div>
                    <div className={clsx(styles.infoGenres)}>
                        {detailFilm?.genres.map((genre: any, index: number) => (
                            <span
                                key={index}
                                className={clsx(styles.genreItem)}
                            >
                                {genre.name_genre}
                            </span>
                        ))}
                    </div>
                    <div className={clsx(styles.infoSub)}>
                        <span className={clsx(styles.subRoomType)}>2D</span>
                        <span className={clsx(styles.subForm)}>
                            {detailFilm?.language}
                        </span>
                        <div className={clsx(styles.subRated)}>
                            {detailFilm?.rated}
                        </div>
                    </div>
                </div>
            </div>
      <div className={clsx(styles.bookingDetail)}>
        <span>
          Suất:{" "}
          <span className={clsx(styles.detailTime)}>
            {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")}
          </span>
        </span>{" "}
        -<span className={clsx(styles.detailDay)}> {showtimesDate}</span>
      </div>

      <>
        {(quantitySeats && <SeatInfo />) === 0 ? "" : <SeatInfo />}
        {(quantityCombo && <ComboInfo />) === 0 ? "" : <ComboInfo />}
      </>

      <div className={clsx(styles.bookingTotal)}>
        <Divider className={clsx(styles.dividerCustom)} dashed />
        <div className={clsx(styles.totalInfo)}>
          <div className={clsx(styles.totalLabel)}>Tổng cộng</div>
          <div className={clsx(styles.totalPrice)}>{parseInt(totalPrice)}đ</div>
        </div>
      </div>
    </div>
  );
};
export default InfoMovie;
