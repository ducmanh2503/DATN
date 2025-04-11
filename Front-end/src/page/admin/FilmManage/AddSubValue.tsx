import { Button, Col, Collapse, Form, Image, message, Row, Space } from "antd";
import React, { useState } from "react";
import AddActor from "../Actors/AddActors";
import AddDirector from "../Directors/AddDirector";
import AddGenre from "../Genres/AddGenre";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { VerticalAlignTopOutlined } from "@ant-design/icons";
import {
    useCreateFilm,
    useCreateFilmWithExcel,
} from "../../../services/adminServices/filmManage.service";

const AddSubValue = ({
    selectedFile,
    setSelectedFile,
    preview,
    setPreview,
}: any) => {
    const [formExcel] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [activeKey, setActiveKey] = useState<string | string[]>("");
    const [activeKey2, setActiveKey2] = useState<string | string[]>("");

    const onFinish = (formData: FormData) => {
        createFilm(formData);
        formExcel.resetFields();
    };

    const { mutate: createFilm } = useCreateFilmWithExcel({
        form: formExcel,
        messageApi,
        setSelectedFile,
        setPreview,
    });

    const items = [
        {
            key: "1",
            label: "Thêm mới Diễn viên, Đạo diễn, Thể loại",
            children: (
                <div className={clsx(styles.addSubValue)}>
                    <AddActor />
                    <AddDirector />
                    <AddGenre />
                </div>
            ),
        },
    ];

    const onChangeActiveCollapse = (key: string | string[]) => {
        setActiveKey(key);
    };

    const items2 = [
        {
            key: "1",
            label: "THÊM MỚI PHIM VỚI EXCEL",
            children: (
                <>
                    <Form
                        form={formExcel}
                        name="add-film-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    className={clsx(styles.inputLabel)}
                                    label="Poster"
                                    name="poster"
                                >
                                    <Space.Compact>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="uploadFile"
                                            // onChange={handleChangeImage}
                                            style={{ display: "none" }}
                                        />
                                        <label
                                            htmlFor="uploadFile"
                                            className={clsx(styles.addImage)}
                                        >
                                            <VerticalAlignTopOutlined /> Thêm
                                            ảnh
                                        </label>
                                        {selectedFile && (
                                            <Image
                                                src={preview}
                                                alt="poster"
                                                style={{
                                                    marginTop: "8px",
                                                    objectFit: "cover",
                                                }}
                                                width={180}
                                                height={220}
                                            />
                                        )}
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="File Excel"
                                    name="excel_file"
                                    valuePropName="file"
                                    getValueFromEvent={(e) => {
                                        return e?.target?.files?.[0];
                                    }}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn file Excel",
                                        },
                                    ]}
                                >
                                    <input type="file" accept=".xlsx,.xls" />
                                </Form.Item>
                            </Col>
                            <Button htmlType="submit" type="primary">
                                Thêm
                            </Button>
                        </Row>
                    </Form>
                </>
            ),
        },
    ];

    const onChangeActiveCollapse2 = (key: string | string[]) => {
        setActiveKey2(key);
    };

    return (
        <div>
            {contextHolder}
            <Collapse
                className={clsx(styles.collapse)}
                activeKey={activeKey}
                onChange={onChangeActiveCollapse}
                ghost
                items={items}
            />
            <hr />
            <Collapse
                className={clsx(styles.collapse2)}
                activeKey={activeKey2}
                onChange={onChangeActiveCollapse2}
                ghost
                items={items2}
            ></Collapse>
        </div>
    );
};

export default AddSubValue;
