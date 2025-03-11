import { Image, Table, TableProps } from "antd";
import { useState } from "react";
import { useMessageContext } from "../../UseContext/ContextState";
import clsx from "clsx";
import styles from "./ComboFood.module.css";
interface DataType {
  key: string;
  image: string;
  title: string;
  price: number;
  description: string;
  quantity: number;
}
const ComboFood = ({ className }: any) => {
  const { setQuantityCombo, setNameCombo, setTotalComboPrice } =
    useMessageContext();

  // Hàm tăng số lượng
  const increaseQuantity = (key: string) => {
    setData((prevData) => {
      return prevData.map((item) => {
        if (item.key === key) {
          const updatedItem = {
            ...item,
            quantity: item.quantity + 1,
          };

          // Cập nhật tổng số lượng combo
          setQuantityCombo((prev: number) => prev + 1);

          // Cập nhật tổng giá tiền combo
          setTotalComboPrice((prev: number) => prev + item.price);

          // Cập nhật danh sách tên combo
          setNameCombo((prevNames: any[]) => {
            if (!Array.isArray(prevNames)) prevNames = []; // Đảm bảo prevNames là mảng

            const exists = prevNames.find(
              (combo) => combo.title === item.title
            );

            if (exists) {
              // Nếu combo đã tồn tại, cập nhật quantity
              return prevNames.map((combo) =>
                combo.title === item.title
                  ? { ...combo, quantity: combo.quantity + 1 }
                  : combo
              );
            } else {
              // Nếu combo chưa có, thêm mới với quantity = 1
              return [
                ...prevNames,
                {
                  title: item.title,
                  quantity: 1,
                  price: item.price,
                },
              ];
            }
          });

          return updatedItem;
        }
        return item;
      });
    });
  };

  // Hàm giảm số lượng
  const decreaseQuantity = (key: string) => {
    setData((prevData) => {
      return prevData.map((item) => {
        if (item.key === key && item.quantity > 0) {
          const updatedItem = {
            ...item,
            quantity: item.quantity - 1,
          };

          // Cập nhật tổng số lượng combo
          setQuantityCombo((prev: number) => Math.max(prev - 1, 0));

          // Cập nhật tổng giá tiền combo
          setTotalComboPrice((prev: number) => Math.max(prev - item.price, 0));

          // Cập nhật danh sách tên combo
          setNameCombo((prevNames: any[]) => {
            return prevNames
              .map((combo) =>
                combo.title === item.title
                  ? { ...combo, quantity: combo.quantity - 1 }
                  : combo
              )
              .filter((combo) => combo.quantity > 0); // Loại bỏ combo có số lượng = 0
          });

          return updatedItem;
        }
        return item;
      });
    });
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      dataIndex: "image",
      key: "image",
      render: (_, record: any) => (
        <Image src={record.image} width={140} height={90}></Image>
      ),
    },
    {
      dataIndex: "title",
      key: "title",
      render: (_, record: any) => {
        return (
          <>
            <div>{record.title}</div>
            <div>{record.price}</div>
          </>
        );
      },
    },
    {
      dataIndex: "description",
      key: "description",
    },
    {
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            className={clsx(styles.btnChangeNumber, styles.numberDown)}
            onClick={() => decreaseQuantity(record.key)}
          >
            -
          </button>
          <span>{record.quantity}</span>
          <button
            className={clsx(styles.btnChangeNumber, styles.numberUp)}
            onClick={() => increaseQuantity(record.key)}
          >
            +
          </button>
        </div>
      ),
    },
  ];

  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      image:
        "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
      title: "iCombo 2 Big Extra STD",
      price: 50000,
      description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
      quantity: 0,
    },
    {
      key: "2",
      image:
        "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
      title: "iCombo 3 Big Extra STD",
      price: 100000,
      description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
      quantity: 0,
    },
    {
      key: "3",
      image:
        "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
      title: "iCombo 4 Big Extra STD",
      price: 150000,
      description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
      quantity: 0,
    },
    {
      key: "4",
      image:
        "https://cdn.galaxycine.vn/media/2024/3/29/menuboard-coonline-2024-combo1-min_1711699834430.jpg",
      title: "iCombo 5 Big Extra STD",
      price: 200000,
      description: "1 Ly nước ngọt size L + 01 Hộp bắp + 1 Snack",
      quantity: 0,
    },
  ]);
  return (
    <div className={clsx(className)}>
      <h2 className={clsx(styles.titleOffer)}>Combo Ưu đãi</h2>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={false}
        showHeader={false}
      />
      ;
    </div>
  );
};

export default ComboFood;
