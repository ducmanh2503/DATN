import clsx from "clsx";
import React, { useState } from "react";
import styles from "./Wheel.module.css";

const Wheel = () => {
    let wheel = React.useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0); // Lưu góc quay hiện tại
    const [currentNumber, setCurrentNumber] = useState<number | null>(null); // Lưu số hiện tại khi quay

    // Mảng xác suất cho mỗi số (1 - 8)
    // Tổng xác suất phải là 100 (hoặc 1.0 khi tính theo phần trăm)
    const probabilities = [0.01, 0.05, 0.1, 0.168, 0.168, 0.168, 0.168, 0.168];

    const handleWheel = () => {
        // Tính góc quay ngẫu nhiên
        const randomRotation = Math.ceil(Math.random() * 1000);
        const newRotation = rotation + randomRotation; // Cộng góc quay mới vào góc quay hiện tại

        // Tính toán số sẽ xuất hiện khi quay xong
        const slices = 8; // Số phần trên bánh xe
        const anglePerSlice = 360 / slices; // Mỗi phần có góc quay là 45 độ
        const normalizedRotation = newRotation % 360; // Giới hạn góc quay trong khoảng 0 - 360 độ
        const numberIndex = Math.floor(normalizedRotation / anglePerSlice); // Xác định số dựa trên góc quay

        // Cập nhật góc quay và số tương ứng
        setRotation(newRotation);

        // Chọn số dựa trên xác suất
        const rand = Math.random(); // Lấy giá trị ngẫu nhiên từ 0 đến 1
        let cumulativeProbability = 0;

        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            if (rand < cumulativeProbability) {
                setCurrentNumber(i + 1); // Số tương ứng với phần của bánh xe (1 đến 8)
                break;
            }
        }

        if (wheel.current) {
            wheel.current.style.transition = "transform 4s ease-out"; // Thiết lập hiệu ứng quay mượt mà
            wheel.current.style.transform = `rotate(${newRotation}deg)`; // Áp dụng góc quay mới
        }
    };

    return (
        <div className={clsx(styles.wheelContainer)}>
            <button className={clsx(styles.spin)} onClick={handleWheel}>
                Quay
            </button>
            <span className={clsx(styles.arrow)}></span>

            <div className={clsx(styles.wheel)} ref={wheel}>
                <div className={clsx(styles.slice, styles.slice1)}>1</div>
                <div className={clsx(styles.slice, styles.slice2)}>2</div>
                <div className={clsx(styles.slice, styles.slice3)}>3</div>
                <div className={clsx(styles.slice, styles.slice4)}>4</div>
                <div className={clsx(styles.slice, styles.slice5)}>5</div>
                <div className={clsx(styles.slice, styles.slice6)}>6</div>
                <div className={clsx(styles.slice, styles.slice7)}>7</div>
                <div className={clsx(styles.slice, styles.slice8)}>8</div>
            </div>

            {currentNumber !== null && (
                <div className={clsx(styles.result)}>
                    Số quay được: {currentNumber}
                </div>
            )}
        </div>
    );
};

export default Wheel;
