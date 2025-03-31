import React, { useRef, useState } from "react";
import { useOrdersList } from "../../../services/adminServices/orderManage.service";
import {
    Button,
    Input,
    InputRef,
    Skeleton,
    Space,
    Table,
    TableColumnsType,
    TableColumnType,
    Tag,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";
import styles from "./Order.module.css";
import OrderDetail from "./Orderdetail";
import { OrdersType } from "../../../types/interface";
import dayjs from "dayjs";

type DataIndex = keyof OrdersType;

const OrderList = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const getColumnSearchProps = (
        dataIndex: DataIndex
    ): TableColumnType<OrdersType> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex
                        )
                    }
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(
                                selectedKeys as string[],
                                confirm,
                                dataIndex
                            )
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined
                style={{ color: filtered ? "#1677ff" : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) => searchedColumn === dataIndex && text,
    });

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    // Tạo cache lưu trữ màu cho từng giá trị room_name
    const roomColorMap: Record<string, string> = {};

    //  màu ngẫu nhiên
    const getRandomColor = () => {
        const colors = [
            "magenta",
            "red",
            "volcano",
            "orange",
            "gold",
            "lime",
            "green",
            "cyan",
            "blue",
            "geekblue",
            "purple",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const { data, isLoading, isError } = useOrdersList();

    const renderDetailOrder = React.useCallback(
        (text: string, item: any) => <OrderDetail id={item.id}></OrderDetail>,
        []
    );

    const columns: TableColumnsType<OrdersType> = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            width: "100px",
            render: renderDetailOrder,
            // ...getColumnSearchProps("id"),
        },
        {
            title: "Tên phim",
            dataIndex: "movie_title",
            key: "movie_title",
            width: "20%",
            ...getColumnSearchProps("movie_title"),
            render: (value: string, record: any) => (
                <span className={clsx(styles.movieTitle)}>
                    {record.movie_title}
                </span>
            ),
        },
        {
            title: "Suất chiếu",
            dataIndex: "showtime",
            key: "showtime",
            ...getColumnSearchProps("showtime"),
            render: (value: string, record: any) => (
                <Tag color="volcano">{record.showtime}</Tag>
            ),
        },
        {
            title: "Phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            ...getColumnSearchProps("room_name"),
            render: (value: string) => {
                // Kiểm tra nếu chưa có màu cho room_name, thì tạo màu mới
                if (!roomColorMap[value]) {
                    roomColorMap[value] = getRandomColor();
                }
                return <Tag color={roomColorMap[value]}>{value}</Tag>;
            },
        },

        {
            title: "Trạng thái đơn hàng",
            dataIndex: "status",
            key: "status",
            render: (value: string) => {
                return value === "confirmed" ? (
                    <Tag color="green">Đã thanh toán</Tag>
                ) : (
                    <Tag color="red">Đang đợi xử lý</Tag>
                );
            },
            sorter: (a, b) => a.status.length - b.status.length,
        },
        {
            title: "Trạng thái sử dụng",
            dataIndex: "statusUse",
            key: "statusUse",
            render: (value: string, record: any) => {
                const color =
                    record.a === "a"
                        ? "orange"
                        : record.a === "b"
                        ? "geekblue"
                        : record.a === "c"
                        ? "magenta"
                        : "default"; // Giá trị mặc định nếu không khớp

                return <Tag color={color}>{record.a}</Tag>;
            },
            // sorter: (a, b) => a.status.length - b.status.length,
        },

        {
            title: "Tổng tiền",
            dataIndex: "total_price",
            key: "total_price",
            render: (value: string, record: any) => {
                return (
                    <span>
                        {parseInt(record.total_price).toLocaleString("vi-VN")}{" "}
                        VNĐ
                    </span>
                );
            },
            sorter: (a, b) =>
                parseInt(a.total_combo_price) - parseInt(b.total_combo_price),
        },
        {
            title: "Ngày giao dịch",
            dataIndex: "created_at",
            key: "created_at",
            ...getColumnSearchProps("created_at"),
            sorter: (a, b) => {
                return (
                    dayjs(a.created_at, "DD-MM-YYYY").valueOf() -
                    dayjs(b.created_at, "DD-MM-YYYY").valueOf()
                );
            },
            render: (value: string) => {
                const date = dayjs(value, "DD-MM-YYYY");
                return date.isValid()
                    ? date.format("DD/MM/YYYY")
                    : "Không có ngày";
            },
        },
    ];

    return (
        <Skeleton loading={isLoading} active>
            <Table<OrdersType> columns={columns} dataSource={data} />
        </Skeleton>
    );
};

export default OrderList;
