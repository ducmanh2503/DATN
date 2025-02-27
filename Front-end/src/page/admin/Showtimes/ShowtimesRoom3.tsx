import { Button, Input, message, Popconfirm, Space, Table } from "antd";
import { RoomSHowtimesType } from "../../../types/interface";
import "./ShowtimesRoom.css";
import { DeleteOutlined } from "@ant-design/icons";
import EditCalendar from "../CalendarShow/EditCalendar";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const ShowtimesRoom3 = ({ data }: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    // const { mutate } = useMutation({
    //     mutationFn: async (id: number) => {
    //         await axios.delete(DELETE_CALENDAR(id));
    //     },
    //     onSuccess: () => {
    //         messageApi.success("Xóa lịch chiếu thành công");
    //     },
    // });

    const columns = [
        {
            title: "Phim chiếu",
            dataIndex: "calendar_show",
            key: "calendar_show",
            render: (_: any, recordTitle: any) => {
                return <span>{recordTitle.calendar_show.movie.title}</span>;
            },
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "room_type",
            key: "room_type",
            render: (_: any, recordRoom: any) => {
                return <span>{recordRoom.room.room_type}</span>;
            },
        },
        {
            title: "Hình thức dịch",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Thời gian chiếu",
            dataIndex: "start_time",
            key: "start_time",
            render: (_: any, time: any) => {
                return <span>{`${time.start_time} ~ ${time.end_time}`}</span>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: RoomSHowtimesType) => (
                <Space size="middle">
                    <Popconfirm
                        title="Xóa phim này?"
                        description="Bạn có chắc chắn muốn xóa không?"
                        okText="Yes"
                        onConfirm={() => mutate(record.id)}
                        cancelText="No"
                    >
                        <Button type="primary" danger>
                            <DeleteOutlined /> Xóa
                        </Button>
                    </Popconfirm>
                    <EditCalendar id={record.id}></EditCalendar>
                </Space>
            ),
        },
    ];
    return (
        <div className="roomBox">
            <h1 className="roomName">Phòng chiếu số 3</h1>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default ShowtimesRoom3;
