import React from "react";
import { Image } from "antd";
import { Link } from "react-router-dom";
import "./InfomationProduct.css";
const InfomationProduct = ({ image, category, date, title }: any) => {
    return (
        <Link className="infomationProduct" to={"....."}>
            <div>
                <Image
                    className="product-image"
                    src="data:image/jpeg;base64,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"
                ></Image>
            </div>
            <div>
                <div>
                    <h5 className="category">{category}Khuyến mãi</h5>
                    <span className="date">{date} 1/20/2025</span>
                </div>
                <div>
                    <h4 className="title">
                        {title}Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit.Qui at voluptates id, reiciendis hic
                        pe....
                    </h4>
                </div>
            </div>
        </Link>
    );
};

export default InfomationProduct;
