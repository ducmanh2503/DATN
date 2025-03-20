import { Steps } from "antd";
import "./BookingMain.css";
import BookingSeat from "./BookingSeat/BookingSeat";
import BookingInfo from "./BookingInfo/BookingInfo";
import { useState } from "react";
import ComboFood from "./ComboFood/ComboFood";
import PaymentGate from "./PaymentGate/PaymentGate";

<<<<<<< HEAD
const Booking = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            // case 0:
            // return <BookingInfo nextStep={nextStep} prevStep={prevStep} />;
            case 1:
                return (
                    <>
                        <BookingSeat className="booking-left"></BookingSeat>
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        ></BookingInfo>
                    </>
                );
            case 2:
                return (
                    <>
                        <ComboFood className="booking-left"></ComboFood>
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        ></BookingInfo>
                    </>
                );
            case 3:
                return (
                    <>
                        <PaymentGate className="booking-left"></PaymentGate>
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        ></BookingInfo>
                    </>
                );
            case 4:
            // return <BookingConfirm prevStep={prevStep} />;
            default:
                return null;
        }
    };
    return (
        <div className="main-base">
            <Steps
                className="steps-booking"
                current={currentStep}
                items={[
                    {
                        title: "Chọn Phim",
                    },
                    {
                        title: "Chọn ghế",
                    },
                    {
                        title: "Chọn đồ ăn",
                    },
                    {
                        title: "Chọn thanh toán",
                    },
                    {
                        title: "Xác nhận",
                    },
                ]}
            />
            <div className="booking-main">{renderStepContent()}</div>
        </div>
    );
=======
import styles from "./BookingMain.module.css";
import CustomNotification from "./Notification/Notification";
import { useStepsContext } from "../UseContext/StepsContext";
import { useSeatsContext } from "../UseContext/SeatsContext";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useAuthContext } from "../UseContext/TokenContext";
import useShowtimeData from "../refreshDataShowtimes/RefreshDataShowtimes";

const BookingMain = () => {
  const { quantitySeats, selectedSeatIds, setShouldRefetch } =
    useSeatsContext();
  const { currentStep, setCurrentStep, userIdFromShowtimes } =
    useStepsContext();
  const { roomIdFromShowtimes, showtimeIdFromBooking } = useFilmContext();
  const { tokenUserId } = useAuthContext();
  const { resetDataShowtimes } = useShowtimeData();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Thông báo phải đặt ghế để tiếp tục
  const { openNotification, contextHolder } = CustomNotification();

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
            Authorization: `Bearer ${tokenUserId}`,
          },
        }
      );

      return data;
    },
    onSuccess: () => {
      message.success("Đã giữ ghế thành công!");
      queryClient.invalidateQueries({
        queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
      });

      setShouldRefetch(true);

      try {
        const eventData = {
          timestamp: new Date().getTime(),
          seats: selectedSeatIds,
          action: "hold",
          userId: userIdFromShowtimes,
        };

        localStorage.setItem("seat_update", JSON.stringify(eventData));

        const updateEvent = new CustomEvent("seatUpdateEvent", {
          detail: eventData,
        });

        window.dispatchEvent(updateEvent);
      } catch (e) {
        console.error("Lỗi khi lưu vào localStorage:", e);
      }
    },
    onError: (error) => {
      console.error("🚨 Lỗi khi giữ ghế:", error);
      message.error("Không thể giữ ghế. Vui lòng thử lại!");
    },
  });

  //api giải phóng ghế
  const releaseSeatsMutation = useMutation({
    mutationFn: async (seatIds: number[]) => {
      await axios.post(
        `http://localhost:8000/api/release-seats`, // API hủy ghế
        {
          seats: seatIds,
          room_id: roomIdFromShowtimes,
          showtime_id: showtimeIdFromBooking,
        },
        { headers: { Authorization: `Bearer ${tokenUserId}` } }
      );
    },
    onSuccess: () => {
      // Chỉ cập nhật lại ghế đã giải phóng, giữ nguyên ghế đang chọn
      message.success("Giải phóng ghế thành công!");
    },
  });

  // Xử lý khi ấn tiếp tục
  const nextStep = () => {
    if (currentStep === 1 && quantitySeats === 0) {
      openNotification({
        description: "Đặt ghế để tiếp tục",
      });
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
      resetDataShowtimes();
      setCurrentStep(1);
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
    <>
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
    </>
  );
>>>>>>> main
};

export default Booking;
