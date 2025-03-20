import { Divider, Image } from "antd";
import "./InfoMovie.css";
const InfoMovie = () => {
<<<<<<< HEAD
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
=======
  const { filmId, showtimesTime, showtimesDate } = useFilmContext();
  const { quantityCombo } = useComboContext();
  const { quantitySeats } = useSeatsContext();
  const { setDataDetailFilm, dataDetailFilm } = useStepsContext();
  const { totalPrice } = useFinalPriceContext();

  // lấy detail film
  const { data: detailFilm } = useQuery({
    queryKey: ["film", filmId],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:8000/api/movie-details-booking/${filmId}`
      );
      // console.log("detail-id", data.data);

      return data.data;
    },

    staleTime: 1000 * 60 * 10,
  });

  // Gán data detail film vào state để quản lý
  useEffect(() => {
    setDataDetailFilm(detailFilm);
  }, [detailFilm]);

  // lấy dữ liệu từ sessionStorage
  const check = sessionStorage.getItem("dataDetailFilm");

  //chuyển đổi về dạng obj
  const chuyendoi = check ? JSON.parse(check) : null;

  // console.log(sessionStorage.getItem("dataDetailFilm"));
  return (
    <div className={clsx(styles.infoMovie)}>
      <div className={clsx(styles.bookingFilm)}>
        <div className={clsx(styles.filmImage)}>
          <Image
            className={clsx(styles.filmThumbnail)}
            src={`${URL_IMAGE}${detailFilm?.poster}`}
          />
>>>>>>> main
        </div>
        <div className={clsx(styles.filmInfo)}>
          <div className={clsx(styles.infoTitle, "cliptextTitle")}>
            {chuyendoi?.title}
          </div>
          <div className={clsx(styles.infoGenres)}>
            {chuyendoi?.genres.map((genre: any, index: number) => (
              <span key={index} className={clsx(styles.genreItem)}>
                {genre.name_genre}
              </span>
            ))}
          </div>
          <div className={clsx(styles.infoSub)}>
            <span className={clsx(styles.subRoomType)}>2D</span>
            <span className={clsx(styles.subForm)}>{chuyendoi?.language}</span>
            <div className={clsx(styles.subRated)}>{chuyendoi?.rated}</div>
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

      {(quantitySeats && <SeatInfo />) === 0 ? "" : <SeatInfo />}
      {(quantityCombo && <ComboInfo />) === 0 ? "" : <ComboInfo />}

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
