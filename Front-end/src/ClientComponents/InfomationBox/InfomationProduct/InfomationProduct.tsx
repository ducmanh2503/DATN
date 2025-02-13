import React from "react";
import { Image } from "antd";
import { Link } from "react-router-dom";
import "./InfomationProduct.css";
const InfomationProduct = ({
    className,
    image,
    category,
    date,
    title,
}: any) => {
    return (
        <Link className={`infomationProduct ${className}`} to={"....."}>
            <div className="info-thumnail">
                <img className="product-image" src={image}></img>
            </div>
            <div className="type">
                <h5 className="category">{category}</h5>
                <span className="date">{date} </span>
            </div>
            <h4 className="title cliptext">{title}</h4>
        </Link>
    );
};

export default InfomationProduct;
