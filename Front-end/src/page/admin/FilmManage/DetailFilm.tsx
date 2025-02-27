import { useQuery } from "@tanstack/react-query";
import {
    Button,
    Col,
    Drawer,
    DrawerProps,
    Form,
    Image,
    Input,
    Row,
} from "antd";
import axios from "axios";
import { useEffect, useState, memo } from "react";
import "./DetailFilm.css";
import { URL_IMAGE } from "../../../config/ApiConfig";

const DetailFilm = ({ id, film, apiUrl }: any) => {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<DrawerProps["size"]>();
    const [poster, setPoster] = useState("");
    const [form] = Form.useForm();

    const onClose = () => {
        setOpen(false);
    };
    const showLargeDrawer = () => {
        setSize("large");
        setOpen(true);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["film", id],
        queryFn: async () => {
            const { data } = await axios.get(apiUrl);
            console.log("re-render-detail-film");
            console.log("checkk-data", data);

            return data.data;
        },
        enabled: open && !!id,
    });
    useEffect(() => {
        if (data && open) {
            form.setFieldsValue({
                ...data,
                directors: data.directors?.name_director || "không có",
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

            setPoster(data.poster || "");
        }
    }, [data, open]);

    return (
        <div>
            <a onClick={showLargeDrawer}>{film}</a>
            <Drawer
                title={`Chi tiết phim ${film}`}
                className="custom-drawer-title"
                placement="right"
                size={size}
                onClose={onClose}
                open={open}
                extra={
                    <Button type="primary" onClick={onClose}>
                        OK
                    </Button>
                }
            >
                <Form
                    name="detail-film-form"
                    layout="vertical"
                    form={form}
                    initialValues={data}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="title"
                                label="Tên phim:"
                            >
                                <Input className="input-detail" disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="trailer"
                                label="Trailer:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="poster"
                                label="Poster:"
                            >
                                {poster && (
                                    <Image
                                        className="imagePreview"
                                        src={`${URL_IMAGE}${poster}`}
                                        alt="poster"
                                        width={160}
                                        height={240}
                                    ></Image>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="actors"
                                label="Diễn viên:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="movie_status"
                                label="Trạng thái:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="directors"
                                label="Đạo diễn:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="release_date"
                                label="Ngày phát hành: "
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="running_time"
                                label="Thời lượng:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="rated"
                                label="Đánh giá:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="language"
                                label="Ngôn ngữ:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="id"
                                label="ID:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                className="input-label"
                                name="genres"
                                label="Thể loại:"
                            >
                                <Input
                                    className="input-detail"
                                    disabled
                                ></Input>
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
                                <Input.TextArea
                                    className="input-detail"
                                    disabled
                                    rows={4}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
};

export default memo(DetailFilm);
