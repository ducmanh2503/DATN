import { Button, message, notification, Space, Steps } from "antd";
import "./BookingMain.css";
import BookingSeat from "./BookingSeat/BookingSeat";
import BookingInfo from "./BookingInfo/BookingInfo";
import ComboFood from "./ComboFood/ComboFood";
import PaymentGate from "./PaymentGate/PaymentGate";
import { useMessageContext } from "../UseContext/ContextState";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const BookingMain = () => {
    const {
        currentStep,
        setCurrentStep,
        quantitySeats,
        roomIdFromShowtimes,
        showtimeIdFromBooking,
        selectedSeatIds,
    } = useMessageContext();
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

    // thông báo phải đặt ghế để tiếp tục
    const openNotification = (pauseOnHover: boolean) => () => {
        api.open({
            message: (
                <>
                    <span className="notification-icon">
                        <CloseCircleOutlined />
                    </span>{" "}
                    Không thể tiếp tục...
                </>
            ),

            description: "Phải đặt ghế nếu bạn muốn tiếp tục",
            showProgress: true,
            pauseOnHover,
        });
    };

    // API giữ ghế
    const token = localStorage.getItem("auth_token");
    const holdSeatMutation = useMutation({
        mutationFn: async (seatIds: number[]) => {
            const { data } = await axios.post(
                `http://localhost:8000/api/hold-seats`,
                {
                    seats: seatIds,
                    room_id: roomIdFromShowtimes,
                    showtime_id: showtimeIdFromBooking,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return data;
        },
        onSuccess: (data) => {
            console.log("✅ API giữ ghế thành công:", data);

            // Lưu ý: Pusher sẽ gửi sự kiện này đến tất cả người dùng
            // Chúng ta sẽ cập nhật trạng thái ghế khi nhận được sự kiện từ Pusher
            // Do đó, không cần cập nhật trạng thái ngay lập tức ở đây
        },
        onError: (error) => {
            console.error("🚨 Lỗi khi giữ ghế:", error);
        },
    });

    // ✅ Thêm `releaseSeatsMutation`
    const releaseSeatsMutation = useMutation({
        mutationFn: async (seatIds: string[]) => {
            await axios.post(
                `http://localhost:8000/api/release-seats`,
                {
                    seat: seatIds.join(","),
                    room_id: roomIdFromShowtimes,
                    showtime_id: showtimeIdFromBooking,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        },
        onSuccess: () => {
            console.log("Ghế đã được giải phóng!");
        },
    });

    // Xử lý nút Tiếp tục
    const handleContinue = () => {
        console.log("🔵 Ghế đang giữ: ", selectedSeatIds);

        if (selectedSeatIds.length === 0) {
            console.warn("⚠ Không có ghế nào được chọn!");
            return;
        }

        holdSeatMutation.mutate(selectedSeatIds);
    };

    // Xử lý khi ấn tiếp tục
    const nextStep = () => {
        if (currentStep === 1 && quantitySeats === 0) {
            openNotification(false)();
            return;
        }
        if (currentStep === 1 && quantitySeats !== 0) {
            handleContinue();
        }
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    //xử lý khi ấn quay lại
    const prevStep = () => {
        if (currentStep === 2 && selectedSeatIds.length > 0) {
            // Chỉ gọi API nếu có ghế được chọn
            releaseSeatsMutation.mutate(selectedSeatIds);
        }

        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        if (currentStep === 0) {
            navigate("/playingFilm"); // Điều hướng về trang PlayingFilm
        }
    }, [currentStep, navigate]);

    const renderStepContent = () => {
        switch (currentStep) {
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
                        <ComboFood className="booking-left" />
                        <BookingInfo
                            currentStep={currentStep}
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
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
            {contextHolder}
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
};

export default BookingMain;
