import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
    Button,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Select,
    Tag,
    TimePicker,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    GET_CALENDAR,
    GET_DETAIL_ONE_SHOWTIMES,
    GET_FILM_LIST,
    UPDATE_SHOWTIMES,
} from "../../../config/ApiConfig";

const EditShowtimes = ({ id, selectedDate }: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);

    const onFinish = (formData: any) => {
        const formattedData = {
            ...formData,
            start_time: dayjs(formData.start_time).format("HH:mm"),
            end_time: dayjs(formData.end_time).format("HH:mm"),
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
        // form.setFieldsValue(detailShowtimes);
        setOpen(true);
    };

    const handleOk = () => form.submit();

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    useEffect(() => {
        if (selectedDate && dayjs(selectedDate).isValid()) {
            form.setFieldsValue({ show_time: dayjs(selectedDate) });
        } else {
            console.error("Invalid date:", selectedDate);
        }
    }, [selectedDate, form, open]);

    const { data: detailShowtimes } = useQuery({
        queryKey: ["showtimes", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_DETAIL_ONE_SHOWTIMES(id));
            console.log("check show-time", data);

            return {
                ...data,
                show_time: data.show_time ? dayjs(data.show_time) : undefined, // Chỉ chuyển đổi nếu có giá trị
            };
        },
    });

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

    const { data: idCalendarShow } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            console.log("showtime-data", data);

            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.post(UPDATE_SHOWTIMES, formData);
            return response.data;
        },
    });
    return (
        <div>
            {contextHolder}
            <Button type="primary" onClick={showModal} className="addShowtimes">
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Thêm mới suất chiếu"
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
                    initialValues={detailShowtimes}
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
                        <Select
                            placeholder="Chọn phim"
                            onChange={(value) => {
                                console.log("Phim được chọn:", value);
                                console.log(
                                    "Dữ liệu idCalendarShow:",
                                    idCalendarShow
                                );

                                // Tìm ID lịch chiếu theo ID phim
                                const selectedShow = idCalendarShow?.find(
                                    (show: any) => show.movie_id === value // Đổi thành `movie_id` nếu dữ liệu API trả về dạng này
                                );

                                console.log(
                                    "Lịch chiếu tương ứng:",
                                    selectedShow
                                );

                                // Cập nhật ID vào form
                                form.setFieldsValue({
                                    calendar_show_id: selectedShow
                                        ? selectedShow.id
                                        : "",
                                });
                            }}
                        >
                            {filmList?.map((film: any) => (
                                <Select.Option key={film.id} value={film.id}>
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
                            value={
                                form.getFieldValue("show_time")
                                    ? dayjs(form.getFieldValue("show_time"))
                                    : undefined
                            }
                        />
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
                    <Form.Item label="Thời gian bắt đầu" name="start_time">
                        <TimePicker
                            format="HH:mm"
                            style={{ width: "100%" }}
                            value={
                                form.getFieldValue("start_time")
                                    ? dayjs(
                                          form.getFieldValue("start_time"),
                                          "HH:mm"
                                      )
                                    : undefined
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        className="input-label"
                        label="Thời gian kết thúc"
                        name="end_time"
                        dependencies={["start_time"]}
                        rules={[
                            {
                                required: true,
                                message: "Nhập thời gian kết thúc",
                            },
                        ]}
                    >
                        <TimePicker
                            format="HH:mm"
                            style={{ width: "100%" }}
                            disabledTime={() => {
                                const startTime =
                                    form.getFieldValue("start_time");
                                if (!startTime) return {}; // Nếu chưa chọn start_time, không giới hạn

                                return {
                                    disabledHours: () =>
                                        [...Array(24).keys()].filter(
                                            (h) => h < startTime.hour()
                                        ),
                                    disabledMinutes: (selectedHour) =>
                                        selectedHour === startTime.hour()
                                            ? [...Array(60).keys()].filter(
                                                  (m) => m <= startTime.minute()
                                              )
                                            : [],
                                };
                            }}
                        />
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
                        style={{ display: "none" }}
                        className="input-label"
                        label="ID"
                        name="calendar_show_id"
                        rules={[
                            {
                                required: true,
                                message: "Nhập ID lịch chiếu",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EditShowtimes;
