import { Space, Table, Tag } from "antd";
import { RoomSHowtimesType } from "../../../types/interface";
import "./ShowtimesRoom.css";
import EditCalendar from "../CalendarShow/EditCalendar";
import DeleteShowtimes from "./DeleteShowtimes";

const ShowtimesRoom1 = ({ data }: any) => {
    const columns = [
        {
            title: "Phim chiếu",
            dataIndex: "calendar_show",
            key: "calendar_show",
            render: (_: any, recordTitle: any) => {
                const title =
                    recordTitle?.calendar_show?.movie?.title || "Không có";

                return (
                    <span
                        style={{
                            color: "var(--border-color)",
                            fontWeight: 500,
                        }}
                    >
                        {title}
                    </span>
                );
            },
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "room_type",
            key: "room_type",
            render: (_: any, recordRoom: any) => {
                return <Tag color="volcano">{recordRoom.room.room_type}</Tag>;
            },
        },
        {
            title: "Hình thức dịch",
            dataIndex: "address",
            key: "address",
            render: (record: any) => {
                return record === "lồng tiếng" ? (
                    <Tag color="gold">Lồng tiếng</Tag>
                ) : (
                    <Tag color="green">Thuyết minh</Tag>
                );
            },
        },
        {
            title: "Thời gian chiếu",
            dataIndex: "start_time",
            key: "start_time",
            render: (_: any, time: any) => {
                return (
                    <>
                        <Tag color="magenta">{time.start_time}</Tag>
                        <Tag color="geekblue">{time.end_time}</Tag>
                    </>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "";
                let text = "";

                switch (status) {
                    case "coming_soon":
                        color = "blue";
                        text = "Sắp chiếu";
                        break;
                    case "now_showing":
                        color = "orange";
                        text = "Đang chiếu";
                        break;
                    case "referenced":
                        color = "purple";
                        text = "Đã chiếu";
                        break;
                    default:
                        color = "gray";
                        text = "Không xác định";
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: RoomSHowtimesType) => (
                <Space size="middle">
                    <DeleteShowtimes id={record.id}></DeleteShowtimes>
                    <EditCalendar id={record.id}></EditCalendar>
                </Space>
            ),
        },
    ];
    return (
        <div className="roomBox">
            <h1 className="roomName">Phòng chiếu số 1</h1>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};
export default ShowtimesRoom1;
