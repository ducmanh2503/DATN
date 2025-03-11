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
import {
    GET_CALENDAR,
    GET_DATES_BY_CALENDAR,
    GET_DETAIL_ONE_SHOWTIMES,
    GET_FILM_LIST,
    GET_ROOMS,
    UPDATE_ONE_SHOWTIMES,
} from "../../../config/ApiConfig";
import { useCallback, useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import "./ShowtimesRoom.css";
import dayjs from "dayjs";

const EditShowtimes = ({ id, setShowtimesData, selectedDate }: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [selectedCalendarShowId, setSelectedCalendarShowId] = useState<
        number | null
    >(null);
    const [filteredFilms, setFilteredFilms] = useState<any[]>([]);
    const queryClient = useQueryClient();
    const [calendarShowId, setCalendarShowId] = useState<number | null>(null);

    const onFinish = async (formData: any) => {
        const formatTimeField = (value: any, format: string) =>
            value ? dayjs(value).format(format) : null;

        const formattedData = {
            ...formData,
            start_time: formatTimeField(formData.start_time, "HH:mm"),
            end_time: formatTimeField(formData.end_time, "HH:mm"),
            selected_date: formatTimeField(
                formData.selected_date,
                "YYYY-MM-DD"
            ),
        };

        mutate(formattedData, {
            onSuccess: async () => {
                messageApi.success("Cập nhật thành công");
                setShowtimesData((prevData: any) =>
                    prevData.map((item: any) =>
                        item.id === id ? { ...item, ...formattedData } : item
                    )
                );

                await queryClient.invalidateQueries({
                    queryKey: ["showtimes", id],
                });

                form.resetFields();
                setOpen(false);
            },
            onError: (error: any) => {
                const errorMessage =
                    JSON.parse(error.request.responseText) || "Có lỗi xảy ra";
                messageApi.error(errorMessage);
            },
        });
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        form.submit();
        setOpen(false);
    };

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const { data: filmList } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            console.log("Danh sách phim:", data);
            // console.log("check-message", data.movies);

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
        staleTime: 1000 * 60 * 10,
    });

    const { data: idCalendarShow } = useQuery({
        queryKey: ["showtimesFilm"],
        queryFn: async () => {
            const { data } = await axios.get(GET_CALENDAR);
            console.log("Danh sách lịch chiếu:", data);
            return data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: open,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    // danh sách thể loại chiếu
    const { data: rooms } = useQuery({
        queryKey: ["Rooms"],
        queryFn: async () => {
            const { data } = await axios.get(GET_ROOMS);
            console.log("lisst - room", data.rooms);
            return data.rooms.map((item: any) => ({
                label: item.room_type,
                value: item.room_type,
            }));
        },
        enabled: open,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const handleChangeSelect = useCallback(
        (value: string[], fieldName: string) => {
            form.setFieldsValue({ [fieldName]: value });
        },
        [form]
    );

    const handleFilmChange = (value: number) => {};

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            const response = await axios.put(
                UPDATE_ONE_SHOWTIMES(id),
                formData
            );
            return response.data;
        },
    });

    const { data: detailShowtimes } = useQuery({
        queryKey: ["showtimes", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_DETAIL_ONE_SHOWTIMES(id));
            console.log("check show-time", data);

            return {
                ...data,
                selected_date: data.selected_date
                    ? dayjs(data.selected_date)
                    : undefined, // Chỉ chuyển đổi nếu có giá trị
            };
        },
        staleTime: 1000 * 60 * 10,
        enabled: open,
    });

    useEffect(() => {
        if (open && detailShowtimes) {
            form.setFieldsValue({
                room_id: detailShowtimes.room_id,
                title: detailShowtimes.calendar_show.movie.title,
                selected_date: selectedDate
                    ? dayjs(selectedDate, "YYYY-MM-DD")
                    : null,
                room_type: detailShowtimes.room.room_type,
                start_time: detailShowtimes.start_time
                    ? dayjs(detailShowtimes.start_time, "HH:mm")
                    : null,
                end_time: detailShowtimes.end_time
                    ? dayjs(detailShowtimes.end_time, "HH:mm")
                    : null,
                status: detailShowtimes.status,
                calendar_show_id: detailShowtimes.calendar_show_id,
            });
        }

        if (detailShowtimes?.calendar_show_id) {
            setCalendarShowId(detailShowtimes.calendar_show_id);
        }
    }, [detailShowtimes, selectedDate, form, open]);

    const { data: datesByCalendar } = useQuery({
        queryKey: ["datesByCalendar", calendarShowId],
        queryFn: async () => {
            if (!calendarShowId) return [];
            const { data } = await axios.post(GET_DATES_BY_CALENDAR, {
                calendar_show_id: calendarShowId,
            });
            console.log("days-by-calendar", data);
            return data.dates;
        },
        enabled: !!calendarShowId, // Chỉ chạy khi có calendarShowId
    });

    // useEffect(() => {
    //     if (!selectedDate || !filmList || !datesByCalendar) return;

    //     // Lọc ra các lịch chiếu có ngày trùng với selectedDate
    //     const filteredDates = datesByCalendar.filter(
    //         (item: any) =>
    //             item.dates === dayjs(selectedDate).format("YYYY-MM-DD")
    //     );

    //     // Lọc danh sách phim dựa trên lịch chiếu đã lọc

    //     const filteredFilms = filmList.filter((film: any) =>
    //         filteredDates.some((calendar: any) => calendar.movie_id === film.id)
    //     );

    //     setFilteredFilms(filteredFilms);
    // }, [selectedDate, filmList, datesByCalendar]);

    return (
        <>
            {contextHolder}
            <Button type="primary" onClick={showModal} className="addShowtimes">
                <EditOutlined /> Cập nhật
            </Button>
            <Modal
                title="Cập nhật suất chiếu"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    name="edit-showtimes-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        style={{ display: "none" }}
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
                                message: "Vui lòng chọn phim",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phim"
                            onChange={handleFilmChange}
                        >
                            {filteredFilms.map((film: any) => (
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
                        name="selected_date"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập ngày chiếu",
                            },
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" disabled />
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
                        <Select
                            disabled
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Please select"
                            onChange={(value) =>
                                handleChangeSelect([value], "room_type")
                            }
                            options={rooms}
                            value={form.getFieldValue("room_type")}
                        />
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
                            format="HH:mm"
                            style={{ width: "100%" }}
                        ></TimePicker>
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
        </>
    );
};

export default EditShowtimes;
