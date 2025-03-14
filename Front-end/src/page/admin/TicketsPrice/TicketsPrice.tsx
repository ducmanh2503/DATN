import { DeleteOutlined } from "@ant-design/icons";
import {
    Button,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    TableColumnsType,
    Tag,
} from "antd";
import {
    useDeleteTicketPrice,
    useTicketsPrice,
} from "../../../services/ticketPrice.service";
import clsx from "clsx";
import styles from "./TicketsPrice.module.css";
import EditTicketPrice from "./EditTicketPrice";
import AddTicketPrice from "./AddTicketPrice";

interface TicketsPrice {
    key: React.Key;
    seat_type_name: string;
    room_type_name: number;
    day_type: string;
    price: string;
}

const TicketsPrice = () => {
    const [messageApi, contextHolder] = message.useMessage();

    // lấy data
    const { data: ticketsData, isLoading, error } = useTicketsPrice();
    const deleteTicket = useDeleteTicketPrice(messageApi);
    <Skeleton loading={isLoading} active></Skeleton>;

    // danh sách màu
    const availableColors = [
        "geekblue",
        "green",
        "orange",
        "magenta",
        "red",
        "volcano",
        "gold",
        "lime",
        "cyan",
        "blue",
        "purple",
    ];
    // Hàm lấy màu ngẫu nhiên
    const getRandomColor = () => {
        return availableColors[
            Math.floor(Math.random() * availableColors.length)
        ];
    };

    //tạo map để ánh xạ màu
    const dayTypeColorMap = new Map();
    // Hàm lấy màu theo giá trị day_type
    const getColorByDayType = (day_type: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!dayTypeColorMap.has(day_type)) {
            const randomColor =
                availableColors[dayTypeColorMap.size % availableColors.length];
            dayTypeColorMap.set(day_type, randomColor);
        }
        return dayTypeColorMap.get(day_type);
    };

    //tạo map để ánh xạ màu
    const roomTypeColorMap = new Map();
    //hàm lấy màu theo giá trị room_type_name
    const getColorByRoomsType = (room_type_name: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!roomTypeColorMap.has(room_type_name)) {
            roomTypeColorMap.set(room_type_name, getRandomColor());
        }
        return roomTypeColorMap.get(room_type_name);
    };

    //tạo map để ánh xạ màu
    const seatsTypeColorMap = new Map();
    //hàm lấy màu theo giá trị seat_type_name
    const getColorBySeatsType = (seat_type_name: any) => {
        // Nếu giá trị chưa có màu, gán màu mới
        if (!seatsTypeColorMap.has(seat_type_name)) {
            seatsTypeColorMap.set(seat_type_name, getRandomColor());
        }
        return seatsTypeColorMap.get(seat_type_name);
    };

    //gọi hàm xóa ticket
    const handleDelete = (id: number) => {
        deleteTicket.mutate(id);
    };

    const columns: TableColumnsType<TicketsPrice> = [
        {
            title: "Loại ghế",
            dataIndex: "seat_type_name",
            key: "seat_type_name",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData.map((item: any) => item.seat_type_name)
                      )
                  ).map((value) => ({
                      text: value,
                      value: value,
                  }))
                : [],
            onFilter: (value, record) => record.seat_type_name === value,
            render: (seat_type_name) => (
                <Tag color={getColorBySeatsType(seat_type_name)}>
                    {seat_type_name}
                </Tag>
            ),
        },
        {
            className: clsx(styles.roomTypeName),
            title: "Hình thức chiếu",
            dataIndex: "room_type_name",
            key: "room_type_name",
            filters: ticketsData
                ? Array.from(
                      new Set(
                          ticketsData.map((item: any) => item.room_type_name)
                      )
                  ).map((value) => ({
                      text: value,
                      value: value,
                  }))
                : [],
            onFilter: (value, record) => record.room_type_name === value,
            render: (room_type_name) => (
                <Tag color={getColorByRoomsType(room_type_name)}>
                    {room_type_name}{" "}
                </Tag>
            ),
        },
        {
            title: "Loại ngày áp dụng",
            dataIndex: "day_type",
            key: "day_type",
            filters: ticketsData
                ? Array.from(
                      new Set(ticketsData.map((item: any) => item.day_type))
                  ).map((value) => ({
                      text: value,
                      value: value,
                  }))
                : [],
            onFilter: (value, record) => record.day_type === value,
            render: (day_type) => (
                <Tag color={getColorByDayType(day_type)}>{day_type}</Tag>
            ),
        },
        {
            title: "Loại phòng chiếu",
            dataIndex: "",
            key: "",
        },
        {
            title: "Giá vé",
            dataIndex: "price",
            key: "price",
            sorter: (a: any, b: any) => a.price - b.price,
        },
        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Space>
                        <Popconfirm
                            title="Xóa phim này?"
                            description="Bạn có chắc chắn muốn xóa không?"
                            okText="Yes"
                            onConfirm={() => handleDelete(items.id)}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>
                        <EditTicketPrice id={items.id}></EditTicketPrice>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            {contextHolder}
            <AddTicketPrice></AddTicketPrice>
            <Table<TicketsPrice>
                columns={columns}
                dataSource={ticketsData}
                showSorterTooltip={{ target: "sorter-icon" }}
            />
        </div>
    );
};

export default TicketsPrice;
