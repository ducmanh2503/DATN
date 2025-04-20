import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import styles from "./SuccesResult.module.css";
import { useNavigate } from "react-router-dom";
import { useFinalPriceContext } from "../../../UseContext/FinalPriceContext";
import { useFilmContext } from "../../../UseContext/FIlmContext";
import { useSeatsContext } from "../../../UseContext/SeatsContext";
import { useComboContext } from "../../../UseContext/CombosContext";
import dayjs from "dayjs";
import useShowtimeData from "../../../refreshDataShowtimes/RefreshDataShowtimes";
import { usePromotionContext } from "../../../UseContext/PromotionContext";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useGetQRTicket } from "../../../../services/adminServices/getQR.service";
import { useEffect, useState } from "react";
import { URL_IMAGE } from "../../../../config/ApiConfig";
import { useInfomationContext } from "../../../UseContext/InfomationContext";

const SuccesResult = () => {
    const [qrCode, setQrCode] = useState<string>(""); // State QR code image
    const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);

    const {
        showtimesTime,
        showtimesEndTime,
        showtimesDate,
        roomNameShowtimes,
        roomTypeShowtimes,
    } = useFilmContext();
    const { nameSeats, totalSeatPrice } = useSeatsContext();
    const { totalComboPrice, nameCombo } = useComboContext();
    const { totalPrice } = useFinalPriceContext();
    const { totalPricePoint, totalPriceVoucher, rankUser } =
        usePromotionContext();
    const { setCountInfomation, setTextInfomation } = useInfomationContext();

    const { resetDataShowtimes } = useShowtimeData();
    const storedMovie = sessionStorage.getItem("dataDetailFilm");
    // Kiểm tra giá trị null trước khi parse
    const movieData = storedMovie ? JSON.parse(storedMovie) : null;

    const navigate = useNavigate();

    const currentYear = dayjs().year(); //lấy năm hiện tại
    const today = dayjs().format("DD/MM/YYYY"); // lấy ngày hôm nay
    const showtimesDateFormat = dayjs(
        `${showtimesDate}/${currentYear}`,
        "DD/MM/YYYY"
    ).format("YYYY/MM/DD"); // ngày chiếu film đã format

    const startTimeFilm = dayjs(showtimesTime, "HH:mm:ss").format("HH:mm"); // lấy giờ bắt đầu chiếu phim

    // xử lý tải ảnh về máy
    const downloadBlobImage = async (imageUrl: string, fileName: string) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
    };

    // lấy QR được tạo
    const handleDownload = () => {
        const imageUrl = `/storage/image/${qrCode}`;
        downloadBlobImage(imageUrl, "poster.jpg");
    };

    // gọi api lấy QR
    const { mutate } = useGetQRTicket();

    // xử lý api
    useEffect(() => {
        mutate(undefined, {
            onSuccess: (result) => {
                setQrCode(`data:image/png;base64,${result.data.qr_code}`);
            },
        });
    }, []);

    // tính điểm tích lũy
    useEffect(() => {
        let points = 0;
        const finalPrice =
            (totalPrice - totalPricePoint - totalPriceVoucher) / 1000;

        if (rankUser === "diamond") {
            points = Math.floor(finalPrice * 0.1);
        } else if (rankUser === "gold") {
            points = Math.floor(finalPrice * 0.05);
        } else {
            points = Math.floor(finalPrice * 0.03);
        }

        setLoyaltyPoints(points);
    }, [totalPrice, totalPricePoint, totalPriceVoucher, rankUser]);

    useEffect(() => {
        setCountInfomation((prev: number) => prev + 1);
        setTextInfomation((prev: any[]) => [
            ...prev,
            {
                id: prev.length + 1,
                title: `Đặt vé thành công!`,
                content: `Bạn có hẹn với phim ${movieData?.title} vào ngày ${showtimesDateFormat} lúc ${startTimeFilm}`,
                date: today,
            },
        ]);
    }, []); // meesagwe ở avatar

    return (
        <div className={clsx(styles.container, "main-base")}>
            <div className={clsx(styles.header)}>
                <span className={clsx(styles.icon)}>
                    <FontAwesomeIcon icon={faCheck} />
                </span>
                <h4 className={clsx(styles.successMessage)}>
                    Đặt vé thành công!
                </h4>
                <p className={clsx(styles.orderInfo)}>
                    Forest Cinema cảm ơn bạn đã thanh toán thành công đơn hàng
                    #XXXX
                </p>
            </div>

            <div className={clsx(styles.ticketInfo)}>
                <div className={clsx(styles.movieInfo)}>
                    <div className={clsx(styles.movieTitle)}>
                        <span className={clsx(styles.ageLimit)}>16+</span>
                        <h1 className={clsx(styles.movieName)}>
                            {movieData?.title}
                        </h1>
                    </div>
                    <hr className={clsx(styles.divider)} />
                    <div className={clsx(styles.sessionDetails)}>
                        <div className={clsx(styles.timeDate, styles.flexType)}>
                            <div className={clsx(styles.detailItem)}>
                                <h5 className={clsx(styles.titleInfo)}>
                                    thời gian
                                </h5>
                                <span className={clsx(styles.valueInfo)}>
                                    {startTimeFilm} ~{" "}
                                    {dayjs(showtimesEndTime, "HH:mm:ss").format(
                                        "HH:mm"
                                    )}
                                </span>
                            </div>
                            <div className={clsx(styles.detailItem)}>
                                <h5
                                    className={clsx(
                                        styles.titleInfo,
                                        styles.dateItem
                                    )}
                                >
                                    Ngày chiếu
                                </h5>
                                <span className={clsx(styles.valueInfo)}>
                                    {showtimesDateFormat}
                                </span>
                            </div>
                        </div>

                        <div
                            className={clsx(styles.roomFormat, styles.flexType)}
                        >
                            <div className={clsx(styles.detailItem)}>
                                <h5 className={clsx(styles.titleInfo)}>
                                    Phòng chiếu
                                </h5>
                                <span className={clsx(styles.valueInfo)}>
                                    {roomNameShowtimes}
                                </span>
                            </div>
                            <div className={clsx(styles.detailItem)}>
                                <h5 className={clsx(styles.titleInfo)}>
                                    Định dạng
                                </h5>
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
                                    {totalSeatPrice.toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                        </div>
                        <div className={clsx(styles.combo)}>
                            <h5 className={clsx(styles.titleInfo)}>
                                Bắp - Nước
                            </h5>

                            {nameCombo.map((item: any) => {
                                return (
                                    <>
                                        <div
                                            className={clsx(
                                                styles.comboItem,
                                                styles.flexType
                                            )}
                                        >
                                            <div>
                                                <span
                                                    className={clsx(
                                                        styles.valueInfo
                                                    )}
                                                >
                                                    {item?.defaultQuantityCombo}
                                                </span>{" "}
                                                x{" "}
                                                <span
                                                    className={clsx(
                                                        styles.valueInfo
                                                    )}
                                                >
                                                    {item?.name}
                                                </span>
                                            </div>
                                            <span
                                                className={clsx(
                                                    styles.valueInfo
                                                )}
                                            >
                                                {(
                                                    item?.price *
                                                    item?.defaultQuantityCombo
                                                ).toLocaleString("vi-VN")}
                                                đ
                                            </span>
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    </div>

                    <hr className={clsx(styles.divider)} />

                    <div className={clsx(styles.summary)}>
                        <div
                            className={clsx(
                                styles.summaryItem,
                                styles.flexType
                            )}
                        >
                            <h5 className={clsx(styles.titleInfoPrice)}>
                                Tạm tính
                            </h5>
                            <span className={clsx(styles.valueInfo)}>
                                {(
                                    totalComboPrice + totalSeatPrice
                                ).toLocaleString("vi-VN")}
                                đ
                            </span>
                        </div>
                        <div
                            className={clsx(
                                styles.summaryItem,
                                styles.flexType
                            )}
                        >
                            <h5 className={clsx(styles.titleInfoPrice)}>
                                Giảm giá
                            </h5>
                            <span className={clsx(styles.valueInfo)}>
                                {(
                                    totalPricePoint + totalPriceVoucher
                                ).toLocaleString("vi-VN")}
                                đ
                            </span>
                        </div>
                        <hr />
                        <div
                            className={clsx(
                                styles.summaryItem,
                                styles.total,
                                styles.flexType
                            )}
                        >
                            <h5 className={clsx(styles.titleInfoPrice)}>
                                Thành tiền
                            </h5>
                            <span className={clsx(styles.valueInfo)}>
                                {(
                                    totalPrice -
                                    totalPricePoint -
                                    totalPriceVoucher
                                ).toLocaleString("vi-VN")}
                                đ
                            </span>
                        </div>
                    </div>

                    <div className={clsx(styles.loyaltyPoints)}>
                        Tích lũy được{" "}
                        <span className={clsx(styles.pointsNumber)}>
                            {loyaltyPoints}
                        </span>{" "}
                        điểm <span className={clsx(styles.points)}>Stars</span>
                    </div>
                </div>

                <div className={clsx(styles.qrSection)}>
                    <div className={clsx(styles.qrCodeBox)}>
                        {qrCode ? (
                            <img
                                className={clsx(styles.qrCode)}
                                src={qrCode}
                                alt="QR Code"
                            />
                        ) : (
                            <img
                                className={clsx(styles.qrCode)}
                                src={`${URL_IMAGE}/defaultComingSoon.jpg`}
                                alt=""
                            />
                        )}
                    </div>
                    <div className={clsx(styles.qrNote)}>
                        mã QR được sử dụng khi quét vé tại rạp
                    </div>
                    <div
                        className={clsx(styles.saveQR)}
                        onClick={handleDownload}
                    >
                        <VerticalAlignBottomOutlined /> Lưu QR
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
