// import React, { useState } from "react";
// import { Button, Divider, Radio, Space, Table } from "antd";
// import type { TableColumnsType, TableProps } from "antd";
// // import ListFilm from "./ListFilm";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { GET_MOVIES } from "../../../config/ApiConfig";

// interface DataType {
//   key: React.Key;
//   title: string;
//   genre: string;
//   release_date: string;
//   running_time: string;
//   movie_status: string;
// }

// const columns: TableColumnsType<DataType> = [
//   {
//     title: "Title",
//     dataIndex: "title",
//     key: "title",
//     render: (text: string) => <a>{text}</a>,
//   },
//   {
//     title: "Genre",
//     dataIndex: "genre",
//     key: "genre",
//   },
//   {
//     title: "Release date",
//     dataIndex: "release_date",
//     key: "release_date",
//   },
//   {
//     title: "Running Time",
//     dataIndex: "running_time",
//     key: "running_time",
//   },
//   {
//     title: "Movie Status",
//     dataIndex: "movie_status",
//     key: "movie_status",
//     render: (_, item) => {
//       return <span>{item.movie_status ? "Now Showing" : "Coming Soon"}"</span>;
//     },
//   },
//   {
//     title: "Actions",
//     render: (_, item) => {
//       return (
//         <Space>
//           <Button type="primary" danger>
//             Xóa
//           </Button>
//           <Button type="primary">Sửa</Button>
//         </Space>
//       );
//     },
//   },
// ];

// const rowSelection: TableProps<DataType>["rowSelection"] = {
//   onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
//     console.log(
//       `selectedRowKeys: ${selectedRowKeys}`,
//       "selectedRows: ",
//       selectedRows
//     );
//   },
//   getCheckboxProps: (record: DataType) => ({
//     disabled: record.title === "Disabled Movie",
//     name: record.title,
//   }),
// };

// const FilmManage: React.FC = () => {
//   const [selectionType, setSelectionType] = useState<"checkbox">("checkbox");

//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["MOVIE"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${GET_MOVIES}`);
//       console.log(data.now_showing.data);

//       return data.now_showing.data;
//     },
//   });
//   //   if (isLoading) {
//   //     return <div>Loading...</div>; // Hoặc spinner/loading state khác
//   //   }

//   //   if (isError) {
//   //     return <div>Error loading data.</div>; // Xử lý lỗi
//   //   }
//   return (
//     <div>
//       <Divider />

//       <Table<DataType>
//         rowSelection={{ type: selectionType, ...rowSelection }}
//         columns={columns}
//         dataSource={data}
//       ></Table>
//     </div>
//   );
// };

// export default FilmManage;
