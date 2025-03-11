import { Image, Table, TableProps } from "antd";
import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./ComboFood.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_COMBOS } from "../../../config/ApiConfig";
import { useMessageContext } from "../../UseContext/ContextState";
interface DataType {
    key: string;
    image: string;
    title: string;
    price: string;
    description: string;
    quantity: number;
}
const ComboFood = ({ className }: any) => {
    const {
        quantityCombo,
        setQuantityCombo,
        totalComboPrice,
        setTotalComboPrice,
        quantityMap,
        setQuantityMap,
        setNameCombo,
    } = useMessageContext();

    // Hàm tăng số lượng
    const increaseQuantity = (key: string, price: string, record: any) => {
        console.log("check-record", record);

        setQuantityMap((prev: any) => {
            const newQuantity = (prev[key] || 0) + 1;

            // Cập nhật tổng số lượng combo
            setQuantityCombo((prevTotal: any) => prevTotal + 1);

            // Cập nhật tổng giá tiền combo
            setTotalComboPrice(
                (prev: string) => parseInt(prev) + parseInt(price)
            );

            // Cập nhật danh sách tên combo
            setNameCombo((prevNames: any[]) => {
                if (!Array.isArray(prevNames)) prevNames = []; // Đảm bảo prevNames là mảng

                const exists = prevNames.find(
                    (combo) => combo.name === record.name
                );

                if (exists) {
                    // Nếu combo đã tồn tại, cập nhật quantity
                    return prevNames.map((combo) =>
                        combo.name === record.name
                            ? {
                                  name: record.name,
                                  price: parseInt(record.price),
                                  defaultQuantityCombo: newQuantity,
                              }
                            : combo
                    );
                } else {
                    // Nếu combo chưa có, thêm mới với quantity = 1
                    return [
                        ...prevNames,
                        {
                            name: record.name,
                            defaultQuantityCombo: 1,
                            price: parseInt(record.price),
                        },
                    ];
                }
            });

            return { ...prev, [key]: newQuantity };
        });
    };

    // Hàm giảm số lượng
    const decreaseQuantity = (key: string, price: string, record: any) => {
        setQuantityMap((prev: any) => {
            if (!prev[key] || prev[key] <= 0) return prev;

            const newQuantity = prev[key] - 1;

            // Cập nhật tổng số lượng combo
            setQuantityCombo((prevTotal: any) => Math.max(prevTotal - 1, 0));

            // Cập nhật tổng giá tiền combo
            setTotalComboPrice((prevPrice: any) =>
                Math.max(parseInt(prevPrice) - parseInt(price), 0)
            );

            // Cập nhật danh sách tên combo
            setNameCombo((prevNames: any[]) => {
                return prevNames
                    .map((combo) =>
                        combo.name === record.name
                            ? {
                                  name: record.name,
                                  price: parseInt(record.price),
                                  defaultQuantityCombo: newQuantity,
                              }
                            : combo
                    )
                    .filter((combo) => combo.defaultQuantityCombo > 0); // Loại bỏ combo có số lượng = 0
            });

            return { ...prev, [key]: newQuantity };
        });
    };

    // useEffect(() => {
    //     console.log("total-check", totalComboPrice); // ✅ Chỉ log sau khi state thực sự cập nhật
    // }, [totalComboPrice]);

    const columns: TableProps<DataType>["columns"] = [
        {
            dataIndex: "image",
            key: "image",
            render: (_, record: any) => (
                <Image src={record.image} width={140} height={90}></Image>
            ),
        },
        {
            dataIndex: "name",
            key: "name",
            render: (_, record: any) => {
                return (
                    <>
                        <div>{record.name}</div>
                        <div>{`${parseInt(record.price)} đ`}</div>
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
                        className={clsx(
                            styles.btnChangeNumber,
                            styles.numberDown
                        )}
                        onClick={() =>
                            decreaseQuantity(record.key, record.price, record)
                        }
                    >
                        -
                    </button>
                    {/* {debugger} */}
                    <span>{quantityMap[record.key] || 0}</span>
                    <button
                        className={clsx(
                            styles.btnChangeNumber,
                            styles.numberUp
                        )}
                        onClick={() =>
                            increaseQuantity(record.key, record.price, record)
                        }
                    >
                        +
                    </button>
                </div>
            ),
        },
    ];

    const { data: optionsCombos } = useQuery({
        queryKey: ["optionsCombos"],
        queryFn: async () => {
            const { data } = await axios.get(GET_COMBOS);
            return data.combos.map((record: any) => ({
                ...record,
                key: record.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });
    return (
        <div className={clsx(className)}>
            <h2 className={clsx(styles.titleOffer)}>Combo Ưu đãi</h2>
            <Table<DataType>
                columns={columns}
                dataSource={optionsCombos}
                pagination={false}
                showHeader={false}
            />
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
