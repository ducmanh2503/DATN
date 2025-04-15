import clsx from "clsx";
import React, { useState, useRef, useEffect } from "react";
import styles from "./Wheel.module.css";
import ResultWheel from "./ResultWheel/ResultWheel";
import HowGiveCount from "./HowGiveCount/HowGiveCount";
import Introduce from "./Introduce/Introduce";
import GetTotalusedMoney from "./GetTotalusedMoney/GetTotalusedMoney";
import HistoryPlayWheel from "./historyPlayWheel/historyPlayWheel";
import dayjs from "dayjs";

const Wheel = () => {
    const wheel = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const [currentPrize, setCurrentPrize] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false); // trạng thái quay của vòng quay

    const [isModalOpen, setIsModalOpen] = useState(false); //mở modal
    const [isFree, setIsFree] = useState(false); // dạng free cho chơi thử

    const today = dayjs().format("DD/MM/YYYY");
    const [dataPlayed, setDataPlayed] = useState<
        { date: string; prize: string }[]
    >([]);
    // data lưu trữ lịch sử quay
    const [totalUsedMoneyOfUser, setTotalUsedMoneyOfUser] = useState<number>(0);
    const [countPlayGame, setCountPlayGame] = useState<number>(0); // số lượng chơi của User

    useEffect(() => {
        const numberOfPlays = Math.floor(totalUsedMoneyOfUser / 550000); // tính số lượt chơi
        setCountPlayGame(numberOfPlays);
    }, [totalUsedMoneyOfUser]);

    const prizes = [
        "Giảm 10K",
        "Chúc bạn may mắn lần sau",
        "Giảm 50K",
        "Giảm 10K",
        "Gấu bông Forest",
        "Giảm 20K",
        "Giảm 10K",
        "Chúc bạn may mắn lần sau",
    ];

    // index tương ứng với prizes: [0,1,2,3,4,5,6,7]
    const prizeWeightMap: { [index: number]: number } = {
        0: 35, // Giảm 10K (chia 50% cho 3 vị trí: 17% mỗi cái)
        1: 16, // Chúc bạn may mắn lần sau (chia 35% cho 2 vị trí: 18% và 17%)
        2: 1, // Giảm 50K
        3: 28, // Giảm 10K
        4: 1, // Gấu bông
        5: 15, // Giảm 20K
        6: 25, // Giảm 10K
        7: 14, // Chúc bạn may mắn lần sau
    };

    const weightedIndexes: number[] = [];

    Object.entries(prizeWeightMap).forEach(([indexStr, weight]) => {
        const index = parseInt(indexStr);
        for (let i = 0; i < weight; i++) {
            weightedIndexes.push(index);
        }
    });

    const handleWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setCurrentPrize(null);

        const extraRotation = 360 * 5;
        const anglePerSlice = 360 / prizes.length;
        const randomIndex =
            weightedIndexes[Math.floor(Math.random() * weightedIndexes.length)];
        const newRotation =
            rotation + extraRotation + randomIndex * anglePerSlice;

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

            !isFree &&
                setDataPlayed((prev) => [
                    ...prev,
                    {
                        date: today,
                        prize: prizes[numberIndex],
                    },
                ]);
        }, 4500);
    };

    //  lưu lên localSto để ko mất data khi f5
    useEffect(() => {
        if (dataPlayed) {
            localStorage.setItem("wheel_history", JSON.stringify(dataPlayed));
        }
    }, [dataPlayed]);

    return (
        <div className={clsx(styles.main, "main-base")}>
            <div>
                <div className={clsx(styles.wheelContainer)}>
                    <button
                        className={clsx(styles.spin)}
                        onClick={() => {
                            if (countPlayGame <= 0 || isSpinning) return;
                            setIsFree(false);
                            handleWheel();
                            setCountPlayGame((prev) => prev - 1);
                        }}
                        disabled={isSpinning || countPlayGame === 0}
                    >
                        Quay
                    </button>

                    <span className={clsx(styles.arrow)}></span>

                    <div className={clsx(styles.wheel)} ref={wheel}>
                        <div className={clsx(styles.slice, styles.slice1)}>
                            <div className={styles.sliceContent}>Giảm 10K</div>
                        </div>
                        <div className={clsx(styles.slice, styles.slice2)}>
                            <div className={styles.sliceContent}>
                                Chúc bạn may mắn lần sau
                            </div>
                        </div>
                        <div className={clsx(styles.slice, styles.slice3)}>
                            <div className={styles.sliceContent}>Giảm 50K</div>
                        </div>
                        <div className={clsx(styles.slice, styles.slice4)}>
                            <div className={styles.sliceContent}>Giảm 10K</div>
                        </div>
                        <div className={clsx(styles.slice, styles.slice5)}>
                            <div className={styles.sliceContent}>
                                Gấu bông Forest
                            </div>
                        </div>
                        <div className={clsx(styles.slice, styles.slice6)}>
                            <div className={styles.sliceContent}>Giảm 20K</div>
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
                            isFree={isFree}
                        />
                    )}
                </div>
                <HistoryPlayWheel
                    dataPlayed={dataPlayed}
                    setDataPlayed={setDataPlayed}
                ></HistoryPlayWheel>
            </div>
            <div className={clsx(styles.rightMain)}>
                <Introduce></Introduce>
                <div className={clsx(styles.boxFlex)}>
                    <div className={clsx(styles.btnPlay)}>
                        <div className={clsx(styles.playingCount)}>
                            Bạn có {countPlayGame} lượt chơi
                        </div>
                        <div
                            className={clsx(styles.playingCount, styles.free)}
                            onClick={() => {
                                handleWheel();
                                setIsFree(true);
                            }}
                        >
                            CHƠI THỬ MIỄN PHÍ
                        </div>
                    </div>
                    <GetTotalusedMoney
                        setTotalUsedMoneyOfUser={setTotalUsedMoneyOfUser}
                    ></GetTotalusedMoney>
                </div>
                <HowGiveCount></HowGiveCount>
            </div>
        </div>
    );
};

export default Wheel;
