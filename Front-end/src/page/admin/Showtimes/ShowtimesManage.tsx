import React, { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { Button, Divider, Form, Input, Select, Space, Table } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";

interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
}

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

type DataIndex = keyof DataType;

const data: DataType[] = [
    {
        key: "1",
        name: "John Brown",
        age: 32,
        address: "New York No. 1 Lake Park",
    },
    {
        key: "2",
        name: "Joe Black",
        age: 42,
        address: "London No. 1 Lake Park",
    },
    {
        key: "3",
        name: "Jim Green",
        age: 32,
        address: "Sydney No. 1 Lake Park",
    },
    {
        key: "4",
        name: "Jim Red",
        age: 32,
        address: "London No. 2 Lake Park",
    },
];

const ShowtimesManage: React.FC = () => {
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

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (
        dataIndex: DataIndex
    ): TableColumnType<DataType> => ({
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
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    const columns: TableColumnsType<DataType> = [
        {
            title: "Phim chiếu",
            dataIndex: "name",
            key: "name",
            ...getColumnSearchProps("name"),
        },
        {
            title: "Hình thức chiếu",
            dataIndex: "age",
            key: "age",
            ...getColumnSearchProps("age"),
        },
        {
            title: "Hình thức dịch",
            dataIndex: "address",
            key: "address",
            ...getColumnSearchProps("address"),
        },
        {
            title: "Thời gian chiếu",
            dataIndex: "address",
            key: "address",
            ...getColumnSearchProps("address"),
        },
        {
            title: "Loại suất chiếu",
            dataIndex: "address",
            key: "address",
            ...getColumnSearchProps("address"),
        },
        {
            title: "Trạng thái",
            dataIndex: "address",
            key: "address",
            ...getColumnSearchProps("address"),
        },
    ];

    return (
        <>
            <Form
                name="basic"
                // onFinish={onFinish}
                // onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="inline"
            >
                <Form.Item<FieldType>
                    label="Phòng chiếu:"
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: "Please input your username!",
                        },
                    ]}
                >
                    <Select
                        placeholder={"phòng chiếu"}
                        style={{ width: 120 }}
                        onChange={handleChange}
                        options={[
                            { value: "2D", label: "2D" },
                            { value: "3D", label: "3D" },
                            { value: "4D", label: "4D" },
                        ]}
                    ></Select>
                </Form.Item>

                <Form.Item<FieldType>
                    label="Ngày chiếu:"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                    ]}
                >
                    <Select
                        placeholder={"ngày chiếu"}
                        style={{ width: 120 }}
                        onChange={handleChange}
                        options={[
                            { value: "2D", label: "2D" },
                            { value: "3D", label: "3D" },
                            { value: "4D", label: "4D" },
                        ]}
                    ></Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary">Tìm kiếm</Button>
                </Form.Item>
            </Form>
            <Divider variant="solid" style={{ borderColor: "#7cb305" }}>
                Lịch chiếu ngày:
            </Divider>
            <h1>Phòng chiếu</h1>
            <Table<DataType> columns={columns} dataSource={data} />;
        </>
    );
};

export default ShowtimesManage;
