import { Image } from "antd";
import React from "react";
import "./rankingProduct.css";
const RankingProduct = ({ className, number, name, image }: any) => {
    return (
        <div className={`r-product ${className}`}>
            <div className="img-box">
                <img className="image" src={image}></img>
            </div>
            <div className="title">
                <span className="number">{number}</span>
                <h2 className="product-name cliptextTitle">{name}</h2>
            </div>
        </div>
    );
};

export default RankingProduct;
