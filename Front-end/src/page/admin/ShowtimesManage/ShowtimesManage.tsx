import React from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const { Column, ColumnGroup } = Table;

interface DataType {
    key: React.Key;
    firstName: string;
    lastName: string;
    age: number;
    address: string;
    tags: string[];
}

const ShowtimesManage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/showTime`
            );
            console.log("showtime-data", data);

            return data.now_showing.data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    return (
        <div>
            <Button>
                <PlusCircleOutlined />
                Tạo lịch chiếu
            </Button>
            <Table<DataType> dataSource={data}>
                <Column title="Phim chiếu" dataIndex="age" key="title" />

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
                <Column title="Phân loại" dataIndex="address" key="address" />
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
