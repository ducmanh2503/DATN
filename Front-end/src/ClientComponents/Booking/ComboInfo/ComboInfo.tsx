import { Divider } from "antd";
import { useEffect } from "react";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";
import { useComboContext } from "../../UseContext/CombosContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";
import { useSeatsContext } from "../../UseContext/SeatsContext";
const ComboInfo = () => {
    const { nameCombo, setTotalComboPrice, totalComboPrice } =
        useComboContext();
    const { setTotalPrice } = useFinalPriceContext();
    const { totalSeatPrice } = useSeatsContext(); // Giá ghế (nếu cần tính tổng)

    useEffect(() => {
        console.log(" useEffect chạy");
        console.log("tên combo", nameCombo);

        const newTotalComboPrice = nameCombo.length
            ? nameCombo.reduce(
                  (sum: any, combo: any) =>
                      sum + combo.defaultQuantityCombo * combo.price,
                  0
              )
            : 0;

        setTotalComboPrice(newTotalComboPrice);
        // console.log("check-price-combo", newTotalComboPrice);
        console.log(totalComboPrice);

        setTotalPrice((prevTotalPrice: any) => {
            const updatedTotal = totalSeatPrice + newTotalComboPrice;
            // console.log("Total Price cũ:", prevTotalPrice);
            // console.log("Total Price mới:", updatedTotal);
            return prevTotalPrice !== updatedTotal
                ? updatedTotal
                : prevTotalPrice;
        });
    }, [nameCombo, totalSeatPrice]);

    // console.log("kiểm tra name combo", nameCombo);

    return (
        <div>
            <div className={clsx(styles.bookingCombo)}>
                <Divider className={clsx(styles.dividerCustom)} dashed />
                <div className={clsx(styles.comboList)}>
                    {nameCombo.map((combo: any, index: any) => (
                        <div className={clsx(styles.comboItem)} key={index}>
                            <div className={clsx(styles.comboInfo)}>
                                <span className={clsx(styles.comboName)}>
                                    <span className={clsx(styles.number)}>
                                        {combo.defaultQuantityCombo}
                                    </span>{" "}
                                    x {combo.name}
                                </span>
                            </div>
                            <div className={clsx(styles.comboPrice)}>
                                {combo.defaultQuantityCombo * combo.price}đ
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComboInfo;
