import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input, Select, Card, Space, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import "./UpdatePost.css";
import { GET_ARTICLE, UPDATE_ARTICLE } from "../../../config/ApiConfig";
const { TextArea } = Input;

export default function UpdatePost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Nháp");
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios
      .get(`${GET_ARTICLE}/${id}`)
      .then((response) => {
        const data = response.data;
        setTitle(data.title);
        setAuthor(data.author);
        setImage(data.image);
        setCategory(data.category);
        setContent(data.body);
        setStatus(data.status);
      })
      .catch((error) => console.error("Error fetching post:", error));
  }, [id]);

  const handleUpdatePost = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("body", content);
    formData.append("status", status);
    if (file) {
      formData.append("image", file);
    }

    try {
      await axios.put(`${UPDATE_ARTICLE}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Bài viết đã được cập nhật thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật bài viết!");
    }
  };

  return (
    <div className="post-container">
      <Card
        className="post-card"
        title="Cập nhật bài viết"
        extra={
          <Button type="primary" onClick={handleUpdatePost}>
            Cập nhật
          </Button>
        }
      >
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            placeholder="Nhập tiêu đề"
            size="large"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Tác giả"
            size="large"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
          {image && (
            <img src={image} alt="Uploaded" className="uploaded-image" />
          )}
          <Select
            className="w-full"
            value={category}
            onChange={setCategory}
            placeholder="Chọn danh mục"
          >
            <Select.Option value="option1">Option 1</Select.Option>
            <Select.Option value="option2">Option 2</Select.Option>
          </Select>
          <TextArea
            className="custom-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Select className="w-full" value={status} onChange={setStatus}>
            <Select.Option value="Nháp">Nháp</Select.Option>
            <Select.Option value="Xuất bản">Xuất bản</Select.Option>
          </Select>
        </Space>
      </Card>
    </div>
  );
}
