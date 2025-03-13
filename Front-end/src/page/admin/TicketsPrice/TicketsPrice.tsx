import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, TableColumnsType } from "antd";

interface DataType {
    key: React.Key;
    name: string;
    age: number;
    applyDayType: string;
}
const TicketsPrice = () => {
    const columns: TableColumnsType<DataType> = [
        {
            title: "Loại ghế",
            dataIndex: "name",
            key: "name",
            filters: [
                {
                    text: "Ghế thường",
                    value: "ngày thường",
                },
                {
                    text: "Ghế VIP",
                    value: "ngày cuối tuần",
                },
                {
                    text: "Ghế SweetBox",
                    value: "ngày lễ",
                },
            ],
            onFilter: (value, record) => record.name === value,
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "age",
            sorter: (a, b) => a.age - b.age,
        },
        {
            title: "Loại ngày áp dụng",
            dataIndex: "applyDayType",
            filters: [
                {
                    text: "Ngày thường",
                    value: "ngày thường",
                },
                {
                    text: "Ngày cuối tuần",
                    value: "ngày cuối tuần",
                },
                {
                    text: "Ngày lễ",
                    value: "ngày lễ",
                },
            ],
            onFilter: (value, record) => record.applyDayType === value,
        },
        {
            title: "Loại phòng chiếu",
            dataIndex: "address",
        },
        {
            title: "Giá vé",
            dataIndex: "address",
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
                            // onConfirm={() => handleDelete(items.id)}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>
                        {/* <EditFil id={items.id}></EditFil> */}
                    </Space>
                );
            },
        },
    ];

    const data = [
        {
            key: "1",
            name: "John Brown",
            age: 32,
            applyDayType: "ngày lễ",
        },
        {
            key: "2",
            name: "Jim Green",
            age: 42,
            applyDayType: "ngày cuối tuần",
        },
        {
            key: "3",
            name: "Joe Black",
            age: 32,
            applyDayType: "ngày cuối tuần",
        },
        {
            key: "4",
            name: "Jim Red",
            age: 32,
            applyDayType: "London No. 2 Lake Park",
        },
    ];

    return (
        <div>
            <Table<DataType>
                columns={columns}
                dataSource={data}
                showSorterTooltip={{ target: "sorter-icon" }}
            />
        </div>
    );
};

export default TicketsPrice;
