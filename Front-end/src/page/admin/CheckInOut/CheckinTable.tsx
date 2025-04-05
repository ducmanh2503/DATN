import React, { useRef, useState } from "react";
import {
    Button,
    Input,
    InputRef,
    Space,
    Table,
    TableColumnsType,
    TableColumnType,
    Tag,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import { OrdersType } from "../../../types/interface";
import OrderDetail from "../Order/Orderdetail";

type DataIndex = keyof OrdersType;

const CheckinTable = ({ orderListManage }: any) => {
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

    const renderDetailOrder = React.useCallback(
        (text: string, item: any) => <OrderDetail id={item.id}></OrderDetail>,
        []
    );

    const columns: TableColumnsType<OrdersType> = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            width: "200px",
            ...getColumnSearchProps("id"),
            render: (value: any, record: any) =>
                record.check_in === "waiting"
                    ? renderDetailOrder(value, record)
                    : record.id,
        },
        {
            title: "Tên phim",
            dataIndex: "movie_title",
            key: "movie_title",
            width: "20%",
            render: (value: string, record: any) => (
                <span>{record.movie_title}</span>
            ),
        },
        {
            title: "Suất chiếu",
            dataIndex: "showtime",
            key: "showtime",
            render: (value: string, record: any) => (
                <Tag color="volcano">{record.showtime}</Tag>
            ),
        },
        {
            title: "Phòng chiếu",
            dataIndex: "room_name",
            key: "room_name",
            render: (value: string) => {
                // Kiểm tra nếu chưa có màu cho room_name, thì tạo màu mới
                if (!roomColorMap[value]) {
                    roomColorMap[value] = getRandomColor();
                }
                return <Tag color={roomColorMap[value]}>{value}</Tag>;
            },
        },

        {
            title: "Trạng thái sử dụng",
            dataIndex: "check_in",
            key: "check_in",

            render: (value: any, record: any) => {
                const color =
                    record.check_in === "checked_in"
                        ? "geekblue"
                        : record.check_in === "waiting"
                        ? "purple"
                        : "default"; // Giá trị mặc định nếu không vắng

                return (
                    <Tag color={color}>
                        {record.check_in === "checked_in"
                            ? "Đã đến"
                            : record.check_in === "waiting"
                            ? "Đang đợi"
                            : "Vắng mặt"}
                    </Tag>
                );
            },
        },
    ];

    return <Table<OrdersType> columns={columns} dataSource={orderListManage} />;
};

export default CheckinTable;
