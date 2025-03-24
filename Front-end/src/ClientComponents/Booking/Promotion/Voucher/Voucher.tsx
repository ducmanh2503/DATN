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
  } = usePromotionContextContext();
  const { setTotalPrice, totalPrice } = useFinalPriceContext();
  const { openNotification, contextHolder } = CustomNotification();

  const [discount_code, setPromoCode] = useState<string>("");
  const [isVoucherUsed, setIsVoucherUsed] = useState<boolean>(false);

  const onChangePromotion = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const handleAddPromotion = () => {
    if (!discount_code || isVoucherUsed) {
      openNotification({ description: "Mã chỉ có thể dùng 1 lần" });
      return;
    }
    getVoucher(discount_code);
  };

  const { mutate: getVoucher } = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post(
        GET_VOUCHER(code),
        { name_code: discount_code },
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
        // Lưu discount_code vào sessionStorage sau khi xác nhận
        sessionStorage.setItem("discount_code", JSON.stringify(discount_code));
      }
    },
    onError: () => {
      openNotification({ description: "Mã không đúng hoặc không hợp lệ" });
    },
  });

  return (
    <div className={clsx(styles.promotionInput)}>
      {contextHolder}
      <h3 className={clsx(styles.title)}>Mã khuyến mãi</h3>
      <Space.Compact>
        <Input
          value={discount_code}
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
