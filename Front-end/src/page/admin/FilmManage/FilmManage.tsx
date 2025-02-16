import React, { useState } from "react";
import {
    Button,
    Divider,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILMS, DELETE_ONE_FILM } from "../../../config/ApiConfig";
import { DeleteOutlined } from "@ant-design/icons";

interface DataType {
    key: React.Key;
    id: number;
    title: string;
    genre: string;
    release_date: string;
    running_time: string;
    movie_status: string;
}

const FilmManage: React.FC = () => {
    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );
    const rowSelection: TableProps<DataType>["rowSelection"] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            console.log(
                `selectedRowKeys: ${selectedRowKeys}`,
                "selectedRows: ",
                selectedRows
            );
        },
        getCheckboxProps: (record: DataType) => ({
            disabled: record.title === "Disabled Title",
            name: record.title,
        }),
    };

    const columns: TableColumnsType<DataType> = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: "Genre",
            dataIndex: "genre",
            key: "genre",
        },
        {
            title: "Release date",
            dataIndex: "release_date",
            key: "release_date",
        },
        {
            title: "Running Time",
            dataIndex: "running_time",
            key: "running_time",
        },
        {
            title: "Movie Status",
            dataIndex: "movie_status",
            key: "movie_status",
            render: (_, item) => {
                return (
                    <span>
                        {item.movie_status ? "Now Showing" : "Coming Soon"}"
                    </span>
                );
            },
        },
        {
            title: "Actions",
            render: (_, item) => {
                return (
                    <Space>
                        <Popconfirm
                            title="Xóa sản phẩm"
                            description="Bạn có chắc chắn muốn xóa không"
                            onConfirm={() => {
                                mutate(item.id);
                            }}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="primary" danger>
                                <DeleteOutlined /> Xóa
                            </Button>
                        </Popconfirm>

                        <Button type="primary">Sửa</Button>
                    </Space>
                );
            },
        },
    ];
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["MOVIE"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILMS}`);
            return data?.now_showing.data;
        },
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching data</div>;

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`${DELETE_ONE_FILM(id)}`);
        },
        onSuccess: () => {
            messageApi.success("Xóa sản phẩm thành công");
            queryClient.invalidateQueries({
                queryKey: ["MOVIE"],
            });
        },
    });

    return (
        <div>
            {contextHolder}
            <Divider />
            <Skeleton loading={isLoading} active>
                <Table<DataType>
                    rowSelection={{ type: selectionType, ...rowSelection }}
                    columns={columns}
                    dataSource={data}
                ></Table>
            </Skeleton>
        </div>
    );
};

export default FilmManage;
