import clsx from "clsx";
import styles from "./Order.module.css";
import { Skeleton, Table, Tag } from "antd";
import { useDetailOrder } from "../../../services/adminServices/orderManage.service";

const OrderDetailUI = ({ id }: { id: number }) => {
    const columnsSeats = [
        {
            title: "Thông tin ghế",
            dataIndex: "seat_name",
            key: "seat_name",
        },
        {
            title: "Loại ghế",
            dataIndex: "seat_type",
            key: "seat_type",
            render: (value: any, record: any) => (
                <span>Ghế {record.seat_type}</span>
            ),
        },
        {
            title: "Giá ghế",
            dataIndex: "price",
            key: "price",
            render: (value: any, record: any) => (
                <span>
                    {parseInt(record.price).toLocaleString("vi-VN")} VNĐ
                </span>
            ),
        },
    ];

    const columnsCombos = [
        {
            title: "Tên dịch vụ",
            dataIndex: "combo_name",
            key: "combo_name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Thành tiền",
            dataIndex: "price",
            key: "price",
            render: (value: any, record: any) => (
                <span>
                    {(parseInt(record.price) * record.quantity).toLocaleString(
                        "vi-VN"
                    )}{" "}
                    VNĐ
                </span>
            ),
        },
    ];

    const { data: detailOrder, isLoading } = useDetailOrder(id);
    return (
        <div className={clsx(styles.container)}>
            <div className={clsx(styles.orderInfo)}>
                <div className={clsx(styles.section)}>
                    <h3 className={clsx(styles.title)}>Thông tin khách hàng</h3>
                    <div className={clsx(styles.infoGroup)}>
                        <div className={clsx(styles.infoItem)}>
                            <h4 className={clsx(styles.label)}>Khách hàng:</h4>
                            <span
                                className={clsx(
                                    styles.value,
                                    styles.customerInfo
                                )}
                            >
                                {detailOrder?.customer_name}
                            </span>
                        </div>
                        <div className={clsx(styles.infoItem)}>
                            <h4 className={clsx(styles.label)}>Điện thoại:</h4>
                            <span className={clsx(styles.value)}>
                                {detailOrder?.phone === "N/A"
                                    ? "chưa cập nhật"
                                    : detailOrder?.phone}
                            </span>
                        </div>
                        <div className={clsx(styles.infoItem)}>
                            <h4 className={clsx(styles.label)}>Email:</h4>
                            <span className={clsx(styles.value)}>
                                {detailOrder?.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.section)}>
                    <h3 className={clsx(styles.title)}>Thông tin đơn hàng</h3>

                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Mã đơn hàng:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.id}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Phim:</h4>
                        <span className={clsx(styles.value, styles.titleFilm)}>
                            {detailOrder?.movie_title}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Giờ chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="volcano"
                            >
                                {detailOrder?.showtime}
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Ngày chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.show_date}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Phòng chiếu:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.room_name}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Ngày đặt:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.created_at}
                        </span>
                    </div>
                    <hr />
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Trạng thái:</h4>
                        <span className={clsx(styles.value)}>
                            {detailOrder?.status === "confirmed" ? (
                                <Tag color="green">Đã thanh toán</Tag>
                            ) : (
                                <Tag color="red">Đang đợi xử lý</Tag>
                            )}
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Thành tiền:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="blue"
                            >
                                {(
                                    detailOrder?.total_combo_price +
                                    detailOrder?.total_ticket_price
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Giảm giá:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="blue"
                            >
                                {detailOrder?.discount.toLocaleString("vi-VN")}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                    <div className={clsx(styles.infoItem)}>
                        <h4 className={clsx(styles.label)}>Tổng tiền:</h4>
                        <span className={clsx(styles.value)}>
                            {" "}
                            <Tag
                                className={clsx(styles.tagElement)}
                                color="blue"
                            >
                                {detailOrder?.total_price.toLocaleString(
                                    "vi-VN"
                                )}{" "}
                                VNĐ
                            </Tag>
                        </span>
                    </div>
                </div>
            </div>
            <div className={clsx(styles.serviceSection)}>
                <h3 className={clsx(styles.title)}>Ghế & Combo</h3>
                <Skeleton
                    className={clsx(styles.skeletonSeats)}
                    loading={isLoading}
                    active
                >
                    {" "}
                    <Table
                        className={clsx(styles.tableSeats)}
                        columns={columnsSeats}
                        dataSource={detailOrder?.seats?.map(
                            (item: any, index: number) => ({
                                ...item,
                                key: item.id || index, // Sử dụng id hoặc index làm key
                            })
                        )}
                        pagination={false}
                    />
                    <hr />
                    <div className={clsx(styles.totalSub)}>
                        Tổng cộng:{" "}
                        <Tag color="blue">
                            {" "}
                            {detailOrder.total_ticket_price.toLocaleString(
                                "vi-VN"
                            )}{" "}
                            VNĐ
                        </Tag>
                    </div>
                </Skeleton>
                <Skeleton loading={isLoading} active>
                    {" "}
                    <Table
                        columns={columnsCombos}
                        dataSource={detailOrder?.combos?.map(
                            (item: any, index: number) => ({
                                ...item,
                                key: item.id || index, // Sử dụng id hoặc index làm key
                            })
                        )}
                        pagination={false}
                    />
                    <hr />
                    <div className={clsx(styles.totalSub)}>
                        Tổng cộng:{" "}
                        <Tag color="blue">
                            {detailOrder.total_combo_price.toLocaleString(
                                "vi-VN"
                            )}{" "}
                            VNĐ
                        </Tag>
                    </div>
                </Skeleton>
            </div>
        </div>
    );
};

export default OrderDetailUI;
