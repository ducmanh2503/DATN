import React from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AddShowtimes from "./AddShowtimes";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";

interface DataType {
    key: React.Key;
    title: string;
    firstName: string;
    lastName: string;
    movie_status: string;
}

const ShowtimesManage = () => {
    //     const { data, isLoading } = useQuery({
    //         queryKey: ["showtimesFilm"],
    //         queryFn: async () => {
    //             const { data } = await axios.get(
    //                 `http://localhost:8000/api/showTime`
    //             );
    //             console.log("showtime-data", data);

    //             return data.now_showing.data.map((item: any) => ({
    //                 ...item,
    //                 key: item.id,
    //             }));
    //         },
    //     });

    const fakeData: DataType[] = [
        {
            key: "1",
            title: "Phim A",
            firstName: "2025-03-01",
            lastName: "2025-03-10",
            movie_status: "now_showing",
        },
        {
            key: "2",
            title: "Phim B",
            firstName: "2025-04-05",
            lastName: "2025-04-15",
            movie_status: "coming_soon",
        },
        {
            key: "3",
            title: "Phim C",
            firstName: "2025-05-10",
            lastName: "2025-05-20",
            movie_status: "now_showing",
        },
    ];

    return (
        <div>
            <AddShowtimes></AddShowtimes>
            <Table<DataType> dataSource={fakeData}>
                <Column title="Phim chiếu" dataIndex="title" key="title" />

                <ColumnGroup title="Thời gian chiếu">
                    <Column
                        title="Ngày bắt đầu"
                        dataIndex="firstName"
                        key="firstName"
                    />
                    <Column
                        title="Ngày kết thúc"
                        dataIndex="lastName"
                        key="lastName"
                    />
                </ColumnGroup>
                <Column
                    title="Phân loại"
                    dataIndex="movie_status"
                    key="movie_status"
                    render={(status: string) => {
                        return status === "now_showing" ? (
                            <Tag color="green">Đang chiếu</Tag>
                        ) : (
                            <Tag color="red">Sắp chiếu</Tag>
                        );
                    }}
                />
                <Column
                    title="Action"
                    key="action"
                    render={(_: any, record: DataType) => (
                        <Space size="middle">
                            <Popconfirm
                                title="Xóa phim này?"
                                description="Bạn có chắc chắn muốn xóa  không?"
                                okText="Yes"
                                // onConfirm={() => handleDelete(items.id)}
                                cancelText="No"
                            >
                                <Button type="primary" danger>
                                    <DeleteOutlined /> Xóa
                                </Button>
                            </Popconfirm>
                            <Button type="primary">Chỉnh Sửa</Button>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};
export default ShowtimesManage;
