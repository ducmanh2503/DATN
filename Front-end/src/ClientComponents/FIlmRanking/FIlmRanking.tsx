import clsx from "clsx";
import styles from "../TitleMenu/TitleMenu.module.css";
const FIlmRanking = () => {
    return (
        <div className={clsx("main-base")}>
            <div className={clsx(styles.ranking)}>
                <div className={clsx(styles.title)}>
                    <h1 className={clsx(styles.subVn)}>Thông tin</h1>
                    <h1 className={clsx(styles.subEn)}>Information</h1>
                </div>
            </div>
        </div>
    );
};

export default FIlmRanking;
