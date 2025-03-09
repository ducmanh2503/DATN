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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const BookingMain = () => {
    const {
        currentStep,
        setCurrentStep,
        quantitySeats,
        selectedSeatIds,
        roomIdFromShowtimes,
        showtimeIdFromBooking,
        tokenUserId,
        setShouldRefetch,
        userIdFromShowtimes,
        setSeats,
    } = useMessageContext();
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();
    const queryClient = useQueryClient();

    // Thông báo phải đặt ghế để tiếp tục
    const openNotification = (pauseOnHover: boolean) => () => {
        api.open({
            message: (
                <>
                    <span className="notification-icon">
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
                    headers: { Authorization: `Bearer ${tokenUserId}` },
                }
            );
            return data;
        },

        onSuccess: (data) => {
            message.success("Đã giữ ghế thành công!");
            queryClient.invalidateQueries({
                queryKey: [
                    "matrixSeats",
                    roomIdFromShowtimes,
                    showtimeIdFromBooking,
                ],
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
            setSeats((prevSeats: any) => {
                const updatedSeats = { ...prevSeats };
                //
                return updatedSeats;
            });
        },
    });

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
                        <BookingSeat className="booking-left" />
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <ComboFood className="booking-left" />
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    </>
                );
            case 3:
                return (
                    <>
                        <PaymentGate className="booking-left" />
                        <BookingInfo
                            className="booking-right"
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    </>
                );
            case 4:
                return null;
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
                    { title: "Chọn Phim" },
                    { title: "Chọn ghế" },
                    { title: "Chọn đồ ăn" },
                    { title: "Chọn thanh toán" },
                    { title: "Xác nhận" },
                ]}
            />
            <div className="booking-main">{renderStepContent()}</div>
        </div>
    );
};

export default BookingMain;
