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
import {
    GET_FILM_DETAIL,
    GET_FILM_LIST,
    UPDATE_FILM,
} from "../../../config/ApiConfig";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./DetailFilm.css";

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
            console.log("re-render-edit-film", data);
            return data.data;
        },
        enabled: openModal,
        onSuccess: (data: any) => {
            form.setFieldsValue({
                ...data,
                directors: data.directors?.name_director ?? "chưa công bố",
            });
            setPoster(data.poster ?? "");
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.put(UPDATE_FILM(id), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
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
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            dataToSend.append(key, value);
        });

        if (selectedFile) {
            dataToSend.append("poster", selectedFile);
        }

        mutate(dataToSend);
    };

    const handleCancel = () => {
        form.resetFields();
        setOpenModal(false);
    };
    const showDrawer = () => {
        setOpenModal(true);
    };

    useEffect(() => {
        if (openModal && data) {
            form.setFieldsValue({
                ...data,
                directors: data.directors?.name_director ?? "chưa công bố",
                actors: Array.isArray(data.actors)
                    ? data.actors
                          .map((actor: any) => actor.name_actor)
                          .join(", ")
                    : "không có",
                genres: Array.isArray(data.genres)
                    ? data.genres
                          .map((genre: any) => genre.name_genre)
                          .join(", ")
                    : "không có",
            });
            setPoster(data.poster ?? "");
        }
    }, [openModal, data, form]);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setSelectedFile(undefined);
            setPreview(undefined);
            return;
        }

        if (!file.type.startsWith("image/")) {
            message.error("Vui lòng chọn tệp hình ảnh (jpg, png, jpeg).");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            message.error("Kích thước ảnh không được vượt quá 2MB.");
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
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
                title="Cập nhật phim "
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
                                    className="input-label"
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
                                <Form.Item
                                    className="input-label"
                                    label="Trailer"
                                    name="trailer"
                                >
                                    <Input placeholder="Nhập tên trailer"></Input>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className="input-label"
                                    label="Poster"
                                    name="poster"
                                >
                                    <Space.Compact>
                                        <input
                                            type="file"
                                            id="uploadFile"
                                            onChange={handleChangeImage}
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor="uploadFile">
                                            Thêm ảnh
                                        </label>
                                        {selectedFile && (
                                            <Image
                                                src={`${GET_FILM_LIST}/${preview}`}
                                                alt="poster"
                                                style={{
                                                    marginTop: "8px",
                                                    objectFit: "cover",
                                                }}
                                                width={160}
                                                height={980}
                                            />
                                        )}
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
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
                                    className="input-label"
                                    label="ID"
                                    name="id"
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
                            <Col span={12}>
                                <Form.Item
                                    className="input-label"
                                    label="Thể loại:"
                                    name="genres"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập thể loại ",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập thể loại" />
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
