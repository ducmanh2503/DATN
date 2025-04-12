
import { Card, Button, message } from "antd";
import styles from "./Promotions.module.css";

const mockPromotions = [
  {
    id: 1,
    code: "KM2025APR",
    description: "Giảm 5% đơn hàng từ 500K",
    discountValue: "5%",
    condition: "Đơn hàng từ 500K",
    expiryDate: "30/04/2025",
    status: "Chưa sử dụng",
  },
  {
    id: 2,
    code: "FREEPOP25",
    description: "Tặng bỏng ngô miễn phí khi mua vé",
    discountValue: "Miễn phí bỏng ngô",
    condition: "Mua vé xem phim",
    expiryDate: "15/05/2025",
    status: "Chưa sử dụng",
  },
  {
    id: 3,
    code: "DISCOUNT50K",
    description: "Giảm 50K đơn hàng từ 200K",
    discountValue: "50K",
    condition: "Đơn hàng từ 200K",
    expiryDate: "31/05/2025",
    status: "Chưa sử dụng",
  },
];

const Promotions: React.FC = () => {
  return (
    <div className={styles.promotionSection}>
      <h3 className={styles.promotionTitle}>Ưu đãi bạn đang có</h3>
      {mockPromotions.length > 0 ? (
        <div className={styles.promotionList}>
          {mockPromotions.map((promo) => (
            <Card key={promo.id} className={styles.promotionCard}>
              <div className={styles.promotionContent}>
                <div className={styles.promotionLeft}>
                  <div className={styles.discountValue}>
                    {promo.discountValue}
                  </div>
                  <div className={styles.condition}>{promo.condition}</div>
                </div>
                <div className={styles.promotionRight}>
                  <div className={styles.promotionHeader}>
                    <span className={styles.promotionCode}>{promo.code}</span>
                    <span className={styles.promotionStatus}>
                      {promo.status}
                    </span>
                  </div>
                  <div className={styles.promotionDescription}>
                    {promo.description}
                  </div>
                  <div className={styles.promotionExpiry}>
                    HSD: {promo.expiryDate}
                  </div>
                  <Button
                    type="primary"
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      message.success(`Đã sao chép mã: ${promo.code}`);
                    }}
                  >
                    Sao chép mã
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyContent}>
          <p>Chưa có ưu đãi nào chưa sử dụng.</p>
        </div>
      )}
    </div>
  );
};

export default Promotions;
