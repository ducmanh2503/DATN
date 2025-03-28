import clsx from "clsx";
import React, { useState } from "react";
import styles from "./Voucher.module.css";
import { Button, Input, Space } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GET_VOUCHER } from "../../../../config/ApiConfig";
import { useAuthContext } from "../../../UseContext/TokenContext";
import { usePromotionContextContext } from "../../../UseContext/PromotionContext";
import { useFinalPriceContext } from "../../../UseContext/FinalPriceContext";
import CustomNotification from "../../Notification/Notification";

const VoucherInfo = () => {
  const { tokenUserId } = useAuthContext();
  const {
    setQuantityPromotion,
    totalPricePoint,
    setTotalPriceVoucher,
    totalPriceVoucher,
    setPromoCode, // Thêm setPromoCode từ context
  } = usePromotionContextContext();
  const { setTotalPrice, totalPrice } = useFinalPriceContext();
  const { openNotification, contextHolder } = CustomNotification();

  const [promoCode, setPromoCodeLocal] = useState<string>(""); // Giữ state cục bộ để quản lý input
  const [isVoucherUsed, setIsVoucherUsed] = useState<boolean>(false);

  // Cập nhật promoCode vào context và sessionStorage
  const onChangePromotion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPromoCode = e.target.value;
    setPromoCodeLocal(newPromoCode);
    setPromoCode(newPromoCode); // Cập nhật vào context
    sessionStorage.setItem("promoCode", JSON.stringify(newPromoCode)); // Giữ logic cũ
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
      return response.data;
    },
    onSuccess: (data) => {
      const discountPercent = parseFloat(data.discount_percent);

      if (!isNaN(discountPercent)) {
        const newPrice =
          (totalPrice + totalPricePoint) * (1 - discountPercent / 100);
        setTotalPrice(newPrice - totalPricePoint);
        setTotalPriceVoucher(newPrice);
        setQuantityPromotion(1);
        setIsVoucherUsed(true);
      }
    },
    onError: () => {
      openNotification({
        title: "Forest Cinema cho biết",
        description: "Mã không đúng hoặc không hợp lệ",
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
          onPressEnter={handleAddPromotion}
          placeholder="Nhập mã khuyến mãi"
        />
        <Button type="primary" onClick={handleAddPromotion}>
          Thêm
        </Button>
      </Space.Compact>
      {totalPriceVoucher !== 0 && (
        <span className={clsx(styles.warning)}>
          *ưu đãi được tính trước khi trừ điểm tích lũy(nếu có)
        </span>
      )}
    </div>
  );
};

export default VoucherInfo;
