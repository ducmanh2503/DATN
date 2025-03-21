import { useEffect, useState } from "react";
import { Collapse, InputNumber, Button, Space } from "antd";
import clsx from "clsx";
import styles from "./UICollapse.module.css";
import { useFinalPriceContext } from "../../../UseContext/FinalPriceContext";
import { usePromotionContextContext } from "../../../UseContext/PromotionContext";
import CustomNotification from "../../Notification/Notification";

const UICollapse = () => {
    const [activeKey, setActiveKey] = useState<string>(""); // state của Collapse
    const [prevPointsNumber, setPrevPointsNumber] = useState<number>(0); // Lưu trữ điểm cũ
    const [pointsNumber, setPointsNumber] = useState<number | null>(null);
    const { openNotification, contextHolder } = CustomNotification();

    const { setTotalPrice } = useFinalPriceContext();
    const {
        setTotalPricePoint,
        userPoints,
        setQuantityPromotion,
        usedPoints,
        setUsedPoints,
        setTotalPriceVoucher,
        rankUser,
    } = usePromotionContextContext();

    // quản lý ẩn hiện tích điểm
    const onChangeActiveCollapse = (key: string | string[]) => {
        const newKey = key as string;
        setActiveKey((prev) => (prev === newKey ? "" : newKey));
    };

    // set điểm tích lũy
    const onChangePoint = (value: number | null) => {
        setPointsNumber(value);
        if (value === null || value === 0) {
            handleResetPoint();
        }
    };

    // hàm thêm points khi click
    const handleAddPoint = () => {
        if (!pointsNumber || pointsNumber < 20 || pointsNumber > 100) {
            openNotification({
                description: "Chỉ được nhập điểm tích lũy từ 20 đến 100",
            });
            return;
        }

        // Kiểm tra điểm còn lại khả dụng (userPoints - usedPoints)
        if (userPoints - usedPoints < pointsNumber) {
            openNotification({
                description: "Bạn không đủ điểm để sử dụng!",
            });
            return;
        }

        // Tính giá trị quy đổi
        const prevPointValue = prevPointsNumber * 1000; // Giá trị điểm cũ
        const newPointValue = pointsNumber * 1000; // Giá trị điểm mới

        // Cập nhật totalPrice (hoàn giá trị cũ trước khi trừ mới)
        setTotalPrice((prev: number) => prev + prevPointValue - newPointValue);

        // Cập nhật totalPricePoint và quantityPromotion
        setTotalPricePoint(newPointValue);
        setQuantityPromotion(1);

        // cập nhật điểm đã xử dụng
        setUsedPoints(pointsNumber);
        // Lưu lại điểm trước đó
        setPrevPointsNumber(pointsNumber);
    };

    // Hàm xử lý sự kiện KeyDown
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            setTotalPrice((prev: number) => prev + prevPointsNumber * 1000);

            setPointsNumber(null);
            setPrevPointsNumber(0);
            setTotalPricePoint(0);
            setUsedPoints(0);
        }

        if (e.key === "Enter") {
            handleAddPoint();
        }
    };

    // hàm xử lý khi xóa input
    const handleResetPoint = () => {
        // Hoàn lại totalPrice khi input rỗng hoặc 0
        const prevPointValue = prevPointsNumber * 1000;

        setTotalPrice((prev: number) => prev + prevPointValue);

        // Reset lại các trạng thái liên quan
        setPrevPointsNumber(0);
        setTotalPricePoint(0);
        setQuantityPromotion(0);
        setUsedPoints(0);
        sessionStorage.removeItem("usedPoints");
    };

    const items = [
        {
            key: "1",
            label: "Áp dụng điểm thành viên",
            children: (
                <div className={clsx(styles.promotionContent)}>
                    <div className={clsx(styles.yourPoint)}>
                        Điểm của bạn:{" "}
                        <span className={clsx(styles.currentpoint)}>
                            {userPoints}
                        </span>{" "}
                        - <span> Hạng: </span>
                        <span
                            className={clsx(
                                styles.rankUser,
                                rankUser === "regular" && styles.normalRank,
                                rankUser === "gold" && styles.goldRank,
                                rankUser === "diamond" && styles.diamondRank
                            )}
                        >
                            {rankUser}
                        </span>
                    </div>

                    <Space.Compact>
                        <InputNumber
                            className={clsx(styles.inputNumber)}
                            value={pointsNumber}
                            onKeyDown={handleKeyDown}
                            onChange={onChangePoint}
                            placeholder="Điểm Stars"
                        />
                        <Button type="primary" onClick={handleAddPoint}>
                            Thêm
                        </Button>
                    </Space.Compact>
                    <span className={clsx(styles.warning)}>
                        *ấn "Thêm" để đổi điểm tích lũy
                    </span>

                    <div className={clsx(styles.promotionNote)}>Lưu ý:</div>
                    <div className={clsx(styles.promotionInfo)}>
                        Điểm Stars có thể quy đổi thành tiền để mua vé hoặc
                        bắp/nước tại các cụm rạp Forest Cinema.
                    </div>

                    <div className={clsx(styles.promotionRate)}>
                        1 Stars = 1,000 VNĐ
                    </div>

                    <div className={clsx(styles.promotionTransaction)}>
                        Stars quy định trên 1 giao dịch:{" "}
                        <span className={clsx(styles.range)}>
                            tối thiểu là 20 điểm
                        </span>{" "}
                        và{" "}
                        <span className={clsx(styles.range)}>
                            tối đa là 100 điểm.
                        </span>
                    </div>

                    <div className={clsx(styles.promotionAccumulation)}>
                        Điểm Stars là điểm tích lũy dựa trên giá trị giao dịch
                        bởi thành viên giao dịch tại Forest Cinema. Cơ chế tích
                        lũy Stars, như sau:
                    </div>

                    <div className={clsx(styles.promotionMember, styles.pro)}>
                        - Thành viên{" "}
                        <span className={clsx(styles.normalRank)}>Regular</span>
                        : 3% trên tổng giá trị/ số tiền giao dịch.
                    </div>
                    <div className={clsx(styles.promotionMember, styles.pro)}>
                        - Thành viên{" "}
                        <span className={clsx(styles.goldRank)}>Gold</span>: 5%
                        trên tổng giá trị/ số tiền giao dịch.
                    </div>
                    <div className={clsx(styles.promotionMember, styles.pro)}>
                        - Thành viên{" "}
                        <span className={clsx(styles.diamondRank)}>
                            Diamond
                        </span>
                        : 10% trên tổng giá trị/ số tiền giao dịch.
                    </div>
                </div>
            ),
        },
    ];

    return (
        <>
            {contextHolder}
            <Collapse
                activeKey={activeKey}
                onChange={onChangeActiveCollapse}
                ghost
                className={clsx(styles.promotionCollapse)}
                items={items}
            />
        </>
    );
};

export default UICollapse;
