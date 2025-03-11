import { Link } from "react-router-dom";
import clsx from "clsx";
import styles from "./InfomationProduct.module.css";
const InfomationProduct = ({
  className,
  image,
  category,
  date,
  title,
}: any) => {
  return (
    <Link className={clsx(styles.infomationProduct, className)} to={"....."}>
      <div className={clsx(styles.infoThumnail)}>
        <img className={clsx(styles.productImage)} src={image}></img>
      </div>
      <div className={clsx(styles.type)}>
        <h5 className={clsx(styles.category)}>{category}</h5>
        <span className={clsx(styles.date)}>{date} </span>
      </div>
      <h4 className={clsx(styles.title, styles.cliptext)}>{title}</h4>
    </Link>
  );
};

export default InfomationProduct;
