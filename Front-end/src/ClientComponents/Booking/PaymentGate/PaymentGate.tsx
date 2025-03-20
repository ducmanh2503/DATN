import { Button, Collapse, Input, Radio, RadioChangeEvent, Space } from "antd";
import "./PaymentGate.css";
import { useState } from "react";

const PaymentGate = ({ className }: any) => {
<<<<<<< HEAD
    const [value, setValue] = useState(1);

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
    };

    return (
        <div className={`payment-gate-container ${className}`}>
            <div className="promotion-section">
                <h1 className="promotion-title">Khuyến mãi</h1>
                <div className="promotion-input">
                    <h3>Mã khuyến mãi</h3>
                    <Space.Compact>
                        <Input placeholder="Nhập mã khuyến mãi" />
                        <Button type="primary">Thêm</Button>
                    </Space.Compact>
                </div>
                <Collapse
                    defaultActiveKey={["1"]}
                    ghost
                    className="promotion-collapse"
                >
                    <Collapse.Panel
                        header="Áp dụng điểm thành viên"
                        key="1"
                        className="promotion-panel"
                    >
                        <div className="promotion-content">
                            <Space.Compact>
                                <Input placeholder="Nhập điểm stars" />
                                <Button type="primary">Thêm</Button>
                            </Space.Compact>
                            <div className="promotion-note">Lưu ý:</div>
                            <div className="promotion-info">
                                Điểm Stars có thể quy đổi thành tiền để mua vé
                                hoặc bắp/nước tại các cụm rạp Forest Cinema.
                            </div>
                            <div className="promotion-rate">
                                1 Stars = 1,000 VNĐ
                            </div>
                            <div className="promotion-transaction">
                                Stars quy định trên 1 giao dịch: tối thiểu là 20
                                điểm và tối đa là 100 điểm.
                            </div>
                            <div className="promotion-accumulation">
                                Stars là điểm tích lũy dựa trên giá trị giao
                                dịch bởi thành viên giao dịch tại Forest Cinema.
                                Cơ chế tích lũy stars, như sau:
                            </div>
                            <div className="promotion-member promotion-star">
                                Thành viên Star: 3% trên tổng giá trị/ số tiền
                                giao dịch.
                            </div>
                            <div className="promotion-member promotion-gstar">
                                Thành viên G-Star: 5% trên tổng giá trị/ số tiền
                                giao dịch.
                            </div>
                            <div className="promotion-member promotion-xstar">
                                Thành viên X-Star: 10% trên tổng giá trị/ số
                                tiền giao dịch.
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </div>

            <div className="payment-method">
                <h1 className="method-title">Hình thức thanh toán</h1>
                <Radio.Group
                    onChange={onChange}
                    value={value}
                    options={[
                        { value: 1, label: "VN Pay" },
                        { value: 2, label: "Ví điện tử MoMo" },
                        { value: 3, label: "Zalo Pay" },
                    ]}
                    className="payment-radio-group"
                />
                <h3 className="more-info">
                    <span className="danger">(*)</span> Bằng việc click/chạm vào
                    THANH TOÁN bên phải, bạn đã xác nhận hiểu rõ các Quy Định
                    Giao Dịch Trực Tuyến của Forest Cinema
                </h3>
            </div>
=======
  const { setPaymentType, paymentType, currentStep } = useStepsContext();

  const onChange = (e: RadioChangeEvent) => {
    setPaymentType(e.target.value);
  };

  const items = [
    {
      key: "1",
      label: "Áp dụng điểm thành viên",
      children: (
        <div className={clsx(styles.promotionContent)}>
          <Space.Compact>
            <Input placeholder="Nhập điểm stars" />
            <Button type="primary">Thêm</Button>
          </Space.Compact>

          <div className={clsx(styles.promotionNote)}>Lưu ý:</div>
          <div className={clsx(styles.promotionInfo)}>
            Điểm Stars có thể quy đổi thành tiền để mua vé hoặc bắp/nước tại các
            cụm rạp Forest Cinema.
          </div>

          <div className={clsx(styles.promotionRate)}>1 Stars = 1,000 VNĐ</div>

          <div className={clsx(styles.promotionTransaction)}>
            Stars quy định trên 1 giao dịch: tối thiểu là 20 điểm và tối đa là
            100 điểm.
          </div>

          <div className={clsx(styles.promotionAccumulation)}>
            Stars là điểm tích lũy dựa trên giá trị giao dịch bởi thành viên
            giao dịch tại Forest Cinema. Cơ chế tích lũy stars, như sau:
          </div>

          <div className={clsx(styles.promotionMember, styles.pro)}>
            Thành viên Star: 3% trên tổng giá trị/ số tiền giao dịch.
          </div>
          <div className={clsx(styles.promotionMember, styles.pro)}>
            Thành viên G-Star: 5% trên tổng giá trị/ số tiền giao dịch.
          </div>
          <div className={clsx(styles.promotionMember, styles.pro)}>
            Thành viên X-Star: 10% trên tổng giá trị/ số tiền giao dịch.
          </div>
>>>>>>> main
        </div>
      ),
    },
  ];

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
          items={items}
        />
      </div>

      <div className={clsx(styles.paymentMethod)}>
        <h1 className={clsx(styles.methodTitle)}>Hình thức thanh toán</h1>
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
          <span className={clsx(styles.danger)}>(*)</span> Bằng việc click/chạm
          vào THANH TOÁN bên phải, bạn đã xác nhận hiểu rõ các Quy Định Giao
          Dịch Trực Tuyến của Forest Cinema
        </h3>
      </div>
    </div>
  );
};

export default PaymentGate;
