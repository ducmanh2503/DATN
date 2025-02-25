import React, { useRef, useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import {
    Button,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddCalendar from "../CalendarShow/AddCalendar";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import EditCalendar from "../CalendarShow/EditCalendar";
import RefreshBtn from "../RefreshBtn";
import "@ant-design/v5-patch-for-react-19";
import { DataTypeGenresActorsDirectors } from "../../../types/interface";
import { DELETE_CALENDAR, GET_CALENDAR } from "../../../config/ApiConfig";

type DataIndex = keyof DataTypeGenresActorsDirectors;

const CalendarManage: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

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
    ): TableColumnType<DataTypeGenresActorsDirectors> => ({
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
        onFilter: (value, record: any) =>
            record[dataIndex]?.title
                ?.toString()
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

    const { data, isLoading } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            console.log("showtime-data", data);

            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 0,
    });

    const { mutate } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_CALENDAR(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa lịch chiếu thành công");
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
        },
    });

    return (
        <div>
            <AddCalendar></AddCalendar>
            <RefreshBtn queryKey={["showtimesFilm"]}></RefreshBtn>
            {contextHolder}
            <Skeleton loading={isLoading} active>
                <Table<DataTypeGenresActorsDirectors> dataSource={data}>
                    <Column
                        title="Phim chiếu"
                        dataIndex="movie"
                        key="movie"
                        {...getColumnSearchProps("movie")}
                        render={(movie) => (
                            <span
                                style={{
                                    color: "var(--border-color)",
                                    fontWeight: 500,
                                    fontSize: "16px",
                                }}
                            >
                                {movie?.title || "Không có tên"}
                            </span>
                        )}
                    />
                    <ColumnGroup title="Thời gian chiếu">
                        <Column
                            title="Ngày bắt đầu"
                            dataIndex="show_date"
                            key="show_date"
                            sorter={(a, b) =>
                                new Date(a.show_date).getTime() -
                                new Date(b.show_date).getTime()
                            }
                        />
                        <Column
                            title="Ngày kết thúc"
                            dataIndex="end_date"
                            key="end_date"
                        />
                    </ColumnGroup>
                    <Column
                        title="Phân loại"
                        dataIndex={["movie", "movie_status"]} // Truy cập trực tiếp
                        key="movie_status"
                        sorter={
                            (a, b) =>
                                a.movie.movie_status.localeCompare(
                                    b.movie.movie_status
                                ) // So sánh chuỗi
                        }
                        render={(_, record: any) => {
                            const status = record.movie.movie_status;
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
                        render={(
                            _: any,
                            record: DataTypeGenresActorsDirectors
                        ) => (
                            <Space size="middle">
                                <Popconfirm
                                    title="Xóa phim này?"
                                    description="Bạn có chắc chắn muốn xóa không?"
                                    okText="Yes"
                                    onConfirm={() => mutate(record.id)}
                                    cancelText="No"
                                >
                                    <Button type="primary" danger>
                                        <DeleteOutlined /> Xóa
                                    </Button>
                                </Popconfirm>
                                <EditCalendar id={record.id}></EditCalendar>
                            </Space>
                        )}
                    />
                </Table>
            </Skeleton>
            ;
        </div>
    );
};

export default CalendarManage;
