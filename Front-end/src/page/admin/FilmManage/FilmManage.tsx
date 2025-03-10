import React, { useRef, useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type {
    InputRef,
    TableColumnsType,
    TableColumnType,
    TableProps,
} from "antd";
import {
    Button,
    Divider,
    Input,
    message,
    Popconfirm,
    Skeleton,
    Space,
    Table,
    Tag,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import axios from "axios";
import { DELETE_FILM, GET_FILM_LIST } from "../../../config/ApiConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DetailFilm from "../FilmManage/DetailFilm";
import EditFilm from "../FilmManage/EditFilm";
import "./AddFilm.css";
import { FormData } from "../../../types/interface";

type DataIndex = keyof FormData;

const FilmManage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, holderMessageApi] = message.useMessage();
    const queryClient = useQueryClient();

    const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
        "checkbox"
    );

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
    ): TableColumnType<FormData> => ({
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
                    placeholder={`Search`}
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

    const onRowSelectionChange = (
        selectedRowKeys: React.Key[],
        selectedRows: FormData[]
    ) => {
        console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
        );
    };
    const rowSelection: TableProps<FormData>["rowSelection"] = {
        onChange: onRowSelectionChange,
        getCheckboxProps: (record: FormData) => ({
            disabled: record.title === "Disabled Film",
            name: record.title,
        }),
    };

    const renderDetailFilm = React.useCallback(
        (text: string, item: any) => (
            <DetailFilm id={item.id} film={text}></DetailFilm>
        ),
        []
    );

    const columns: TableColumnsType<FormData> = React.useMemo(
        () => [
            {
                title: "Tên Phim",
                dataIndex: "title",
                key: "title",
                ...getColumnSearchProps("title"),
                render: renderDetailFilm,
            },
            {
                title: "Đạo diễn",
                dataIndex: "directors",
                key: "directors",
                ...getColumnSearchProps("directors"),
                render: (records: any) => {
                    return (
                        <div className="cliptextTitle directorsColumn">
                            {records.name_director}
                        </div>
                    );
                },
            },
            {
                title: "Thể loại",
                dataIndex: "genres",
                key: "genres",
                width: 190,
                ...getColumnSearchProps("genre"),
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
                        <div className="cliptextTitle genresColumn">
                            {genres.map((genre: any, index: number) => {
                                const color =
                                    colorMap[genre.name_genre] || "blue";

                                return (
                                    <Tag
                                        color={color}
                                        key={index}
                                        style={{ marginBottom: "5px" }}
                                    >
                                        {genre.name_genre}
                                    </Tag>
                                );
                            })}
                        </div>
                    );
                },
            },
            {
                title: "Ngày phát hành",
                dataIndex: "release_date",
                key: "release_date",
                ...getColumnSearchProps("release_date"),
            },
            {
                title: "Thời lượng",
                dataIndex: "running_time",
                key: "running_time",
                render: (time: number) => {
                    return `${time}`;
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
                                description="Bạn có chắc chắn muốn xóa không?"
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

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
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
        onError: (error: any) => {
            messageApi.error(
                error?.response?.data?.message || "Có lỗi xảy ra!"
            );
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
                <Table<FormData>
                    columns={columns}
                    dataSource={dataSource}
                    rowSelection={{ type: selectionType, ...rowSelection }}
                    rowClassName={() => "custom-row"}
                />
            </Skeleton>
        </div>
    );
};

export default FilmManage;
