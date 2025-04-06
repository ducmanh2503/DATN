import { Col, Collapse, Form, Image, Row, Space } from "antd";
import React, { useState } from "react";
import AddActor from "../Actors/AddActors";
import AddDirector from "../Directors/AddDirector";
import AddGenre from "../Genres/AddGenre";
import clsx from "clsx";
import styles from "../globalAdmin.module.css";
import { VerticalAlignTopOutlined } from "@ant-design/icons";

const AddSubValue = ({ selectedFile, preview }: any) => {
    const [formExcel] = Form.useForm();
    const [activeKey, setActiveKey] = useState<string | string[]>("");
    const [activeKey2, setActiveKey2] = useState<string | string[]>("");

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
                        // onFinish={onFinish}
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
                                    className={clsx(styles.inputLabel)}
                                    label="File Excel"
                                    name="excel_file"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn file Excel",
                                        },
                                    ]}
                                ></Form.Item>
                            </Col>
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
