import { Button, Form, Input, Modal, Select, Skeleton } from "antd";
import React, { useEffect, useMemo } from "react";
import { useDetailRoom } from "../../../services/adminServices/roomManage.service";

const { Option } = Select;

const RoomForm = ({
    editingRoom,
    id,
    open,
    onSubmit,
    onClose,
    roomTypes,
    loading,
    roomsTypeList,
}: any) => {
    const [form] = Form.useForm();

    // Gọi API lấy dữ liệu chi tiết phòng khi `open` thay đổi
    const { data: detailRoom, isLoading } = useDetailRoom(id, open);

    // Cập nhật form khi dữ liệu phòng thay đổi
    useEffect(() => {
        if (detailRoom && id) {
            form.setFieldsValue({
                name: detailRoom.name,
                room_type_id: detailRoom.room_type_id,
            });
        }
    }, [detailRoom, id]);

    const roomOptions = useMemo(() => {
        return roomsTypeList.map((type: any) => (
            <Option key={type.id} value={type.id}>
                {type.name}
            </Option>
        ));
    }, [roomsTypeList]);

    const handleFinish = (values: any) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Modal
            title={editingRoom ? "Cập nhật phòng" : "Thêm phòng mới"}
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Skeleton loading={isLoading} active>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                        label="Tên phòng"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên phòng!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên phòng" />
                    </Form.Item>

                    <Form.Item
                        label="Loại phòng"
                        name="room_type_id"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại phòng!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại phòng">
                            {roomOptions}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ marginRight: 8 }}
                        >
                            {editingRoom ? "Cập nhật" : "Thêm mới"}
                        </Button>
                        <Button onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Skeleton>
        </Modal>
    );
};

export default RoomForm;
