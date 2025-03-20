import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  GET_DISCOUNT_CODE,
  CREATE_DISCOUNT_CODE,
  DELETE_DISCOUNT_CODE,
} from "../../../config/ApiConfig";

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name_code: "",
    percent: "",
    quantity: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(GET_DISCOUNT_CODE);
      setDiscounts(response.data);
    } catch (error) {
      console.error("Error fetching discounts", error);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(CREATE_DISCOUNT_CODE, form);
      fetchDiscounts();
      setShowForm(false); // Ẩn form sau khi thêm thành công
      setForm({
        name_code: "",
        percent: "",
        quantity: "",
        status: "",
        start_date: "",
        end_date: "",
      });
    } catch (error) {
      console.error("Error creating discount", error);
    }
  };

  const handleDelete = async (id: any) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await axios.delete(`${DELETE_DISCOUNT_CODE(id)}`);
        setDiscounts(discounts.filter((discount) => discount.id !== id));
        // Cập nhật danh sách sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa mã khuyến mãi", error);
      }
    }
  };

  return (
    <div>
      <h2>Quản lý khuyến mãi</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Đóng" : "Thêm mã khuyến mãi"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            name="name_code"
            value={form.name_code}
            onChange={handleChange}
            placeholder="Mã khuyến mãi"
            required
          />
          <input
            name="percent"
            value={form.percent}
            onChange={handleChange}
            placeholder="Phần trăm giảm"
            required
          />
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Số lượng"
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="">Chọn trạng thái</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Ẩn</option>
          </select>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
          />
          <button type="submit">Lưu</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giảm giá (%)</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Thời gian áp dụng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => (
            <tr key={discount.id}>
              <td>{discount.name_code}</td>
              <td>{discount.percent}%</td>
              <td>{discount.quantity}</td>
              <td>{discount.status === "active" ? "Kích hoạt" : "Ẩn"}</td>
              <td>
                {discount.start_date} - {discount.end_date}
              </td>
              <td>
                <button onClick={() => handleDelete(discount.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountManagement;
