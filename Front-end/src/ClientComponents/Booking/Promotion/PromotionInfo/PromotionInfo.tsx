import { Divider } from "antd";
import clsx from "clsx";
import styles from "./PromotionInfo.module.css";
import { usePromotionContextContext } from "../../../UseContext/PromotionContext";

const PromotionInfo = () => {
  const { totalPricePoint, totalPriceVoucher } = usePromotionContextContext();

  return (
    <>
      <Divider />
      {totalPriceVoucher === 0 ? (
        ""
      ) : (
        <div className={clsx(styles.promotionBox, styles.flexBox)}>
          <h3 className={clsx(styles.promotionTitle)}>Ưu đãi:</h3>
          <div className={clsx(styles.promotionPrice)}>
            {" "}
            - {totalPriceVoucher}đ
          </div>
        </div>
      )}
      {totalPricePoint === 0 ? (
        ""
      ) : (
        <div className={clsx(styles.pointBox, styles.flexBox)}>
          <h3 className={clsx(styles.pointTitle)}>Ưu đãi điểm Stars:</h3>
          <div className={clsx(styles.pointPrice)}> - {totalPricePoint}đ</div>
        </div>
      )}
    </>
  );
};

export default PromotionInfo;
