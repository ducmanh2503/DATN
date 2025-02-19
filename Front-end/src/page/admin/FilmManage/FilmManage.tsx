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
import { GET_FILM_LIST, DELETE_FILM } from "../../../config/ApiConfig";
import EditFilm from "./EditFilm";
import { DeleteOutlined } from "@ant-design/icons";

interface DataType {
    key: React.Key;
    id: number;
    name: string;
    age: number;
    address: string;
}

const FilmManage: React.FC = () => {
    const [messageApi, holderMessageApi] = message.useMessage();
    const queryClient = useQueryClient();
    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );

    const onRowSelectionChange = (
        selectedRowKeys: React.Key[],
        selectedRows: DataType[]
    ) => {
        console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
        );
    };

    const rowSelection: TableProps<DataType>["rowSelection"] = {
        onChange: onRowSelectionChange,
        getCheckboxProps: (record: DataType) => ({
            disabled: record.name === "Disabled User",
            name: record.name,
        }),
    };

    const renderDetailFilm = React.useCallback(
        (text: string, item: any) => (
            <DetailFilm id={item.id} film={text}></DetailFilm>
        ),
        []
    );

    const columns: TableColumnsType<DataType> = React.useMemo(
        () => [
            {
                title: "Tên Phim",
                dataIndex: "title",
                key: "title",
                render: renderDetailFilm,
            },
            {
                title: "Đạo diễn",
                dataIndex: "directors",
                key: "directors",
            },
            {
                title: "Thể loại",
                dataIndex: "genre",
                key: "genre",
                render: (genres: any) => {
                    if (!Array.isArray(genres)) {
                        genres = [genres];
                    }

                    const colorMap: { [key: string]: string } = {
                        "Hành động": "volcano",
                        "Chính kịch": "geekblue",
                        "Hài hước": "green",
                        "Kinh dị": "red",
                        "Phiêu lưu": "orange",
                        "Lãng mạn": "violet",
                        "Tình cảm": "pink",
                    };
                    return (
                        <>
                            {genres.map((genre: any) => {
                                const color =
                                    colorMap[genre.name_genre] || "blue";

                                return (
                                    <Tag color={color} key={genre}>
                                        {genre.name_genre}
                                    </Tag>
                                );
                            })}
                        </>
                    );
                },
            },
            {
                title: "Ngày phát hành",
                dataIndex: "release_date",
                key: "release_date",
            },
            {
                title: "Thời lượng",
                dataIndex: "running_time",
                key: "running_time",
                render: (time: number) => {
                    return `${time} phút`;
                },
            },
            {
                title: "Trạng thái",
                dataIndex: "movie_status",
                key: "movie_status",
                render: (status: string) => {
                    return status === "now_showing" ? (
                        <Tag color="green">{status}</Tag>
                    ) : (
                        <Tag color="red">{status}</Tag>
                    );
                },
            },
            {
                title: "Trailer",
                dataIndex: "trailer",
                key: "trailer",
                render: (trailer: string) => {
                    return (
                        <a href={trailer} target="_blank">
                            Xem Trailer
                        </a>
                    );
                },
            },
            {
                title: "Hành động",
                render: (_, items: any) => {
                    return (
                        <Space>
                            <Popconfirm
                                title="Xóa phim này?"
                                description="Bạn có chắc chắn muốn xóa  không?"
                                okText="Yes"
                                onConfirm={() => handleDelete(items.id)}
                                cancelText="No"
                            >
                                <Button type="primary" danger>
                                    <DeleteOutlined /> Xóa
                                </Button>
                            </Popconfirm>
                            <EditFilm id={items.id}></EditFilm>
                        </Space>
                    );
                },
            },
        ],
        [renderDetailFilm]
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_LIST}`);
            console.log(data);

            return data.now_showing.data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const dataSource = React.useMemo(() => data, [data]);

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            console.log(id);
            console.log(DELETE_FILM(id));
            await axios.delete(DELETE_FILM(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa phim thành công");
            queryClient.invalidateQueries({
                queryKey: ["filmList"],
            });
        },
    });

    const handleDelete = (id: number) => {
        mutate(id);
    };

    return (
        <div>
            {holderMessageApi}
            <Divider />
            <Skeleton loading={isLoading} active>
                <Table<DataType>
                    rowSelection={{ type: selectionType, ...rowSelection }}
                    columns={columns}
                    dataSource={dataSource}
                />
            </Skeleton>
        </div>
    );
};

export default FilmManage;
