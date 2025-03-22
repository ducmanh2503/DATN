import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import styles from "./SuccesResult.module.css";
import { useNavigate } from "react-router-dom";
import { useStepsContext } from "../../../UseContext/StepsContext";
import { useFinalPriceContext } from "../../../UseContext/FinalPriceContext";
import { useFilmContext } from "../../../UseContext/FIlmContext";
import { useSeatsContext } from "../../../UseContext/SeatsContext";
import { useComboContext } from "../../../UseContext/CombosContext";
import dayjs from "dayjs";
import useShowtimeData from "../../../refreshDataShowtimes/RefreshDataShowtimes";

const SuccesResult = () => {
  const {
    showtimesTime,
    showtimesEndTime,
    showtimesDate,
    roomNameShowtimes,
    roomTypeShowtimes,
  } = useFilmContext();
  const { nameSeats, totalSeatPrice } = useSeatsContext();
  const { totalComboPrice, nameCombo } = useComboContext();
  const { dataDetailFilm } = useStepsContext();
  const { totalPrice } = useFinalPriceContext();
  const { resetDataShowtimes } = useShowtimeData();

  const navigate = useNavigate();
  const currentYear = dayjs().year();
  return (
    <div className={clsx(styles.container, "main-base")}>
      <div className={clsx(styles.header)}>
        <span className={clsx(styles.icon)}>
          <FontAwesomeIcon icon={faCheck} />
        </span>
        <h4 className={clsx(styles.successMessage)}>Đặt vé thành công!</h4>
        <p className={clsx(styles.orderInfo)}>
          Forest Cinema cảm ơn bạn đã thanh toán thành công đơn hàng #99999
        </p>
      </div>

      <div className={clsx(styles.ticketInfo)}>
        <div className={clsx(styles.movieInfo)}>
          <div className={clsx(styles.movieTitle)}>
            <span className={clsx(styles.ageLimit)}>16+</span>
            <h1 className={clsx(styles.movieName)}>{dataDetailFilm?.title}</h1>
          </div>
          <hr className={clsx(styles.divider)} />
          <div className={clsx(styles.sessionDetails)}>
            <div className={clsx(styles.timeDate, styles.flexType)}>
              <div className={clsx(styles.detailItem)}>
                <h5 className={clsx(styles.titleInfo)}>thời gian</h5>
                <span className={clsx(styles.valueInfo)}>
                  {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")} ~
                  {dayjs(showtimesEndTime, "HH:mm:ss").format("HH:mm")}
                </span>
              </div>
              <div className={clsx(styles.detailItem)}>
                <h5 className={clsx(styles.titleInfo, styles.dateItem)}>
                  Ngày chiếu
                </h5>
                <span className={clsx(styles.valueInfo)}>
                  {dayjs(
                    `${showtimesDate}/${currentYear}`,
                    "DD/MM/YYYY"
                  ).format("YYYY/MM/DD")}
                </span>
              </div>
            </div>

            <div className={clsx(styles.roomFormat, styles.flexType)}>
              <div className={clsx(styles.detailItem)}>
                <h5 className={clsx(styles.titleInfo)}>Phòng chiếu</h5>
                <span className={clsx(styles.valueInfo)}>
                  {roomNameShowtimes}
                </span>
              </div>
              <div className={clsx(styles.detailItem)}>
                <h5 className={clsx(styles.titleInfo)}>Định dạng</h5>
                <span className={clsx(styles.valueInfo)}>
                  {roomTypeShowtimes}
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div className={clsx(styles.seatCombo)}>
            <div className={clsx(styles.seats)}>
              <h5 className={clsx(styles.titleInfo)}>ghế</h5>
              <div className={clsx(styles.flexType)}>
                <span className={clsx(styles.valueInfo)}>
                  {nameSeats.join(",")}
                </span>
                <span className={clsx(styles.valueInfo)}>
                  {totalSeatPrice}đ
                </span>
              </div>
            </div>
            <div className={clsx(styles.combo)}>
              <h5 className={clsx(styles.titleInfo)}>Bắp - Nước</h5>

              {nameCombo.map((item: any) => {
                return (
                  <>
                    <div className={clsx(styles.comboItem, styles.flexType)}>
                      <div>
                        <span className={clsx(styles.valueInfo)}>
                          {item?.defaultQuantityCombo}
                        </span>{" "}
                        x{" "}
                        <span className={clsx(styles.valueInfo)}>
                          {item?.name}
                        </span>
                      </div>
                      <span className={clsx(styles.valueInfo)}>
                        {item?.price * item?.defaultQuantityCombo}đ
                      </span>
                    </div>
                  </>
                );
              })}

              {/* <div
                                className={clsx(
                                    styles.comboItem,
                                    styles.flexType
                                )}
                            >
                                <div>
                                    <span className={clsx(styles.valueInfo)}>
                                        2
                                    </span>{" "}
                                    x{" "}
                                    <span className={clsx(styles.valueInfo)}>
                                        Combo B
                                    </span>
                                </div>
                                <span className={clsx(styles.valueInfo)}>
                                    300000đ
                                </span>
                            </div> */}
            </div>
          </div>

          <hr className={clsx(styles.divider)} />

          <div className={clsx(styles.summary)}>
            <div className={clsx(styles.summaryItem, styles.flexType)}>
              <h5 className={clsx(styles.titleInfoPrice)}>Tạm tính</h5>
              <span className={clsx(styles.valueInfo)}>
                {totalComboPrice + totalSeatPrice}đ
              </span>
            </div>
            <div className={clsx(styles.summaryItem, styles.flexType)}>
              <h5 className={clsx(styles.titleInfoPrice)}>Giảm giá</h5>
              <span className={clsx(styles.valueInfo)}>0đ</span>
            </div>
            <div
              className={clsx(
                styles.summaryItem,
                styles.total,
                styles.flexType
              )}
            >
              <h5 className={clsx(styles.titleInfoPrice)}>Thành tiền</h5>
              <span className={clsx(styles.valueInfo)}>{totalPrice}đ</span>
            </div>
          </div>

          <div className={clsx(styles.loyaltyPoints)}>
            Tích lũy được <span className={clsx(styles.pointsNumber)}>90</span>{" "}
            điểm <span className={clsx(styles.points)}>Stars</span>
          </div>
        </div>

        <div className={clsx(styles.qrSection)}>
          <div className={clsx(styles.qrCodeBox)}>
            <img
              className={clsx(styles.qrCode)}
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
              alt="QR Code"
            />
          </div>
          <div className={clsx(styles.qrNote)}>
            mã QR được sử dụng khi quét vé tại rạp
          </div>
        </div>
      </div>

      <div className={clsx(styles.btnLink)}>
        <button
          className={clsx(styles.homeButton)}
          onClick={() => {
            navigate("/");
            resetDataShowtimes();
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default SuccesResult;
