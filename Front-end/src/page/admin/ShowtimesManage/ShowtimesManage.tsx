import React from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";

const { Column, ColumnGroup } = Table;

interface DataType {
    key: React.Key;
    firstName: string;
    lastName: string;
    age: number;
    address: string;
    tags: string[];
}

const data: DataType[] = [
    {
        key: "1",
        firstName: "John",
        lastName: "Brown",
        age: 32,
        address: "New York No. 1 Lake Park",
        tags: ["nice", "developer"],
    },
    {
        key: "2",
        firstName: "Jim",
        lastName: "Green",
        age: 42,
        address: "London No. 1 Lake Park",
        tags: ["loser"],
    },
    {
        key: "3",
        firstName: "Joe",
        lastName: "Black",
        age: 32,
        address: "Sydney No. 1 Lake Park",
        tags: ["cool", "teacher"],
    },
];

const ShowtimesManage = () => {
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
