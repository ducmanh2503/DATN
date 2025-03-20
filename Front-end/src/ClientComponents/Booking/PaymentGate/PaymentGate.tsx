import { Button, Input, Radio, RadioChangeEvent, Space } from "antd";
import clsx from "clsx";

import styles from "./PaymentGate.module.css";
import { useStepsContext } from "../../UseContext/StepsContext";
import { useState } from "react";
import UICollapse from "../Promotion/UICollapse/UICollapse";

const PaymentGate = ({ className }: any) => {
  const [promoCode, setPromoCode] = useState<string>(""); // lấy dữ liệu mã khuyến mãi
  const { setPaymentType, paymentType } = useStepsContext();

  // Set cách tính tiền vào state
  const onChangePaymentOptions = (e: RadioChangeEvent) => {
    setPaymentType(e.target.value);
  };

  // set khuyến mãi
  const onChangePromotion = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const handleAddPromotion = () => {
    console.log(promoCode);
  };

  return (
    <div className={clsx(styles.paymentGateContainer, className)}>
      <div className={clsx(styles.promotionSection)}>
        <h1 className={clsx(styles.promotionTitle)}>Khuyến mãi</h1>
        <div className={clsx(styles.promotionInput)}>
          <h3 className={clsx(styles.title)}>Mã khuyến mãi</h3>
          <Space.Compact>
            <Input
              value={promoCode}
              onChange={onChangePromotion}
              placeholder="Nhập mã khuyến mãi"
            />
            <Button type="primary" onClick={handleAddPromotion}>
              Thêm
            </Button>
          </Space.Compact>
        </div>
        <UICollapse></UICollapse>
      </div>

      <div className={clsx(styles.paymentMethod)}>
        <h1 className={clsx(styles.methodTitle)}>Hình thức thanh toán</h1>
        <Radio.Group
          onChange={onChangePaymentOptions}
          value={paymentType}
          options={[
            { value: "VNpay", label: "VN Pay" },
            { value: "MoMo", label: "Ví điện tử MoMo" },
            { value: "ZaloPay", label: "Zalo Pay" },
          ]}
          className={clsx(styles.paymentRadioGroup)}
        />
        <h3 className={clsx(styles.moreInfo)}>
          <span className={clsx(styles.danger)}>(*)</span> Bằng việc click/chạm
          vào THANH TOÁN bên phải, bạn đã xác nhận hiểu rõ các Quy Định Giao
          Dịch Trực Tuyến của Forest Cinema
        </h3>
      </div>
    </div>
  );
};

export default PaymentGate;
