import { Column, Line } from "@ant-design/plots";
import { Card, Col } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import dayjs from "dayjs";

const Charts = () => {
    const currentYear = dayjs().year();
    const dataLine = Array.from({ length: 12 }, (_, index) => ({
        month: `${currentYear}-${String(index + 1).padStart(2, "0")}`,
        value: Math.floor(Math.random() * 100), // Giá trị doanh thu ngẫu nhiên
    }));

    // const dataLine = [
    //     { month: "1991", value: 3 },
    //     { month: "1992", value: 4 },
    //     { month: "1993", value: 3.5 },
    //     { month: "1994", value: 5 },
    //     { month: "1995", value: 4.9 },
    //     { month: "1996", value: 6 },
    //     { month: "1997", value: 7 },
    //     { month: "1998", value: 9 },
    //     { month: "1999", value: 13 },
    // ];

    const configLine = {
        data: dataLine,
        xField: "month",
        yField: "value",
        height: 280,
        width: 690,
    };

    const dataColumn = [
        { type: "A", value: 80 },
        { type: "B", value: 45 },
        { type: "C", value: 50 },
        { type: "D", value: 20 },
        { type: "E", value: 20 },
    ];

    const configColumn = {
        data: dataColumn,
        xField: "type",
        yField: "value",
        height: 280,
        width: 350,
    };
    return (
        <>
            <Col span={10}>
                <Card title="Top phim có tỷ lệ đặt ghế cao nhất ">
                    <Column {...configColumn} />
                </Card>
            </Col>
            <Col span={14}>
                <Card title="Thống kê doanh theo tháng">
                    <Line className={clsx(styles.lineChart)} {...configLine} />
                </Card>
            </Col>
        </>
    );
};

export default Charts;
