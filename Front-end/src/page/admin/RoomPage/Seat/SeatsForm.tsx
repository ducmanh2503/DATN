import { Button, Form, Input, message, Modal, Select, Space } from "antd";
import { useAdminContext } from "../../../../AdminComponents/UseContextAdmin/adminContext";
import {
    useDeleteOneSeat,
    useOptionSeats,
} from "../../../../services/adminServices/seatManage.service";
import { useEffect } from "react";

const SeatsForm = ({
    isEditing,
    onDelete,
    handleOk,
    isModalOpen,
    handleCancel,
    seatData,
}: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const { rowSeats } = useAdminContext();

    const { data: OptionSeats } = useOptionSeats(); // danh sách các loại ghế

    // gán chi tiết ghế vào form
    useEffect(() => {
        console.log(seatData);

        if (seatData) {
            form.setFieldsValue({
                row: seatData.row,
                column: seatData.col,
                seat_type_id: seatData.type,
            });
        }
    }, [seatData, form]);

    // Hook xóa ghế
    const { mutate: deleteOneSeat } = useDeleteOneSeat(messageApi);
    // Hàm xử lý xóa ghế
    const handleDelete = () => {
        if (!seatData?.id) return;

        deleteOneSeat(seatData.id, {
            onSuccess: () => {
                handleOk(); // Đóng modal sau khi xóa thành công
            },
        });
    };
    return (
        <>
            {contextHolder}
            <Modal
                title={!isEditing && !onDelete ? `Thêm ghế` : `Cập nhật ghế`}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    // onFinish={handleSingleSubmit}
                >
                    <Form.Item name="room_id" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="seat_status"
                        hidden
                        initialValue="available"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="row"
                        label="Hàng"
                        rules={[
                            { required: true, message: "Vui lòng chọn hàng!" },
                        ]}
                    >
                        <Select placeholder="Chọn hàng" disabled={isEditing}>
                            {rowSeats.map((row: string) => (
                                <Select.Option key={row} value={row}>
                                    {row}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="column"
                        label="Cột"
                        rules={[
                            { required: true, message: "Vui lòng nhập cột!" },
                        ]}
                    >
                        <Input
                            disabled={isEditing}
                            placeholder="Nhập số cột (1, 2, ...)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="seat_type_id"
                        label="Loại Ghế"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại ghế!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại ghế">
                            {OptionSeats?.map((option: any) => (
                                <Select.Option
                                    key={option.id}
                                    value={option.name}
                                >
                                    {option.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    background: "var(--backgroud-product)",
                                    color: "var(--word-color)",
                                }}
                            >
                                {isEditing ? "Cập Nhật" : "Thêm Ghế"}
                            </Button>

                            {isEditing && onDelete && (
                                <>
                                    <Button
                                        type="primary"
                                        danger
                                        onClick={handleDelete}
                                    >
                                        Xóa Ghế
                                    </Button>
                                    <Button danger>Ẩn ghế</Button>
                                </>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SeatsForm;
