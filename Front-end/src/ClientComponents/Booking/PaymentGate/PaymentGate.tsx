import { Radio, RadioChangeEvent } from "antd";
import clsx from "clsx";

import { useStepsContext } from "../../UseContext/StepsContext";
import UICollapse from "../Promotion/UICollapse/UICollapse";
import styles from "./PaymentGate.module.css";
import VoucherInfo from "../Promotion/Voucher/Voucher";
import { URL_IMAGE } from "../../../config/ApiConfig";

const PaymentGate = ({ className }: any) => {
    const { setPaymentType, paymentType } = useStepsContext();

    // Set cách tính tiền vào state
    const onChangePaymentOptions = (e: RadioChangeEvent) => {
        setPaymentType(e.target.value);
    };

    return (
        <div className={clsx(styles.paymentGateContainer, className)}>
            <div className={clsx(styles.promotionSection)}>
                <h1 className={clsx(styles.promotionTitle)}>Khuyến mãi</h1>
                <VoucherInfo></VoucherInfo>
                <UICollapse></UICollapse>
            </div>

            <div className={clsx(styles.paymentMethod)}>
                <h1 className={clsx(styles.methodTitle)}>
                    Hình thức thanh toán
                </h1>
                <Radio.Group
                    onChange={onChangePaymentOptions}
                    value={paymentType}
                    options={[
                        {
                            value: "VNpay",
                            label: (
                                <>
                                    <img
                                        src={`${URL_IMAGE}/storage/image/VNpay.png`}
                                        alt=""
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    />
                                    {console.log(
                                        `${URL_IMAGE}/storage/image/PayPal.jpg`
                                    )}
                                    <span>VN Pay</span>
                                </>
                            ),
                        },
                        {
                            value: "PayPal",
                            label: (
                                <>
                                    <img
                                        src={`${URL_IMAGE}/storage/image/PayPal.jpg`}
                                        alt=""
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    />
                                    {console.log(
                                        `${URL_IMAGE}/storage/image/PayPal.jpg`
                                    )}
                                    <span>PayPal</span>
                                </>
                            ),
                        },
                    ]}
                    className={clsx(styles.paymentRadioGroup)}
                />
                <h3 className={clsx(styles.moreInfo)}>
                    <span className={clsx(styles.danger)}>(*)</span> Bằng việc
                    click/chạm vào THANH TOÁN bên phải, bạn đã xác nhận hiểu rõ
                    các Quy Định Giao Dịch Trực Tuyến của Forest Cinema
                </h3>
            </div>
        </div>
    );
};

export default PaymentGate;
