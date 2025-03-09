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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const BookingMain = () => {
    const { currentStep, setCurrentStep, quantitySeats, selectedSeatIds } =
        useMessageContext();
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();
    const [seatContinueHandler, setSeatContinueHandler] = useState<
        (() => void) | null
    >(null);

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

    // Callback để xử lý sau khi giữ ghế thành công
    const handleSeatHoldSuccess = () => {
        if (currentStep === 1) {
            setCurrentStep(2); // Chuyển sang bước "Chọn đồ ăn"
        }
    };

    // Xử lý khi ấn tiếp tục
    const nextStep = () => {
        if (currentStep === 1) {
            if (quantitySeats === 0) {
                openNotification(false)();
                return;
            }
            if (seatContinueHandler) {
                seatContinueHandler(); // Gọi hàm handleContinue từ BookingSeat để giữ ghế
                // Chuyển bước sẽ được xử lý trong handleSeatHoldSuccess sau khi giữ ghế thành công
                return;
            }
        }

        if (currentStep < 4) {
            setCurrentStep(currentStep + 1); // Chuyển bước cho các bước khác
        }
    };

    // Xử lý khi ấn quay lại
    const prevStep = () => {
        if (currentStep === 2 && selectedSeatIds.length > 0) {
            // Chỉ gọi API nếu có ghế được chọn (giữ nguyên logic)
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
                        <BookingSeat
                            className="booking-left"
                            onContinue={(handler) =>
                                setSeatContinueHandler(() => handler)
                            }
                            onSeatHoldSuccess={handleSeatHoldSuccess} // Truyền callback để xử lý sau khi giữ ghế
                        />
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
            {/* <Space className="navigation-buttons">
        {currentStep > 1 && <Button onClick={prevStep}>Quay lại</Button>}
        {currentStep < 4 && (
          <Button type="primary" onClick={nextStep}>
            Tiếp tục
          </Button>
        )}
      </Space> */}
        </div>
    );
};

export default BookingMain;
