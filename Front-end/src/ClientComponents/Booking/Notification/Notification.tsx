import { notification } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "./Notification.module.css";

// Props cho component
interface NotificationProps {
    description: string;
    pauseOnHover?: boolean; // Tùy chọn
}

const CustomNotification = () => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = ({
        description,
        pauseOnHover = true,
    }: NotificationProps) => {
        api.open({
            message: (
                <>
                    <span className={clsx(styles.notificationIcon)}>
                        <CloseCircleOutlined />
                    </span>{" "}
                    <span className={clsx(styles.notificationTitle)}>
                        Không thể tiếp tục...
                    </span>
                </>
            ),
            description,
            className: styles.customNotification, // Áp dụng CSS tùy chỉnh
            pauseOnHover,
        });
    };

    return { openNotification, contextHolder };
};

export default CustomNotification;
