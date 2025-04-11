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
    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            title="Chúc mừng bạn"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            {isFree && (
                <span>
                    Phần thưởng không được thêm vào vì đang CHƠI MIỄN PHÍ
                </span>
            )}
            <div>Bạn nhận được: {currentPrize}</div>
        </Modal>
    );
};

export default ResultWheel;
