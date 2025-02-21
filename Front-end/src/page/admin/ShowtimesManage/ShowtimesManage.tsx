import React, { useEffect, useState } from "react";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddShowtimes from "./AddShowtimes";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import EditShowtimes from "./EditShowtimes";
// import "@ant-design/v5-patch-for-react-19";

interface DataType {
  key: React.Key;
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  movie_status: string;
}

const ShowtimesManage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  // const [shouldFetch, setShouldFetch] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["showtimesFilm"],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:8000/api/showTime`);
      console.log("showtime-data", data);

      return data.map((item: any) => ({
        ...item,
        key: item.id,
      }));
    },
    staleTime: 10000,
  });

  const { mutate } = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8000/api/showTime/${id}`);
    },
    onSuccess: () => {
      messageApi.success("Xóa lịch chiếu thành công");
      queryClient.invalidateQueries({
        queryKey: ["showtimesFilm"],
        refetchType: "none",
      });
    },
  });

  return (
    <div>
      <AddShowtimes></AddShowtimes>
      {contextHolder}
      <Table<DataType> dataSource={data}>
        <Column
          title="Phim chiếu"
          dataIndex="movie"
          key="movie"
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
          <Column title="Ngày bắt đầu" dataIndex="show_date" key="show_date" />
          <Column title="Ngày kết thúc" dataIndex="show_time" key="show_time" />
        </ColumnGroup>
        <Column
          title="Phân loại"
          dataIndex="movie_status"
          key="movie_status"
          render={(status: string) => {
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
          render={(_: any, record: DataType) => (
            <Space size="middle">
              <Popconfirm
                title="Xóa phim này?"
                description="Bạn có chắc chắn muốn xóa  không?"
                okText="Yes"
                onConfirm={() => mutate(record.id)}
                cancelText="No"
              >
                <Button type="primary" danger>
                  <DeleteOutlined /> Xóa
                </Button>
              </Popconfirm>
              <EditShowtimes id={record.id}></EditShowtimes>
            </Space>
          )}
        />
      </Table>
      ;
    </div>
  );
};
export default ShowtimesManage;
