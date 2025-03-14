import { useState } from "react";
import { Button, Form, Input, InputNumber, message, Modal } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { EditOutlined } from "@ant-design/icons";
import { UPDATE_ACTOR } from "../../../config/ApiConfig";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";

const EditActor = ({ id }: any) => {
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const onFinish = (formData: any) => {
        mutate(formData, {
            onError: (error: any) => {
                messageApi.error(
                    error?.response?.data?.message || "Thêm thất bại"
                );
            },
        });
    };
    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setOpen(false);
        formShowtime.submit();
    };

    const handleCancel = () => {
        formShowtime.resetFields();
        setOpen(false);
    };

    const { data } = useQuery({
        queryKey: ["Actors", id],
        queryFn: async () => {
            const { data } = await axios.get(UPDATE_ACTOR(id));
            return data;
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.put(UPDATE_ACTOR(id), formData);
        },
        onSuccess: () => {
            formShowtime.resetFields();
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({
                queryKey: ["Actors"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message);
        },
    });

    return (
        <>
            <Button type="primary" onClick={showModal}>
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title={`Cập nhật diễn viên `}
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                {contextHolder}
                <Form
                    form={formShowtime}
                    name="actor-edit-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    initialValues={data}
                >
                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="Tên đạo diễn"
                        name="name_actor"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên",
                            },
                            {
                                min: 3,
                                message: "Tên đạo diễn phải có ít nhất 3 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên đạo diễn" />
                    </Form.Item>

                    <Form.Item
                        className={clsx(styles.inputLabel)}
                        label="ID"
                        name="id"
                        rules={[
                            {
                                required: true,
                                message: "Phải có ID",
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập id"
                            disabled
                        ></InputNumber>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default EditActor;
