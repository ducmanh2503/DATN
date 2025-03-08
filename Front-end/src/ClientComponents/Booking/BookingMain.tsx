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

const BookingMain = () => {
    const { currentStep, setCurrentStep, quantitySeats } = useMessageContext();
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

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

    const nextStep = () => {
        if (currentStep === 1 && quantitySeats === 0) {
            openNotification(false)();
            return;
        }

        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
        //ccccccccccccccccccccc
        //ccccccccccccccccccccc
        //ccccccccccccccccccccc
        //ccccccccccccccccccccc
        //ccccccccccccccccccccc
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
