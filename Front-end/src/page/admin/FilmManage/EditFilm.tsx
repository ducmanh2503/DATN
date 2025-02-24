import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Image,
  Input,
  message,
  Row,
  Select,
  Skeleton,
  Space,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  GET_ACTOR_LIST,
  GET_DIRECTORS_LIST,
  GET_FILM_DETAIL,
  GET_GENRES,
  UPDATE_FILM,
  URL_IMAGE,
} from "../../../config/ApiConfig";
import { EditOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./DetailFilm.css";
import { FormData } from "../../../types/interface";

const EditFilm = ({ id }: any) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [poster, setPoster] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState<string>();
  const [openModal, setOpenModal] = useState(false);

  const { data: dataActors, refetch: refetchDataActors } = useQuery({
    queryKey: ["Actors"],
    queryFn: async () => {
      const { data } = await axios.get(GET_ACTOR_LIST);
      console.log("check-3", data);
      return data.map((item: any) => ({
        label: item.name_actor,
        value: item.name_actor,
      }));
    },
    enabled: false,
  });

  const { data: dataDirectors, refetch: refetchDataDirectors } = useQuery({
    queryKey: ["Directors"],
    queryFn: async () => {
      const { data } = await axios.get(GET_DIRECTORS_LIST);
      console.log("check-2", data);

      return data.map((item: any) => ({
        label: item.name_director,
        value: item.id,
      }));
    },
    enabled: false,
  });

  const { data: dataGenres, refetch: refetchDataGenres } = useQuery({
    queryKey: ["Genres"],
    queryFn: async () => {
      const { data } = await axios.get(GET_GENRES);
      console.log("check-1", data);

      return data.map((item: any) => ({
        label: item.name_genre,
        value: item.name_genre,
      }));
    },
    enabled: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["filmList", id],
    queryFn: async () => {
      const { data } = await axios.get(`${GET_FILM_DETAIL(id)}`);
      console.log("re-render-edit-film", data);
      return data.data;
    },
    enabled: openModal,
    onSuccess: (data: any) => {
      form.setFieldsValue(data);
      setPoster(data.poster ?? "");
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      await axios.post(UPDATE_FILM(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      form.resetFields();
      messageApi.success("Thêm thành công");
      setSelectedFile(undefined);
      setPreview(undefined);
      queryClient.invalidateQueries({
        queryKey: ["filmList"],
      });
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || "Có lỗi xảy ra!");
    },
  });

  const onFinish = (formData: FormData) => {
    const newForm = {
      title: formData.title,
      poster: selectedFile,
      trailer: formData.trailer,
      name_directors: formData.name_director,
      name_actors: formData.name_actor,
      movie_status: formData.movie_status,
      release_date: formData.release_date,
      running_time: formData.running_time,
      rated: formData.rated,
      language: formData.language,
      id: formData.id,
      name_genres: formData.name_genres,
      description: formData.description,
      director_id: formData.name_director[0],
      _method: "PUT",
    };
    mutate(newForm);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
  };
  const showDrawer = () => {
    setOpenModal(true);
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        name_actor: data.actors?.map((actor: any) => actor.name_actor) || [],
        name_director: data.directors ? [data.directors.id] : [],
        name_genres: data.genres?.map((genre: any) => genre.name_genre) || [],
      });
      setPoster(data.poster ?? "");
    }
  }, [openModal, data]);

  useEffect(() => {
    refetchDataActors();
    refetchDataDirectors();
    refetchDataGenres();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleChange = (value: string[], fieldName: string) => {
    form.setFieldsValue({ [fieldName]: value });
  };

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
      <Button type="primary" onClick={showDrawer} style={{ padding: "6px" }}>
        <EditOutlined />
        Cập nhật
      </Button>
      <Drawer
        title="Cập nhật phim "
        placement="right"
        width={800}
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
            name="edit-film-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
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
                      message: "Tên phim phải có ít nhất 3 ký tự",
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
                <Form.Item className="input-label" label="Poster" name="poster">
                  <Space.Compact>
                    <input
                      type="file"
                      accept="image/*"
                      id="uploadFile"
                      onChange={handleChangeImage}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="uploadFile" className="addImage">
                      <VerticalAlignTopOutlined /> Thêm ảnh
                    </label>
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Preview"
                        style={{
                          marginTop: "8px",
                          objectFit: "cover",
                        }}
                        width={180}
                        height={220}
                      />
                    ) : (
                      poster && (
                        <Image
                          src={`${URL_IMAGE}${poster}`}
                          alt="Poster"
                          style={{
                            marginTop: "8px",
                            objectFit: "cover",
                          }}
                          width={180}
                          height={220}
                        />
                      )
                    )}
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  className="input-label"
                  label="Diễn viên"
                  name="name_actor"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập diễn viên",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    onChange={(value) => handleChange(value, "name_actor")}
                    options={dataActors}
                    value={form.getFieldValue("name_actor")}
                  />
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
                    <Select.Option value="coming_soon">Sắp chiếu</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  className="input-label"
                  label="Đạo diễn"
                  name="name_director"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập đạo diễn",
                    },
                  ]}
                >
                  <Select
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    onChange={(value) => handleChange([value], "name_director")}
                    options={dataDirectors}
                    value={form.getFieldValue("name_director")}
                  />
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
              </Col>
              <Col span={12}>
                <Form.Item
                  className="input-label"
                  label="Thời lượng"
                  name="running_time"
                >
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
                  className="input-label"
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
                      message: "Vui lòng nhập ID sản phẩm",
                    },
                  ]}
                >
                  <Input placeholder="Nhập ID sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  className="input-label"
                  label="Thể loại"
                  name="name_genres"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập ID sản phẩm",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select"
                    onChange={(value) => handleChange(value, "name_genre")}
                    options={dataGenres}
                    value={form.getFieldValue("name_genre")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  className="input-labell"
                  name="description"
                  label="Description:"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  style={{ display: "none" }}
                  name="director_id"
                  label="ID đạo diễn:"
                >
                  <Input disabled></Input>
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
