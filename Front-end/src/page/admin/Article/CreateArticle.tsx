import { useState, useEffect } from "react";
import { Button, Input, Select, Card, Space, Upload } from "antd";
const { TextArea } = Input;
import { UploadOutlined } from "@ant-design/icons";
import "./CreatePost.css";
import { CREATE_ARTICLE } from "../../../config/ApiConfig";
export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Nháp");

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    if (image) formData.append("image", image);
    formData.append("category", category || "");
    formData.append("body", content);
    formData.append("status", status);

    fetch(CREATE_ARTICLE, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => console.log("Article created:", data))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="post-container">
      <Card
        className="post-card"
        title="Tạo bài viết"
        extra={
          <Button type="primary" onClick={handleSubmit}>
            Tạo bài viết
          </Button>
        }
      >
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            placeholder="Enter title"
            size="large"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Author"
            size="large"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Upload
            beforeUpload={(file) => {
              setImage(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Uploaded"
              className="uploaded-image"
            />
          )}
          <Select
            className="w-full"
            value={category}
            onChange={setCategory}
            placeholder="Select a category"
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
