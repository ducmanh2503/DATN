import clsx from "clsx";
import styles from "./RankingBox.module.css";

const RankingBox = ({ children }: any) => {
    return <div className={clsx(styles.RankingBox)}>{children}</div>;
};

export default RankingBox;
