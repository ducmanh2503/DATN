import React, { useState } from "react";
import {
    Button,
    Divider,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    Tag,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DetailFilm from "./DetailFilm";
import {
    GET_FILM_LIST,
    FORCE_DELETE_FILM,
    RESTORE_FILM,
} from "../../../config/ApiConfig";

interface DataType {
    key: React.Key;
    id: number;
    name: string;
    age: number;
    address: string;
}

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

const StoppedMovies: React.FC = () => {
    const [messageApi, holderMessageApi] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );

    const columns: TableColumnsType<DataType> = [
        {
            title: "Tên Phim",
            dataIndex: "title",
            key: "title",
            render: (text: string, item: any) => (
                <DetailFilm id={item.id} film={text}></DetailFilm>
            ),
        },

        {
            title: "Hành động",
            render: (_, items: any) => {
                return (
                    <Space>
                        <Popconfirm
                            title="Xóa vĩnh viễn phim ?"
                            description="Bạn có chắc chắn muốn xóa  không?"
                            okText="Yes"
                            onConfirm={() => {
                                mutate(items.id);
                            }}
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                Xóa vĩnh viễn
                            </Button>
                        </Popconfirm>
                        <Button type="primary">Khôi phục</Button>
                    </Space>
                );
            },
        },
    ];

    const { data, isLoading, isError } = useQuery({
        queryKey: ["StoppedMovies"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_LIST}`);
            console.log(data);

            return data.trashed_movies.data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(FORCE_DELETE_FILM(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa phim thành công");
            queryClient.invalidateQueries({
                queryKey: ["StoppedMovies"],
            });
        },
    });

    const { restore } = useMutation({
        mutationFn: async (id: number) => {
            await axios.put(RESTORE_FILM(id));
        },
        onSuccess: () => {
            messageApi.success("Khôi phục phim thành công");
            queryClient.invalidateQueries({
                queryKey: ["StoppedMovies"],
            });
        },
    });
    return (
        <div>
            {holderMessageApi}
            <Divider />
            <Skeleton loading={isLoading} active>
                <Table<DataType>
                    rowSelection={{ type: selectionType, ...rowSelection }}
                    columns={columns}
                    dataSource={data}
                />
            </Skeleton>
        </div>
    );
};

export default StoppedMovies;
