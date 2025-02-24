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
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  DELETE_DIRECTORS,
  GET_DIRECTORS_LIST,
} from "../../../config/ApiConfig";
import AddDirector from "./AddDirector";
import EditDirector from "./EditDirector";
import { DataTypeGenresActorsDirectors } from "../../../types/interface";

type DataIndex = keyof DataTypeGenresActorsDirectors;

const DirectorsManage: React.FC = () => {
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
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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

  const columns: TableColumnsType<DataTypeGenresActorsDirectors> = [
    {
      title: "Đạo diễn",
      dataIndex: "directors",
      key: "directors",
      ...getColumnSearchProps("directors"),
      render: (_, record: any) => <span>{record.name_director}</span>,
    },
    {
      title: "Hành động",
      render: (_, items: any) => {
        return (
          <Space>
            <Popconfirm
              title="Xóa đạo diễn ?"
              description="Bạn có chắc chắn muốn xóa không?"
              okText="Yes"
              onConfirm={() => {
                mutate(items.id);
              }}
              cancelText="No"
            >
              <Button type="primary" danger>
                <DeleteOutlined /> Xóa
              </Button>
            </Popconfirm>
            <EditDirector id={items.id}></EditDirector>
          </Space>
        );
      },
    },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["Directors"],
    queryFn: async () => {
      const { data } = await axios.get(`${GET_DIRECTORS_LIST}`);
      console.log(data);

      return data.map((item: any) => ({
        ...item,
        key: item.id,
      }));
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(DELETE_DIRECTORS(id));
    },
    onSuccess: () => {
      messageApi.success("Xóa thành công");
      queryClient.invalidateQueries({
        queryKey: ["Directors"],
      });
    },
  });

  return (
    <>
      <AddDirector></AddDirector>
      <Skeleton loading={isLoading}>
        <Table<DataTypeGenresActorsDirectors>
          columns={columns}
          dataSource={data}
        />
      </Skeleton>
    </>
  );
};

export default DirectorsManage;
