import { Button, Collapse, Input, Radio, RadioChangeEvent, Space } from "antd";
import clsx from "clsx";

import styles from "./PaymentGate.module.css";
import { useStepsContext } from "../../UseContext/StepsContext";

const PaymentGate = ({ className }: any) => {
    const { setPaymentType, paymentType, currentStep } = useStepsContext();

    const onChange = (e: RadioChangeEvent) => {
        setPaymentType(e.target.value);
    };

    return (
        <div className={clsx(styles.paymentGateContainer, className)}>
            <div className={clsx(styles.promotionSection)}>
                <h1 className={clsx(styles.promotionTitle)}>Khuyến mãi</h1>
                <div className={clsx(styles.promotionInput)}>
                    <h3 className={clsx(styles.title)}>Mã khuyến mãi</h3>
                    <Space.Compact>
                        <Input placeholder="Nhập mã khuyến mãi" />
                        <Button type="primary">Thêm</Button>
                    </Space.Compact>
                </div>
                <Collapse
                    defaultActiveKey={["1"]}
                    ghost
                    className={clsx(styles.promotionCollapse)}
                >
                    <Collapse.Panel
                        header="Áp dụng điểm thành viên"
                        key="1"
                        className={clsx(styles.promotionPanel)}
                    >
                        <div className={clsx(styles.promotionContent)}>
                            <Space.Compact>
                                <Input placeholder="Nhập điểm stars" />
                                <Button type="primary">Thêm</Button>
                            </Space.Compact>
                            <div className={clsx(styles.promotionNote)}>
                                Lưu ý:
                            </div>
                            <div className={clsx(styles.promotionInfo)}>
                                Điểm Stars có thể quy đổi thành tiền để mua vé
                                hoặc bắp/nước tại các cụm rạp Forest Cinema.
                            </div>
                            <div className={clsx(styles.promotionRate)}>
                                1 Stars = 1,000 VNĐ
                            </div>
                            <div className={clsx(styles.promotionTransaction)}>
                                Stars quy định trên 1 giao dịch: tối thiểu là 20
                                điểm và tối đa là 100 điểm.
                            </div>
                            <div className={clsx(styles.promotionAccumulation)}>
                                Stars là điểm tích lũy dựa trên giá trị giao
                                dịch bởi thành viên giao dịch tại Forest Cinema.
                                Cơ chế tích lũy stars, như sau:
                            </div>
                            <div
                                className={clsx(
                                    styles.promotionMember,
                                    styles.pro
                                )}
                            >
                                Thành viên Star: 3% trên tổng giá trị/ số tiền
                                giao dịch.
                            </div>
                            <div
                                className={clsx(
                                    styles.promotionMember,
                                    styles.pro
                                )}
                            >
                                Thành viên G-Star: 5% trên tổng giá trị/ số tiền
                                giao dịch.
                            </div>
                            <div
                                className={clsx(
                                    styles.promotionMember,
                                    styles.pro
                                )}
                            >
                                Thành viên X-Star: 10% trên tổng giá trị/ số
                                tiền giao dịch.
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </div>

            <div className={clsx(styles.paymentMethod)}>
                <h1 className={clsx(styles.methodTitle)}>
                    Hình thức thanh toán
                </h1>
                <Radio.Group
                    onChange={onChange}
                    value={paymentType}
                    options={[
                        { value: "VNpay", label: "VN Pay" },
                        { value: "MoMo", label: "Ví điện tử MoMo" },
                        { value: "ZaloPay", label: "Zalo Pay" },
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
