import { Card, Col, Statistic } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import {
    DollarOutlined,
    FileProtectOutlined,
    ScheduleOutlined,
    UserAddOutlined,
} from "@ant-design/icons";

const CardsTitle = ({
    dailyRevenueDate,
    dailyRevenueValue,
    monthlyRevenueDate,
    monthlyRevenueValue,
    newCustomers,
    totalTicketSold,
}: any) => {
    return (
        <>
            <Col span={6}>
                <Card>
                    <Statistic
                        className={clsx(styles.statisticsInfo)}
                        title={`Danh thu trong ngày (${dailyRevenueDate})`}
                        value={dailyRevenueValue}
                        prefix={<FileProtectOutlined />}
                        suffix="VND"
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        className={clsx(styles.statisticsInfo)}
                        title="Khách hàng mới"
                        value={newCustomers}
                        prefix={<UserAddOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        className={clsx(styles.statisticsInfo)}
                        title="Tổng số vé bán ra"
                        value={totalTicketSold}
                        prefix={<ScheduleOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card>
                    <Statistic
                        className={clsx(styles.statisticsInfo)}
                        title={`Doanh thu tháng (${monthlyRevenueDate})`}
                        value={monthlyRevenueValue}
                        prefix={<DollarOutlined />}
                        suffix="VND"
                    />
                </Card>
            </Col>
        </>
    );
};

export default CardsTitle;
