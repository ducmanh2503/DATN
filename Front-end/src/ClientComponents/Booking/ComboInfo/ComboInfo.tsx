import { Divider } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useEffect } from "react";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";
const ComboInfo = () => {
  const {
    nameCombo,
    setTotalComboPrice,
    setTotalPrice,
    totalSeatPrice, // Giá ghế (nếu cần tính tổng)
  } = useMessageContext();

  useEffect(() => {
    console.log(" useEffect chạy");

    const newTotalComboPrice = nameCombo.length
      ? nameCombo.reduce(
          (sum: any, combo: any) => sum + combo.quantity * combo.price,
          0
        )
      : 0;

    setTotalComboPrice(newTotalComboPrice);
    console.log("check-price-combo", newTotalComboPrice);

    setTotalPrice((prevTotalPrice: any) => {
      const updatedTotal = totalSeatPrice + newTotalComboPrice;
      console.log("Total Price cũ:", prevTotalPrice);
      console.log("Total Price mới:", updatedTotal);
      return prevTotalPrice !== updatedTotal ? updatedTotal : prevTotalPrice;
    });
  }, [nameCombo, totalSeatPrice]);
  return (
    <div>
      <div className={clsx(styles.bookingCombo)}>
        <Divider className={clsx(styles.dividerCustom)} dashed />
        <div className={clsx(styles.comboList)}>
          {nameCombo.map((combo: any, index: any) => (
            <div className={clsx(styles.comboItem)} key={index}>
              <div className={clsx(styles.comboInfo)}>
                <span className={clsx(styles.comboName)}>
                  <span className={clsx(styles.number)}>{combo.quantity}</span>{" "}
                  x {combo.title}
                </span>
              </div>
              <div className={clsx(styles.comboPrice)}>
                {combo.quantity * combo.price}đ
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComboInfo;
