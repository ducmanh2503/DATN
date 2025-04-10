import clsx from "clsx";
import React, { useState, useRef } from "react";
import styles from "./Wheel.module.css";
import ResultWheel from "./ResultWheel/ResultWheel";
import HowGiveCount from "./HowGiveCount/HowGiveCount";
import Introduce from "./Introduce/Introduce";

const Wheel = () => {
    const wheel = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const [currentPrize, setCurrentPrize] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const prizes = [
        "Giảm 10K",
        "Giảm 20K",
        "Giảm 50K",
        "Giảm 10K",
        "Gấu bông Forest",
        "Chúc bạn may mắn lần sau",
        "Giảm 10K",
        "Chúc bạn may mắn lần sau",
    ];

    const handleWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setCurrentPrize(null);

        const extraRotation = 360 * 5;
        const randomOffset = Math.floor(Math.random() * 360);
        const newRotation = rotation + extraRotation + randomOffset;

        if (wheel.current) {
            wheel.current.style.transition = "transform 4s ease-out";
            wheel.current.style.transform = `rotate(${newRotation}deg)`;
        }

        setTimeout(() => {
            const normalizedRotation = newRotation % 360;
            const anglePerSlice = 360 / 8;

            // Đảo chiều vì CSS quay theo chiều kim đồng hồ,
            // còn mũi tên chỉ lên trên (ngược lại)
            const adjustedRotation =
                (360 - normalizedRotation + anglePerSlice / 2) % 360;
            const numberIndex = Math.floor(adjustedRotation / anglePerSlice);

            setCurrentPrize(prizes[numberIndex]);
            setRotation(newRotation);
            setIsSpinning(false);
            setIsModalOpen(true);
        }, 4000);
    };

    return (
        <div className={clsx(styles.main, "main-base")}>
            <div className={clsx(styles.wheelContainer)}>
                <button
                    className={clsx(styles.spin)}
                    onClick={handleWheel}
                    disabled={isSpinning}
                >
                    Quay
                </button>
                <span className={clsx(styles.arrow)}></span>

                <div className={clsx(styles.wheel)} ref={wheel}>
                    <div className={clsx(styles.slice, styles.slice1)}>
                        <div className={styles.sliceContent}>Giảm 10K</div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice2)}>
                        <div className={styles.sliceContent}>Giảm 20K</div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice3)}>
                        <div className={styles.sliceContent}>Giảm 50K</div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice4)}>
                        <div className={styles.sliceContent}>Giảm 10K</div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice5)}>
                        <div className={styles.sliceContent}>
                            {" "}
                            Gấu bông Forest
                        </div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice6)}>
                        <div className={styles.sliceContent}>
                            Chúc bạn may mắn lần sau
                        </div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice7)}>
                        <div className={styles.sliceContent}>Giảm 10K</div>
                    </div>
                    <div className={clsx(styles.slice, styles.slice8)}>
                        <div className={styles.sliceContent}>
                            Chúc bạn may mắn lần sau
                        </div>
                    </div>
                </div>
                {currentPrize !== null && (
                    <ResultWheel
                        currentPrize={currentPrize}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                    />
                )}
            </div>
            <div className={clsx(styles.rightMain)}>
                <Introduce></Introduce>
                <div className={clsx(styles.btnPlay)}>
                    <div className={clsx(styles.playingCount)}>
                        Bạn có 1 lượt chơi
                    </div>
                    <div className={clsx(styles.playingCount, styles.free)}>
                        CHƠI THỬ MIỄN PHÍ
                    </div>
                </div>
                <HowGiveCount></HowGiveCount>
            </div>
        </div>
    );
};

export default Wheel;
