import { Button, DatePicker, Space } from "antd";

const { RangePicker } = DatePicker;
const DashBoardFilm = () => {
    return (
        <>
            <div>
                <RangePicker />
                <Button type="primary">Tìm dữ liệu</Button>
            </div>
        </>
    );
};

export default DashBoardFilm;
