import React, { useState } from "react";
import { Button, DatePicker, Form, Select, Divider, message, Spin } from "antd";
import { FieldType } from "../../../types/interface";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GET_ONE_SHOWTIMES } from "../../../config/ApiConfig";
import ShowtimesRoom1 from "./ShowtimesRoom1";
import ShowtimesRoom2 from "./ShowtimesRoom2";
import ShowtimesRoom3 from "./ShowtimesRoom3";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import AddShowtimes from "./AddShowtimes";

const contentStyle: React.CSSProperties = {
    paddingTop: 100,
};

const content = <div style={contentStyle} />;

const ShowtimesManage: React.FC = () => {
    const [form] = useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showtimesData, setShowtimesData] = useState<any[]>([]);
    const [isSearched, setIsSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchedDate, setSearchedDate] = useState<string | null>(null);

    const handleRoomChange = (value: string) => {
        setSelectedRoom(value);
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const formattedDate = date.format("YYYY-MM-DD");
            setSelectedDate(formattedDate);
        } else {
            setSelectedDate(null);
        }
    };

    const onFinish = (formData: any) => {
        setIsSearched(true);
        setSearchedDate(selectedDate);
        mutate(formData);
    };

    const { mutate } = useMutation({
        mutationFn: async (formData: any) => {
            setIsLoading(true);
            const newFormData = {
                ...formData,
                show_date: formData.show_date
                    ? dayjs(formData.show_date).format("YYYY/MM/DD")
                    : null,
            };

            try {
                const response = await axios.post(
                    GET_ONE_SHOWTIMES,
                    newFormData
                );
                console.log(response.data);

                setShowtimesData(response.data || []);
            } catch (error: any) {
                messageApi.error(
                    error?.response?.data?.message || "Có lỗi xảy ra!"
                );
                setShowtimesData([]);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error: any) => {
            setIsLoading(false);
            messageApi.error(
                error?.response?.data?.message || "Có lỗi xảy ra!"
            );
        },
    });

    return (
        <>
            <div className="flex mb-4">
                <Form
                    name="basic"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="inline"
                    form={form}
                >
                    <Form.Item<FieldType>
                        label="Phòng chiếu:"
                        name="room_id"
                        rules={[
                            {
                                required: true,
                                message: "Thêm phòng chiếu",
                            },
                        ]}
                    >
                        <Select
                            placeholder={"phòng chiếu"}
                            style={{ width: 120 }}
                            onChange={handleRoomChange}
                            options={[
                                { value: "1", label: "Phòng số 1" },
                                { value: "2", label: "Phòng số 2" },
                                { value: "3", label: "Phòng số 3" },
                            ]}
                        ></Select>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Ngày chiếu:"
                        name="show_date"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày chiếu",
                            },
                        ]}
                    >
                        <DatePicker onChange={handleDateChange}></DatePicker>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Tìm kiếm
                        </Button>
                    </Form.Item>
                </Form>
                <AddShowtimes
                    selectedDate={selectedDate}
                    setShowtimesData={setShowtimesData}
                ></AddShowtimes>
            </div>
            <Divider variant="solid" style={{ borderColor: "#7cb305" }}>
                {isSearched
                    ? `Lịch chiếu ngày: ${searchedDate}`
                    : "Lịch chiếu ngày: "}
            </Divider>

            {isLoading ? (
                <Spin tip="Loading">{content}</Spin>
            ) : showtimesData.length > 0 ? (
                selectedRoom === "1" ? (
                    <ShowtimesRoom1
                        data={showtimesData}
                        selectedDate={selectedDate}
                    />
                ) : selectedRoom === "2" ? (
                    <ShowtimesRoom2
                        data={showtimesData}
                        selectedDate={selectedDate}
                    />
                ) : selectedRoom === "3" ? (
                    <ShowtimesRoom3
                        data={showtimesData}
                        selectedDate={selectedDate}
                    />
                ) : null
            ) : isSearched ? (
                <p
                    style={{
                        padding: "8px",
                        border: "1px solid red",
                        borderRadius: "6px",
                        textAlign: "center",
                        color: "red",
                        fontWeight: 500,
                    }}
                >
                    {`Chưa có suất chiếu nào ngày ${selectedDate} phòng chiếu ${selectedRoom}`}
                </p>
            ) : null}
        </>
    );
};

export default ShowtimesManage;
