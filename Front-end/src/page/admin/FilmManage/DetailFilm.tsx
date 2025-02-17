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
    Select,
} from "antd";
import { Option } from "antd/es/mentions";
import axios from "axios";
import { useEffect, useState } from "react";
import { GET_FILM_DETAIL } from "../../../config/ApiConfig";
import "./DetailFilm.css";

const DetailFilm = ({ id, film }: any) => {
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
            const { data } = await axios.get(`${GET_FILM_DETAIL(id)}`);
            // console.log(data);

            return data.data;
        },
        onSuccess: (data: any) => {
            form.setFieldsValue(data);
            setPoster(data.poster || "");
        },
    });

    useEffect(() => {
        if (data) {
            setPoster(data.poster);
        }
    }, [data]);
    return (
        <div>
            <a onClick={showLargeDrawer}>{film}</a>
            <Drawer
                title={`Chi tiết phim ${film}`}
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
                <Form layout="vertical" form={form} initialValues={data}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="title" label="Tên phim">
                                <Input className="input-detail" disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trailer" label="Trailer">
                                <Input
                                    className="input"
                                    disabled
                                    style={{ width: "100%" }}
                                    addonBefore="http://"
                                    addonAfter=".com"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="poster" label="Poster">
                                {poster && (
                                    <Image
                                        src={poster}
                                        alt="poster"
                                        width={160}
                                        height={240}
                                    ></Image>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="directors" label="Đạo diễn">
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="movie_status" label="Trạng thái">
                                <Select disabled>
                                    <Option value="jack">Đang chiếu</Option>
                                    <Option value="tom">Sắp chiếu</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="actors" label="Diễn viên">
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="release_date"
                                label="Ngày phát hành"
                            >
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="running_time" label="Thời lượng">
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="rated" label="Đánh giá">
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="id" label="ID">
                                <Input disabled></Input>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="description" label="Description">
                                <Input.TextArea disabled rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
};

export default DetailFilm;
