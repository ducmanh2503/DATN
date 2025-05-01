import clsx from "clsx";
import styles from "./RoomPage.module.css";

const LayoutMatrixExample = ({ backgroundImg }: { backgroundImg: string }) => {
    return (
        <>
            <hr />
            <div className={clsx(styles.title)}>Ví dụ cho ảnh Event</div>
            <div className={clsx(styles.matrix)}>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A1
                </span>

                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A2
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A3
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A4
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A5
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A6
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A7
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A8
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A9
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A10
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A11
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A12
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A13
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A14
                </span>
                <span
                    className={clsx(styles.seat)}
                    style={{
                        backgroundImage: `url(${backgroundImg})`,
                        color: backgroundImg ? "transparent" : "black",
                        border: backgroundImg
                            ? "1px solid transparent"
                            : " 1px solid #ccc",
                    }}
                >
                    A15
                </span>
            </div>
        </>
    );
};

export default LayoutMatrixExample;
