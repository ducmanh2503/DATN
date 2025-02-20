import React, { useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    InputNumber,
    message,
    Modal,
    Select,
    TimePicker,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST } from "../../../config/ApiConfig";

const AddShowtimes: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [formShowtime] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        formShowtime.resetFields();
        setOpen(false);
    };

    const { data } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_LIST}`);
            console.log("re-render-takeNameFilm", data);
            return data.now_showing.data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.post(`http://localhost:8000/api/showTime`, formData);
        },
        onSuccess: () => {
            formShowtime.resetFields();
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({
                queryKey: ["showtimesFilm"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message);
        },
    });
    const onFinish = (formData: any) => {
        console.log("re-render-addShowtimes", formData);
        mutate(formData);
        formShowtime.resetFields();
        setOpen(false);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={showModal}
                style={{ marginBottom: "15px" }}
            >
                <PlusCircleOutlined />
                Tạo lịch chiếu
            </Button>
            <Modal
                title="Thêm lịch chiếu"
                open={open}
                onOk={() => formShowtime.submit()}
                onCancel={handleCancel}
            >
                {contextHolder}
                <Form
                    form={formShowtime}
                    name="showtimes-add-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="movie_id"
                        name="movie_id"
                        // style={{ display: "none" }}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="room_id"
                        name="room_id"
                        // style={{ display: "none" }}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="Phim chiếu"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập phim chiếu",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phim"
                            onChange={(value) => {
                                const selectedFilm = data?.find(
                                    (film: any) => film.title === value
                                );
                                formShowtime.setFieldsValue({
                                    show_date: selectedFilm?.release_date
                                        ? dayjs(selectedFilm.release_date)
                                        : null,
                                });
                            }}
                        >
                            {data?.map((film: any) => (
                                <Select.Option key={film.id} value={film.title}>
                                    {film.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="show_date"
                        label="Ngày bắt đầu"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày phát hành",
                            },
                        ]}
                        getValueFromEvent={(e: any) => e?.format("YYYY-MM-DD")}
                        getValueProps={(e: string) => ({
                            value: e ? dayjs(e) : null,
                        })}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item>
                    {/* <Form.Item
                        name=""
                        label="Ngày kết thúc"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày kết thúc",
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item> */}

                    <Form.Item name="show_time" label="Ngày kết thúc">
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
            </Modal>
        </>
    );
};

export default AddShowtimes;
