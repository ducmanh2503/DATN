import { Image } from "antd";
import React from "react";
import "./rankingProduct.css";
const RankingProduct = ({ number, name, image }: any) => {
    return (
        <div className="r-product">
            <div>
                <Image className="image" src={image}></Image>
                <div className="title">
                    <span className="number">{number}</span>
                    <h2 className="product-name cliptextTitle">{name}</h2>
                </div>
            </div>
        </div>
    );
};

export default RankingProduct;
