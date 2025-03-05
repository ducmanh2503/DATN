import { Steps } from "antd";
import "./BookingMain.css";
import BookingSeat from "./BookingSeat/BookingSeat";
import BookingInfo from "./BookingInfo/BookingInfo";
import { useState } from "react";
import ComboFood from "./ComboFood/ComboFood";
import PaymentGate from "./PaymentGate/PaymentGate";

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
};

export default Booking;
