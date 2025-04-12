import clsx from "clsx";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { useGetTotalUsedMoneyUser } from "../../../services/Wheel.service";
import styles from "../Wheel.module.css";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const GetTotalusedMoney = () => {
    const { data, isLoading, isError } = useGetTotalUsedMoneyUser();

    const today = dayjs();
    const startOfWeek = today.startOf("isoWeek");
    const endOfWeek = today.endOf("isoWeek");

    const filteredItems = data?.filter((item: any) => {
        const createdDate = dayjs(item.created_at, "DD-MM-YYYY HH:mm:ss");
        return (
            createdDate.isSameOrAfter(startOfWeek) &&
            createdDate.isSameOrBefore(endOfWeek)
        );
    });

    const totalUsedMoney =
        filteredItems?.reduce(
            (sum: number, item: any) => sum + item.total_price,
            0
        ) || 0;

    return (
        <div className={clsx(styles.btnPlay)}>
            Tích lũy của tuần này{" "}
            <span>{totalUsedMoney.toLocaleString()} đ</span>
        </div>
    );
};

export default GetTotalusedMoney;
