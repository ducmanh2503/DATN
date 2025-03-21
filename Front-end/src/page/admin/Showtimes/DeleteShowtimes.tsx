import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Popconfirm } from "antd";
import axios from "axios";
import { DELETE_ONE_SHOWTIMES } from "../../../config/ApiConfig";

const DeleteShowtimes = ({ id, selectedDate, setShowtimesData }: any) => {
    const [messageApi, contextHolder] = message.useMessage();

    const { mutate } = useMutation({
        mutationFn: async () => {
            await axios.delete(DELETE_ONE_SHOWTIMES(id, selectedDate));
        },
        onSuccess: () => {
            setShowtimesData((prevData: any) =>
                prevData.filter((item: any) => item.id !== id)
            );
            messageApi.success("Xóa suất chiếu thành công");
        },
        onError: () => {
            messageApi.error("Lỗi: Không thể xóa suất chiếu");
        },
    });
    return (
        <>
            {contextHolder}
            <Popconfirm
                title="Xóa phim này?"
                description="Bạn có chắc chắn muốn xóa không?"
                okText="Yes"
                onConfirm={() => mutate(id)}
                cancelText="No"
            >
                <Button type="primary" danger>
                    <DeleteOutlined /> Xóa
                </Button>
            </Popconfirm>
        </>
    );
};

export default DeleteShowtimes;
