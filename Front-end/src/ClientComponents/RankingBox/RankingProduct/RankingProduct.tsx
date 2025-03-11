import clsx from "clsx";
import styles from "./RankingProduct.module.css";

const RankingProduct = ({ className, number, name, image }: any) => {
  return (
    <div className={clsx(styles.rProduct, className)}>
      <div className={clsx(styles.imgBox)}>
        <img className={clsx(styles.image)} src={image}></img>
      </div>
      <div className={clsx(styles.title)}>
        <span
          className={clsx(
            styles.number,
            number === 1 && styles.firstRank,
            number === 2 && styles.secondRank
          )}
        >
          {number}
        </span>
        <h2 className={clsx(styles.productName, "cliptextTitle")}>{name}</h2>
      </div>
    </div>
  );
};

export default RankingProduct;
