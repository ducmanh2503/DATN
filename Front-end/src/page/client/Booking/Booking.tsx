import BookingMain from "../../../ClientComponents/Booking/BookingMain";
import { FloatButton } from "antd";
import Header from "../../../ClientComponents/Header/Header";

const Booking = () => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <BookingMain></BookingMain>
            <FloatButton.BackTop />
        </div>
    );
};

export default Booking;
