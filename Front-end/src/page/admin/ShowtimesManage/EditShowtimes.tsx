import React, { useEffect, useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Select,
    Skeleton,
    TimePicker,
} from "antd";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { EditOutlined } from "@ant-design/icons";

const EditShowtimes = ({ id }: any) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.put(
                `http://localhost:8000/api/showTime/${id}`,
                formData
            );
        },
        onSuccess: (updatedData) => {
            queryClient.setQueryData(["showtimesFilm", id], updatedData);
            messageApi.success("Cập nhật thành công");
            setOpenEdit(false);
            formShowtime.resetFields();
        },

        onError: (error) => {
            messageApi.error(error.message);
        },
    });

    const { data, isLoading } = useQuery({
        queryKey: ["showtimesFilm", id],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/showTime/${id}`
            );

            console.log("check", data);

            return data;
        },
        enabled: openEdit,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            formShowtime.setFieldsValue({
                movie_id: data.movie_id,
                room_id: data.room_id,
                title: data.movie?.title,
                movie_status: data.movie?.movie_status,
                show_date: dayjs(data.show_date),
                show_time: dayjs(data.show_time, "HH:mm:ss"),
            });
        }
        return () => {
            formShowtime.resetFields();
        };
    }, [data, formShowtime]);

    const onFinish = (formData: any) => {
        console.log("re-render-addShowtimes", formData);
        mutate(formData);
        formShowtime.resetFields();
        setOpenEdit(false);
    };
    const showModal = () => {
        setOpenEdit(true);
    };

    const handleCancel = () => {
        formShowtime.resetFields();
        setOpenEdit(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Thêm lịch chiếu"
                open={openEdit}
                onOk={() => formShowtime.submit()}
                onCancel={handleCancel}
                destroyOnClose
            >
                {contextHolder}
                <Skeleton loading={isLoading} active>
                    <Form
                        form={formShowtime}
                        name="showtimes-edit-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                        initialValues={data}
                    >
                        <Form.Item
                            label="movie_id"
                            name="movie_id"
                            style={{ display: "none" }}
                        >
                            <InputNumber disabled />
                        </Form.Item>
                        <Form.Item
                            label="room_id"
                            name="room_id"
                            style={{ display: "none" }}
                        >
                            <InputNumber disabled />
                        </Form.Item>
                        <Form.Item label="Phim chiếu" name="title">
                            <Input disabled></Input>
                        </Form.Item>

                        <Form.Item
                            name="show_date"
                            label="Ngày bắt đầu"
                            rules={[
                                {
                                    required: true,
                                    message: "Thêm ngày phát hành",
                                },
                            ]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null, // Chuyển đổi sang `dayjs`
                            })}
                            getValueFromEvent={(e) => e?.format("YYYY-MM-DD")}
                        >
                            <DatePicker
                                disabled
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                allowClear
                            />
                        </Form.Item>

                        {/* <Form.Item
                        name="show_time"
                        label="Ngày kết thúc"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày kết thúc",
                            },
                        ]}
                        getValueFromEvent={(e: any) => e?.format("YYYY-MM-DD")}
                        getValueProps={(e: string) => ({
                            value: e ? dayjs(e) : "",
                        })}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item> */}

                        <Form.Item
                            name="show_time"
                            label="Giờ chiếu"
                            getValueProps={(value) => ({
                                value: value ? dayjs(value, "HH:mm:ss") : null,
                            })}
                            getValueFromEvent={(e) => e?.format("HH:mm:ss")}
                        >
                            <TimePicker
                                format="HH:mm:ss"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="movie_status"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập trạng thái",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn trạng thái">
                                <Select.Option value="now_showing">
                                    Đang chiếu
                                </Select.Option>
                                <Select.Option value="coming_soon">
                                    Sắp chiếu
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Skeleton>
            </Modal>
        </>
    );
};

export default EditShowtimes;
