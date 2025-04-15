import { Modal } from "antd";
import clsx from "clsx";
import styles from "./ResultWheel.module.css";

const ResultWheel = ({
    currentPrize,
    isModalOpen,
    setIsModalOpen,
    isFree,
}: {
    currentPrize: string;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    isFree: boolean;
}) => {
    const isDiscountPrize = ["Giảm 10K", "Giảm 20K", "Giảm 50K"].includes(
        currentPrize
    ); // ss kết quả để css

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            title=""
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            {isFree && (
                <span className={clsx(styles.freePlay)}>
                    Phần thưởng không được thêm vào vì đang CHƠI MIỄN PHÍ
                </span>
            )}
            <div className={clsx(styles.main)}>
                <h3 className={clsx(styles.title)}>Xin chúc mừng</h3>
                {isDiscountPrize && (
                    <span className={clsx(styles.subTitle)}>
                        Bạn nhận được:
                    </span>
                )}
                <div
                    className={clsx(
                        isDiscountPrize
                            ? styles.prizeWrapper
                            : styles.defaultPrize
                    )}
                >
                    <span
                        className={clsx(
                            isDiscountPrize
                                ? styles.prizeValue
                                : styles.defaultPrize
                        )}
                    >
                        {currentPrize}
                    </span>
                    <span
                        className={clsx(isDiscountPrize ? styles.line : "")}
                    ></span>
                </div>
                <img
                    className={clsx(styles.layoutResultGame)}
                    src="../../../public/imageFE/layoutResultGame.png"
                    alt="layoutResultGame"
                />
            </div>
        </Modal>
    );
};

export default ResultWheel;
