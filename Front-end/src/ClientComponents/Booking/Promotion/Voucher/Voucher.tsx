import clsx from "clsx";
import React, { useState } from "react";
import styles from "./Voucher.module.css";
import { Button, Input, Space } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GET_VOUCHER } from "../../../../config/ApiConfig";
import { useAuthContext } from "../../../UseContext/TokenContext";
import { usePromotionContext } from "../../../UseContext/PromotionContext";
import { useFinalPriceContext } from "../../../UseContext/FinalPriceContext";
import CustomNotification from "../../Notification/Notification";
import { useSeatsContext } from "../../../UseContext/SeatsContext";
import { useComboContext } from "../../../UseContext/CombosContext";

const VoucherInfo = () => {
    const { tokenUserId } = useAuthContext();
    const {
        setQuantityPromotion,
        totalPricePoint,
        setTotalPriceVoucher,
        totalPriceVoucher,
        setPromoCode, // Thêm setPromoCode từ context
    } = usePromotionContext();
    const { setTotalPrice, totalPrice } = useFinalPriceContext();
    const { openNotification, contextHolder } = CustomNotification();
    const { totalSeatPrice } = useSeatsContext();
    const { totalComboPrice } = useComboContext();

    const [promoCode, setPromoCodeLocal] = useState<string>(""); // Giữ state cục bộ để quản lý input
    const [isVoucherUsed, setIsVoucherUsed] = useState<boolean>(false);
    const [voucherPrecent, setVoucherPrecent] = useState(""); // lưu % mã giảm giá
    const [maxPrice, setMaxPrice] = useState<number>(0);

    // Cập nhật promoCode vào context và sessionStorage
    const onChangePromotion = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPromoCode = e.target.value;
        setPromoCodeLocal(newPromoCode);
        setPromoCode(newPromoCode);
        sessionStorage.setItem("promoCode", JSON.stringify(newPromoCode));

        // Nếu người dùng nhập mã mới, cho phép thử lại
        setIsVoucherUsed(false);
        setTotalPriceVoucher(0);
        setTotalPrice(totalSeatPrice + totalComboPrice - totalPricePoint);
        totalPricePoint === 0
            ? setQuantityPromotion(0)
            : setQuantityPromotion(1);
    };

    // reset Input voucher
    const resetPromotionState = (newPromoCode: string = "") => {
        setPromoCodeLocal(newPromoCode); // Giữ lại giá trị mới
        setPromoCode(newPromoCode);
        sessionStorage.setItem("promoCode", JSON.stringify(newPromoCode));
        setIsVoucherUsed(false);
        setTotalPriceVoucher(0);
        setTotalPrice(totalSeatPrice + totalComboPrice - totalPricePoint);
        totalPricePoint === 0
            ? setQuantityPromotion(0)
            : setQuantityPromotion(1);
    };

    // Hàm xử lý khi thêm mã khuyến mãi
    const handleAddPromotion = () => {
        if (isVoucherUsed) {
            openNotification({
                title: "Forest Cinema cho biết",
                description: "Mã chỉ có thể dùng 1 lần",
            });
            return;
        }
        if (!promoCode) {
            openNotification({
                title: "Forest Cinema cho biết",
                description: "Nhập mã giảm giá nếu có",
            });
            return;
        }
        getVoucher(promoCode);
    };

    // Gọi API kiểm tra mã khuyến mãi
    const { mutate: getVoucher } = useMutation({
        mutationFn: async (code: string) => {
            const response = await axios.post(
                GET_VOUCHER(code),
                { name_code: promoCode },
                { headers: { Authorization: `Bearer ${tokenUserId}` } }
            );
            console.log("check-voucher", response.data);

            return response.data;
        },
        onSuccess: (data) => {
            setMaxPrice(data.maxPrice);
            const discountPercent = parseFloat(data.discount_percent);
            setVoucherPrecent(data.discount_percent);
            if (!isNaN(discountPercent)) {
                const defaultPrice = totalPrice + totalPricePoint; // tiền trc khi trừ
                const newPrice =
                    (totalPrice + totalPricePoint) *
                    (1 - discountPercent / 100); // tiền sau trừ

                if (newPrice < maxPrice) {
                    setTotalPrice(newPrice - totalPricePoint);
                    setTotalPriceVoucher(defaultPrice - newPrice);
                } else {
                    setTotalPrice(defaultPrice - maxPrice);
                    setTotalPriceVoucher(maxPrice);
                }
                setQuantityPromotion(1);
                setIsVoucherUsed(true);
            }
        },
        onError: () => {
            openNotification({
                title: "Forest Cinema cho biết",
                description: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn",
            });
        },
    });

    return (
        <div className={clsx(styles.promotionInput)}>
            {contextHolder}
            <h3 className={clsx(styles.title)}>Mã khuyến mãi</h3>
            <Space.Compact>
                <Input
                    value={promoCode}
                    onChange={onChangePromotion}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                            resetPromotionState();
                        }
                    }}
                    onPressEnter={handleAddPromotion}
                    placeholder="Nhập mã khuyến mãi"
                />
                <Button type="primary" onClick={handleAddPromotion}>
                    Thêm
                </Button>
            </Space.Compact>
            {totalPriceVoucher !== 0 && (
                <>
                    <span className={clsx(styles.voucherInfo)}>
                        Mã được giảm{" "}
                        <span className={clsx(styles.detailVoucher)}>
                            {parseInt(voucherPrecent)}
                        </span>
                        % tối đa{" "}
                        <span className={clsx(styles.detailVoucher)}>
                            {maxPrice.toLocaleString("vi-VN")}
                        </span>{" "}
                        VNĐ
                    </span>
                    <span className={clsx(styles.warning)}>
                        *ưu đãi được tính trước khi trừ điểm tích lũy(nếu có)
                    </span>
                </>
            )}
        </div>
    );
};

export default VoucherInfo;
