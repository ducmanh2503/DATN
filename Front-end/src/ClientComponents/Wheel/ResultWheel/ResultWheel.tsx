import { Modal } from "antd";
import clsx from "clsx";
import styles from "./ResultWheel.module.css";

const ResultWheel = ({
    currentPrize,
    isModalOpen,
    setIsModalOpen,
}: {
    currentPrize: string;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}) => {
    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            title="Kết quả quay"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            <div>Bạn nhận được: {currentPrize}</div>
        </Modal>
    );
};

export default ResultWheel;
