import React, { useState } from "react";
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const AddShowtimes: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState("Content of the modal");

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setModalText("The modal will be closed after two seconds");
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log("Clicked cancel button");
        setOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                <PlusCircleOutlined />
                Tạo lịch chiếu
            </Button>
            <Modal
                title="Thêm lịch chiếu"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Form
                    // form={form}
                    name="film-edit-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    // onFinish={onFinish}
                >
                    <Form.Item
                        label="Phim chiếu"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập phim chiếu",
                            },
                            {
                                type: "string",
                                min: 3,
                                message: "Phim phải có ít nhất 6 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên phim" />
                    </Form.Item>
                    <Form.Item
                        name="release_date"
                        label="Ngày phát hành"
                        rules={[
                            {
                                required: true,
                                message: "Thêm ngày phát hành",
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
                    </Form.Item>
                    <Form.Item
                        name="release_date"
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
