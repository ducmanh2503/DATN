import clsx from "clsx";
import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import styles from "./RankingProduct.module.css";

interface RankingProductProps {
  className?: string;
  number: number;
  name: string;
  image: string;
  tickets?: number;
  movieId?: number; 
}

const RankingProduct = ({ className, number, name, image, tickets, movieId }: RankingProductProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (movieId) {
      navigate(`/filmDetail/${movieId}`);
    } else {
      // Nếu không có movieId, hiển thị thông báo hoặc không làm gì cả
      console.warn("Không có ID phim để chuyển hướng");
    }
  };

  return (
    <div className={clsx(styles.rProduct, className)}>
      <div className={clsx(styles.imgBox)}>
        <img className={clsx(styles.image)} src={image} alt={name} />
        <div className={clsx(styles.overlay)}>
          {movieId ? (
            <div 
              className={clsx(styles.viewDetails)}
              onClick={handleViewDetails}
            >
              Xem chi tiết
            </div>
          ) : (
            <div className={clsx(styles.viewDetails, styles.disabled)}>
              Chưa có thông tin
            </div>
          )}
        </div>
      </div>
      <div className={clsx(styles.title)}>
        <span
          className={clsx(
            styles.number,
            number === 1 && styles.firstRank,
            number === 2 && styles.secondRank,
            number === 3 && styles.thirdRank
          )}
        >
          {number}
        </span>
        <h2 
          className={clsx(styles.productName, "cliptextTitle")}
          onClick={movieId ? handleViewDetails : undefined}
          style={movieId ? {} : { cursor: 'default' }}
        >
          {name}
        </h2>
      </div>
      {tickets && (
        <div className={clsx(styles.ticketsInfo)}>
          <FontAwesomeIcon icon={faTicket} className={styles.ticketIcon} />
          <span className={styles.ticketsCount}>{tickets.toLocaleString()} vé</span>
        </div>
      )}
    </div>
  );
};

export default RankingProduct;
