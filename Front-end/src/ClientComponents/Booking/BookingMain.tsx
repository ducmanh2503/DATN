import { message, notification, Steps } from "antd";
import BookingSeat from "./BookingSeat/BookingSeat";
import BookingInfo from "./BookingInfo/BookingInfo";
import ComboFood from "./ComboFood/ComboFood";
import PaymentGate from "./PaymentGate/PaymentGate";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import axios from "axios";

import styles from "./BookingMain.module.css";
import { useMessageContext } from "../UseContext/ContextState";

const BookingMain = () => {
  const {
    currentStep,
    setCurrentStep,
    quantitySeats,
    selectedSeatIds,
    roomIdFromShowtimes,
    showtimeIdFromBooking,
    setSeats,
  } = useMessageContext();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Thông báo phải đặt ghế để tiếp tục
  const openNotification = (pauseOnHover: boolean) => () => {
    api.open({
      message: (
        <>
          <span className={clsx(styles.notificationIcon)}>
            <CloseCircleOutlined />
          </span>{" "}
          Không thể tiếp tục...
        </>
      ),
      description: "Phải đặt ghế nếu bạn muốn tiếp tục",
      showProgress: true,
      pauseOnHover,
    });
  };

  //api giữ ghế
  const holdSeatMutation = useMutation({
    mutationFn: async (seatIds: number[]) => {
      const { data } = await axios.post(
        "http://localhost:8000/api/hold-seats",
        {
          seats: seatIds,
          room_id: roomIdFromShowtimes,
          showtime_id: showtimeIdFromBooking,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      return data;
    },
    onSuccess: () => {
      setSeats((prevSeats: any) => {
        const updatedSeats = { ...prevSeats };
        //
        return updatedSeats;
      });
      message.success("Đã giữ ghế thành công!");
    },
    onError: (error) => {
      console.error("🚨 Lỗi khi giữ ghế:", error);
      message.error("Không thể giữ ghế. Vui lòng thử lại!");
    },
  });

  // const getDetailCard = () => {};

  // Xử lý khi ấn tiếp tục
  const nextStep = () => {
    if (currentStep === 1 && quantitySeats === 0) {
      openNotification(false)();
      return;
    }

    if (currentStep === 1 && quantitySeats !== 0) {
      holdSeatMutation.mutate(selectedSeatIds);
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Xử lý khi ấn quay lại
  const prevStep = () => {
    if (currentStep === 2 && selectedSeatIds.length > 0) {
      releaseSeatsMutation.mutate(selectedSeatIds);
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (currentStep === 0) {
      navigate("/playingFilm");
    }
  }, [currentStep, navigate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <BookingSeat className={clsx(styles.bookingLeft)} />
            <BookingInfo
              className={clsx(styles.bookingRight)}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </>
        );
      case 2:
        return (
          <>
            <ComboFood className={clsx(styles.bookingLeft)} />
            <BookingInfo
              className={clsx(styles.bookingRight)}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </>
        );
      case 3:
        return (
          <>
            <PaymentGate className={clsx(styles.bookingLeft)} />
            <BookingInfo
              className={clsx(styles.bookingRight)}
              nextStep={nextStep}
              prevStep={prevStep}
              currentStep={currentStep}
            />
          </>
        );
      case 4:
        return (
          <>
            <BookingInfo
              className={clsx(styles.bookingRight)}
              nextStep={nextStep}
              prevStep={prevStep}
              currentStep={currentStep}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={clsx("main-base")}>
      {contextHolder}
      <Steps
        className={clsx(styles.stepsBooking)}
        current={currentStep}
        items={[
          { title: "Chọn Phim" },
          { title: "Chọn ghế" },
          { title: "Chọn đồ ăn" },
          { title: "Chọn thanh toán" },
          { title: "Xác nhận" },
        ]}
      />
      <div className={clsx(styles.bookingMain)}>{renderStepContent()}</div>
    </div>
  );
};

export default BookingMain;
