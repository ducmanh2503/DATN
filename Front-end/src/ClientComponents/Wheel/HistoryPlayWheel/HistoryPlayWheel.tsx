import { Table } from "antd";
import clsx from "clsx";

import styles from "./historyPlayWheel.module.css";
import { useEffect } from "react";

const HistoryPlayWheel = ({ dataPlayed, setDataPlayed }: any) => {
    const columns = [
        {
            title: "ngày chơi",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Giải thưởng",
            dataIndex: "prize",
            key: "prize",
        },
    ];

    // lấy dữ liệu từ localSto
    useEffect(() => {
        const savedData = localStorage.getItem("wheel_history");
        if (savedData) {
            setDataPlayed(JSON.parse(savedData));
        }
    }, []);

    return (
        <div className={clsx(styles.main)}>
            <h1 className={clsx(styles.title)}>Lịch sử Vòng quay của bạn</h1>
            {dataPlayed.length > 0 ? (
                <Table
                    className={clsx(styles.tableHistory)}
                    columns={columns}
                    dataSource={dataPlayed}
                    pagination={{ pageSize: 5 }}
                />
            ) : (
                <table className={clsx(styles.fakeTable)}>
                    <thead>
                        <th>NGÀY CHƠI</th>
                        <th>GIẢI THƯỞNG</th>
                    </thead>
                </table>
            )}
        </div>
    );
};

export default HistoryPlayWheel;
