import { Image, Table, TableProps } from "antd";
import clsx from "clsx";
import styles from "./ComboFood.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_COMBOS } from "../../../config/ApiConfig";
import CustomNotification from "../Notification/Notification";
import { useComboContext } from "../../UseContext/CombosContext";
import { useSeatsContext } from "../../UseContext/SeatsContext";

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
        setQuantityCombo,
        quantityCombo,
        setTotalComboPrice,
        quantityMap,
        setQuantityMap,
        setNameCombo,
    } = useComboContext();
    const { quantitySeats } = useSeatsContext(0);
    const { openNotification, contextHolder } = CustomNotification();

    // Hàm tăng số lượng
    const increaseQuantity = (key: string, price: string, record: any) => {
        console.log("check-record", record);
        if (quantityCombo >= quantitySeats) {
            // Hiển thị thông báo khi vượt quá giới hạn với vé
            openNotification({
                description: "Số combo tối đa bằng số vé.",
            });
            return;
        }

        if (quantityCombo >= record.quantity) {
            // Hiển thị thông báo khi vượt quá giới hạn kho
            openNotification({
                description: `Chỉ còn ${record.quantity} sản phẩm, vui lòng chọn nhỏ hơn hoặc bằng`,
            });
            return;
        }

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
            {contextHolder}
            <h2 className={clsx(styles.titleOffer)}>Combo Ưu đãi</h2>
            <Table<DataType>
                columns={columns}
                dataSource={optionsCombos}
                pagination={false}
                showHeader={false}
            />
        </div>
    );
};

export default ComboFood;
