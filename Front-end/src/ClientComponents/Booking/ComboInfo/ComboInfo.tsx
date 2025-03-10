import { Divider } from "antd";
import "../InfoMovie/InfoMovie.css";
import { useMessageContext } from "../../UseContext/ContextState";
import { useEffect } from "react";

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
            return prevTotalPrice !== updatedTotal
                ? updatedTotal
                : prevTotalPrice;
        });
    }, [nameCombo, totalSeatPrice]);
    return (
        <div>
            <div className="booking-combo">
                <Divider className="divider-custom" dashed />
                <div className="combo-list">
                    {nameCombo.map((combo: any, index: any) => (
                        <div className="combo-item" key={index}>
                            <div className="combo-info">
                                <span className="combo-name">
                                    <span className="number">
                                        {combo.quantity}
                                    </span>{" "}
                                    x {combo.title}
                                </span>
                            </div>
                            <div className="combo-price">
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
