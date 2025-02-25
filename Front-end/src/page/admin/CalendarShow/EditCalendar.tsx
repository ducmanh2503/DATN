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
} from "antd";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { EditOutlined } from "@ant-design/icons";
import { DETAIL_CALENDAR, UPDATE_CALENDAR } from "../../../config/ApiConfig";

const EditCalendar = ({ id }: any) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["showtimesFilm", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_CALENDAR(id));

            console.log("check", data);

            return data;
        },
        enabled: openEdit,
        retry: false,
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            console.log("check api", formData);

            const response = await axios.put(UPDATE_CALENDAR(id), formData);

            return response.data;
        },
        onSuccess: (data) => {
            console.log("checkkk", data);

            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm", id],
            });
            messageApi.success("Cập nhật thành công");
            setOpenEdit(false);
            formShowtime.resetFields();
        },
        onError: (error: any) => {
            messageApi.error(
                error?.response?.data?.message || "Có lỗi xảy ra!"
            );
        },
    });

    useEffect(() => {
        if (data) {
            formShowtime.setFieldsValue({
                movie_id: data.movie_id,
                title: data.movie?.title,
                movie_status: data.movie?.movie_status,
                show_date: dayjs(data.show_date).format("YYYY-MM-DD"),
                end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
            });
        }
        return () => {
            formShowtime.resetFields();
        };
    }, [data, formShowtime, openEdit]);

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
                        <Form.Item label="Phim chiếu" name="title">
                            <Input disabled></Input>
                        </Form.Item>

                        <Form.Item
                            name="show_date"
                            label="Ngày bắt đầu"
                            rules={[
                                {
                                    required: true,
                                    message: "Thêm ngày kết thúc",
                                },
                            ]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
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

                        <Form.Item
                            name="end_date"
                            label="Ngày kết thúc"
                            rules={[
                                {
                                    required: true,
                                    message: "Thêm ngày kết thúc",
                                },
                            ]}
                            getValueProps={(value) => ({
                                value: value ? dayjs(value) : null,
                            })}
                            getValueFromEvent={(e) => e?.format("YYYY-MM-DD")}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                allowClear
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
                            <Select
                                placeholder="Chọn trạng thái"
                                allowClear
                                onChange={(value) =>
                                    formShowtime.setFieldValue(
                                        "movie_status",
                                        value
                                    )
                                }
                                disabled
                            >
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

export default EditCalendar;
