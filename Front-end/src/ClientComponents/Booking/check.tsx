// import { Image, Table, TableProps } from "antd";
// import { useState } from "react";
// import "./ComboFood.css";
// import { useMessageContext } from "../../UseContext/ContextState";
// interface DataType {
//     key: string;
//     image: string;
//     title: string;
//     price: number;
//     description: string;
//     quantity: number;
// }
// const ComboFood = ({ className }: any) => {
//     const {
//         quantityCombo,
//         setQuantityCombo,
//         setNameCombo,
//         setTotalComboPrice,
//         totalComboPrice,
//     } = useMessageContext();

//     // Hàm tăng số lượng
//     const increaseQuantity = (key: string) => {
//         setData((prevData) => {
//             return prevData.map((item) => {
//                 if (item.key === key) {
//                     const updatedItem = {
//                         ...item,
//                         quantity: item.quantity + 1,
//                     };

//                     // Cập nhật tổng số lượng combo
//                     setQuantityCombo((prev: number) => prev + 1);

//                     // Cập nhật tổng giá tiền combo
//                     setTotalComboPrice((prev: number) => prev + item.price);

//                     // Cập nhật danh sách tên combo
//                     setNameCombo((prevNames: any) => {
//                         if (!Array.isArray(prevNames)) prevNames = []; // Đảm bảo prevNames là mảng

//                         const exists = prevNames.find(
//                             (name: string) => name === item.title
//                         );
//                         if (exists) {
//                             return prevNames; // Nếu đã tồn tại, không thêm lại
//                         } else {
//                             return [...prevNames, item.title]; // Chỉ lưu title thay vì object
//                         }
//                     });

//                     return updatedItem;
//                 }
//                 return item;
//             });
//         });
//     };

//     // Hàm giảm số lượng
//     const decreaseQuantity = (key: string) => {
//         setData((prevData) => {
//             return prevData.map((item) => {
//                 if (item.key === key && item.quantity > 0) {
//                     const updatedItem = {
//                         ...item,
//                         quantity: item.quantity - 1,
//                     };

//                     // Cập nhật tổng số lượng combo
//                     setQuantityCombo((prev: number) => Math.max(prev - 1, 0));

//                     // Cập nhật tổng giá tiền combo
//                     setTotalComboPrice((prev: number) =>
//                         Math.max(prev - item.price, 0)
//                     );

//                     // Cập nhật danh sách tên combo
//                     setNameCombo((prevNames: any) => {
//                         return prevNames.filter(
//                             (name: string) => name !== item.title
//                         );
//                     });

//                     return updatedItem;
//                 }
//                 return item;
//             });
//         });
//     };

//     const columns: TableProps<DataType>["columns"] = [
//         {
//             dataIndex: "image",
//             key: "image",
//             render: (_, record: any) => (
//                 <Image src={record.image} width={140} height={90}></Image>
//             ),
//         },
//         {
//             dataIndex: "title",
//             key: "title",
//             render: (_, record: any) => {
//                 return (
//                     <>
//                         <div>{record.title}</div>
//                         <div>{record.price}</div>
//                     </>
//                 );
//             },
//         },
//         {
//             dataIndex: "description",
//             key: "description",
//         },
//         {
//             dataIndex: "quantity",
//             key: "quantity",
//             render: (_, record) => (
//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "10px",
//                     }}
//                 >
//                     <button
//                         className="btn-change-number number-down"
//                         onClick={() => decreaseQuantity(record.key)}
//                     >
//                         -
//                     </button>
//                     <span>{record.quantity}</span>
//                     <button
//                         className="btn-change-number number-up"
//                         onClick={() => increaseQuantity(record.key)}
//                     >
//                         +
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     const [data, setData] = useState<DataType[]>([
//         {
//             key: "1",
//             image: "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
//             title: "iCombo 2 Big Extra STD",
//             price: 50000,
//             description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
//             quantity: 0,
//         },
//         {
//             key: "2",
//             image: "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
//             title: "iCombo 3 Big Extra STD",
//             price: 100000,
//             description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
//             quantity: 0,
//         },
//         {
//             key: "3",
//             image: "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
//             title: "iCombo 4 Big Extra STD",
//             price: 150000,
//             description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
//             quantity: 0,
//         },
//         {
//             key: "4",
//             image: "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
//             title: "iCombo 5 Big Extra STD",
//             price: 200000,
//             description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
//             quantity: 0,
//         },
//     ]);
//     return (
//         <div className={` ${className}`}>
//             <h2 className="title-offer">Combo Ưu đãi</h2>
//             <Table<DataType>
//                 columns={columns}
//                 dataSource={data}
//                 pagination={false}
//                 showHeader={false}
//             />
//             ;
//         </div>
//     );
// };

// export default ComboFood;
