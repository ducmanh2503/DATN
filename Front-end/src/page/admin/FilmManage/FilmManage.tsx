import React, { useState } from "react";
import { Divider, Radio, Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";

interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
}

const columns: TableColumnsType<DataType> = [
    {
        title: "Title",
        dataIndex: "title",
        render: (text: string) => <a>{text}</a>,
    },
    {
        title: "Genre",
        dataIndex: "genre",
    },
    {
        title: "Release date",
        dataIndex: "Release_date",
    },
    {
        title: "Running Time",
        dataIndex: "running_time",
    },
    {
        title: "Movie Status",
        dataIndex: "movie_status",
    },
    {
        title: "Actions",
        render: () => {
            return <></>;
        },
    },
];

const rowSelection: TableProps<DataType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
        console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
        );
    },
    getCheckboxProps: (record: DataType) => ({
        disabled: record.name === "Disabled User",
        name: record.name,
    }),
};

const FilmManage: React.FC = () => {
    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );

    return (
        <div>
            <Divider />
            <Table<DataType>
                rowSelection={{ type: selectionType, ...rowSelection }}
                columns={columns}
                // dataSource={data}
            />
        </div>
    );
};

export default FilmManage;
