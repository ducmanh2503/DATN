import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Col,
    DatePicker,
    Form,
    Image,
    Input,
    InputNumber,
    message,
    Row,
    Select,
} from "antd";
import axios from "axios";
import { CREATE_FILM, GET_FILM_LIST } from "../../../config/ApiConfig";
import { useState } from "react";
import dayjs from "dayjs";
import "./AddFilm.css";

const AddFilm = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [selectedFile, setSelectedFile] = useState();
    const [preview, setPreview] = useState<string>();
    const [newData, setNewData] = useState([]);

    const onFinish = (formData: any) => {
        console.log(formData);
        mutate(formData);
        form.resetFields();
    };

    const handleChange = (e: any) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        setSelectedFile(e.target.files[0]);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            return data.now_showing.data.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (formData) => {
            await axios.post(`${CREATE_FILM}`, formData);
        },
        onSuccess: () => {
            form.resetFields();
            messageApi.success("Thêm thành công");
            queryClient.invalidateQueries({
                queryKey: ["filmList"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message);
        },
    });
    return (
        <div className="container-addFilm">
            <div className="form-addFilm">
                {contextHolder}
                <h1 className="title-addFilm">Thêm mới phim</h1>
                <Form
                    form={form}
                    name="film-edit-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
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
                            <Form.Item label="Thời lượng" name="running_time">
                                <Input
                                    placeholder="Nhập Thời lượng phim"
                                    style={{ width: "100%" }}
                                />
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
                                        message: "Vui lòng nhập giới hạn tuổi",
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
                                        message: "Vui lòng nhập ID sản phẩm",
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
                    <Button htmlType="submit" type="primary">
                        Thêm
                    </Button>
                </Form>
            </div>
            <div className="list-addFilm">
                {data?.map((film: any) => (
                    <div key={film.key} className="list-product">
                        <img
                            src={film.poster}
                            alt={film.title}
                            className="w-full h-auto rounded-md"
                        />
                        <h2 className="mt-2 text-white text-lg font-semibold">
                            {film.title}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddFilm;
