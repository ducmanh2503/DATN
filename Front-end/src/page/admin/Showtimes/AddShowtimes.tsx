import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    DatePicker,
    Form,
    TimePicker,
    message,
    Modal,
    Select,
    Tag,
    Input,
} from "antd";
import axios from "axios";
import "../FilmManage/AddFilm.css";
import { GET_FILM_LIST, UPDATE_SHOWTIMES } from "../../../config/ApiConfig";
import { useEffect, useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import "./ShowtimesRoom.css";
import dayjs from "dayjs";

const AddShowtimes = ({ selectedDate, setShowtimesData }: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);

    const onFinish = (formData: any) => {
        const formattedData = {
            ...formData,
            start_time: dayjs(formData.start_time).format("HH:mm:ss"),
            end_time: dayjs(formData.end_time).format("HH:mm:ss"),
            calendar_show_id: Number(formData.calendar_show_id),
        };

        mutate(formattedData, {
            onSuccess: () => {
                messageApi.success("Thêm thành công");
                setShowtimesData(formData);
                form.resetFields();
                setOpen(false);
            },
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

    const handleOk = () => form.submit();

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    useEffect(() => {
        if (selectedDate) {
            form.setFieldsValue({
                show_time: dayjs(selectedDate),
            });
        }
    }, [selectedDate, form]);

    const { data: filmList } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.post(UPDATE_SHOWTIMES, formData);
            return response.data;
        },
    });

    return (
        <>
            {contextHolder}
            <Button type="primary" onClick={showModal} className="addShowtimes">
                <PlusCircleOutlined /> Thêm lịch chiếu
            </Button>
            <Modal
                title="Thêm mới lịch chiếu"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="add-showtimes-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        className="input-label"
                        label="Phòng chiếu"
                        name="room_id"
                        rules={[
                            { required: true, message: "Thêm phòng chiếu" },
                        ]}
                    >
                        <Select placeholder={"phòng chiếu"}>
                            <Select.Option value="1">phòng số 1</Select.Option>
                            <Select.Option value="2">phòng số 2</Select.Option>
                            <Select.Option value="3">phòng số 3</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Phim chiếu"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên phim",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn phim">
                            {filmList?.map((film: any) => (
                                <Select.Option key={film.id} value={film.title}>
                                    {film.title}{" "}
                                    <span>
                                        {film.movie_status === "now_showing" ? (
                                            <Tag color="green">Đang chiếu</Tag>
                                        ) : (
                                            <Tag color="red">Sắp chiếu</Tag>
                                        )}
                                    </span>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Ngày chiếu"
                        name="show_time"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập ngày chiếu",
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            disabled
                        ></DatePicker>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Hình thức chiếu"
                        name="room_type"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập hình thức chiếu",
                            },
                        ]}
                    >
                        <Select placeholder="Hình thức chiếu">
                            <Select.Option value="2D">2D</Select.Option>
                            <Select.Option value="3D">3D</Select.Option>
                            <Select.Option value="4D">4D</Select.Option>
                        </Select>
                    </Form.Item>
                    {/* <Form.Item
                        className="input-label"
                        label="Hình thức dịch"
                        name="id3"
                        rules={[
                            {
                                required: true,
                                message: "hình thức dịch",
                            },
                        ]}
                    >
                        <Select placeholder="Nhập hình thức dịch">
                            <Select.Option value="phiên dịch">
                                phiên dịch
                            </Select.Option>
                            <Select.Option value="phụ đề">phụ đề</Select.Option>
                        </Select>
                    </Form.Item> */}
                    <Form.Item
                        className="input-label"
                        label="Thời gian bắt đầu"
                        name="start_time"
                        rules={[
                            {
                                required: true,
                                message: "Nhập thời gian chiếu",
                            },
                        ]}
                    >
                        <TimePicker
                            format="HH:mm:ss"
                            style={{ width: "100%" }}
                        ></TimePicker>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Thời gian kết thúc"
                        name="end_time"
                        rules={[
                            {
                                required: true,
                                message: "Nhập thời gian chiếu",
                            },
                        ]}
                    >
                        <TimePicker
                            format="HH:mm:ss"
                            style={{ width: "100%" }}
                        ></TimePicker>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="Trạng thái"
                        name="status"
                        rules={[
                            {
                                required: true,
                                message: "Nhập  trạng thái",
                            },
                        ]}
                    >
                        <Select placeholder="Trạng thái">
                            <Select.Option value="coming_soon">
                                Sắp chiếu
                            </Select.Option>
                            <Select.Option value="now_showing">
                                Đang chiếu
                            </Select.Option>
                            <Select.Option value="referenced">
                                Đã chiếu
                            </Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        className="input-label"
                        label="ID"
                        name="calendar_show_id"
                        rules={[
                            {
                                required: true,
                                message: "Nhập thời gian chiếu",
                            },
                        ]}
                    >
                        <Input></Input>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddShowtimes;
