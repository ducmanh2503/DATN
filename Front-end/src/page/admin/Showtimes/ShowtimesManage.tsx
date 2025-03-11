import React, { useState } from "react";
import { Button, DatePicker, Form, Select, Divider, message, Spin } from "antd";
import { FieldType } from "../../../types/interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_ONE_SHOWTIMES, GET_ROOMS } from "../../../config/ApiConfig";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import AddShowtimes from "./AddShowtimes";
import ShowtimesAllRooms from "./ShowtimesAllRooms";

const contentStyle: React.CSSProperties = {
    paddingTop: 100,
};

const content = <div style={contentStyle} />;

const ShowtimesManage: React.FC = () => {
    const [form] = useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [searchedDate, setSearchedDate] = useState<string | null>(null);
    const [searchedRoom, setSearchedRoom] = useState<string | null>(null);
    const [showtimesData, setShowtimesData] = useState<any[]>([]);
    const [isSearched, setIsSearched] = useState(false);

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
        setSearchedRoom(selectedRoom);
        mutate(formData);
        form.resetFields();
    };

    // hàm tìm suất chiếu
    const { mutate } = useMutation({
        mutationFn: async (formData: any) => {
            setIsLoading(true);
            const newFormData = {
                ...formData,
                date: formData.date
                    ? dayjs(formData.date).format("YYYY/MM/DD")
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

    // hàm lấy danh sách phòng chiếu
    const { data: roomOptions } = useQuery({
        queryKey: ["getRooms"],
        queryFn: async () => {
            const { data } = await axios.get(GET_ROOMS);
            return data.rooms.map((item: any) => ({
                label: item.name,
                value: item.room_type_id,
            }));
        },
        staleTime: 1000 * 60 * 10,
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
                            options={roomOptions || []}
                        ></Select>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Ngày chiếu:"
                        name="date"
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
                    setShowtimesData={setShowtimesData}
                    showtimesData={showtimesData}
                    selectedRoom={selectedRoom}
                ></AddShowtimes>
            </div>
            <Divider variant="solid" style={{ borderColor: "#7cb305" }}>
                {isSearched
                    ? `Lịch chiếu ngày: ${searchedDate}`
                    : "Lịch chiếu ngày: "}
            </Divider>

            {isLoading ? (
                <Spin tip="Loading">{content}</Spin>
            ) : showtimesData?.length ? (
                <ShowtimesAllRooms
                    setShowtimesData={setShowtimesData}
                    showtimesData={showtimesData}
                    selectedDate={selectedDate}
                />
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
                    {`Chưa có suất chiếu nào ngày ${searchedDate} phòng chiếu ${searchedRoom}`}
                </p>
            ) : null}
        </>
    );
};

export default ShowtimesManage;
