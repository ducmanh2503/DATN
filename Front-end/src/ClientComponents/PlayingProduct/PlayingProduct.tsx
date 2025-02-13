import React, { useState } from "react";
import "./PlayingProduct.css";
import { Link } from "react-router-dom";
import { Modal } from "antd";

const PlayingProduct = ({
    className,
    image,
    category,
    date,
    startDay,
    name,
    showChill,
}: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return (
        <div className={`playingProduct ${className}`}>
            <div className="product-img">
                <img className="img" src={image} alt="" />
                <div className="hover-btn">
                    <Link className="btn" to={"...."}>
                        Đặt vé
                    </Link>
                    <button className="btn" onClick={showModal}>
                        Trailer
                    </button>
                    <Modal
                        width={720}
                        open={isModalOpen}
                        onCancel={handleCancel}
                        footer={null}
                        closable={false}
                    >
                        <iframe
                            width="670"
                            height="375"
                            src="https://www.youtube.com/embed/lxFmeBhoA1Y?si=vAHx_2eC9bovJvMh"
                            title="YouTube video player"
                            style={{ border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </Modal>
                </div>
            </div>
            <div className="product-sub">
                <h4 className="category cliptextTitle">{category}</h4>
                <span className="date">{date}</span>
            </div>
            {showChill && (
                <h4 className="start-day">
                    Ngày khởi chiếu: <span>{startDay}</span>
                </h4>
            )}
            <h2 className="product-title cliptextTitle">{name}</h2>
        </div>
    );
};

export default PlayingProduct;
