import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Image,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Skeleton,
    Space,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { GET_FILM_DETAIL, UPDATE_FILM } from "../../../config/ApiConfig";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const EditFilm = ({ id }: any) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [poster, setPoster] = useState("");
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState<string>();
    const [openModal, setOpenModal] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["filmList", id],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_DETAIL(id)}`);
            console.log("re-render-edit-film");
            return data.data;
        },
        enabled: openModal,
        onSuccess: (data: any) => {
            form.setFieldsValue(data);
            setPoster(data.poster || "");
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.put(UPDATE_FILM(id), formData);
        },
        onSuccess: () => {
            messageApi.success("Sửa thành công");
            queryClient.invalidateQueries({
                queryKey: ["filmList"],
            });
            form.resetFields();
            setOpenModal(false);
        },
    });

    const handleFinish = (formData: any) => {
        console.log(formData);
        // const formDataNew = formData;
        // formDataNew.append("poster", selectedFile);
        // formDataNew.append("title", formData.title);
        // formDataNew.append("trailer", formData.trailer);
        // formDataNew.append("running_time", formData.running_time);
        // formDataNew.append("release_date", formData.release_date);
        // formDataNew.append("rated", formData.rated);
        // formDataNew.append("movie_status", formData.movie_status);
        // formDataNew.append("language", formData.language);
        mutate(formData, {
            onSuccess: () => {
                form.resetFields();
                setOpenModal(false);
            },
        });
    };

    const handleCancel = () => {
        form.resetFields();
        setOpenModal(false);
    };
    const showDrawer = () => setOpenModal(true);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        if (data && openModal) {
            form.setFieldsValue(data);
            setPoster(data.poster || "");
        }

        const objectUrl = URL.createObjectURL(selectedFile);

        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile, data, openModal]);

    const handleChange = (e: any) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        setSelectedFile(e.target.files[0]);
    };

    if (isLoading) {
        return <Skeleton active></Skeleton>;
    }

    return (
        <div>
            <Button
                type="primary"
                onClick={showDrawer}
                style={{ padding: "6px" }}
            >
                <EditOutlined />
                Cập nhật
            </Button>
            <Drawer
                title="Cập nhật sản phẩm"
                placement="right"
                width={700}
                onClose={handleCancel}
                open={openModal}
                extra={
                    <Space>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" onClick={() => form.submit()}>
                            Lưu
                        </Button>
                    </Space>
                }
            >
                {contextHolder}
                <Skeleton loading={isLoading} active>
                    <Form
                        form={form}
                        name="film-edit-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={handleFinish}
                        initialValues={data}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tiêu đề"
                                    name="title"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập tên phim",
                                        },
                                        {
                                            min: 3,
                                            message:
                                                "Tên phim phải có ít nhất 3 ký tự",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập tên phim" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Trailer" name="trailer">
                                    <Input placeholder="Nhập tên trailer"></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Poster" name="poster">
                                    <input
                                        type="file"
                                        id="uploadFile"
                                        onChange={handleChange}
                                        style={{ display: "none" }}
                                    />
                                    <label htmlFor="uploadFile">Thêm ảnh</label>
                                    {selectedFile && (
                                        <Image
                                            src={preview}
                                            alt="poster"
                                            style={{ marginTop: "8px" }}
                                            width={160}
                                            height={180}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Đạo diễn"
                                    name="directors"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập đạo diễn",
                                        },
                                        {
                                            type: "string",
                                            min: 6,
                                            message:
                                                "Đạo diễn phải có ít nhất 6 ký tự",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Tên đạo diễn"></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
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
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Diễn viên"
                                    name="actors"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập diễn viên",
                                        },
                                        {
                                            type: "string",
                                            min: 6,
                                            message:
                                                "Diễn viên phải có ít nhất 6 ký tự",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập tên diễn viên" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="release_date"
                                    label="Ngày phát hành"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Thêm ngày phát hành",
                                        },
                                    ]}
                                    getValueFromEvent={(e: any) =>
                                        e?.format("YYYY-MM-DD")
                                    }
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
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Thời lượng"
                                    name="running_time"
                                >
                                    <InputNumber placeholder="Nhập Thời lượng phim" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Giới hạn tuổi"
                                    name="rated"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập giới hạn tuổi",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Giới hạn tuổi"></Input>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Ngôn ngữ"
                                    name="language"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập ngôn ngữ",
                                        },
                                        {
                                            type: "string",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Loại ngôn ngữ" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="ID"
                                    name="genre_id"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập ID sản phẩm",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập ID sản phẩm" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    className="input-label"
                                    name="description"
                                    label="Description:"
                                >
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Skeleton>
            </Drawer>
        </div>
    );
};

export default EditFilm;
