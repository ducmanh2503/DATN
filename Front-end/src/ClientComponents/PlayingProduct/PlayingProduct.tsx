import React, { useState } from "react";
import "./PlayingProduct.css";
import { Link } from "react-router-dom";
import { Modal } from "antd";

interface PlayingProductProps {
  className?: string;
  poster: string;
  category: string;
  date: string;
  startDay?: string;
  name: string;
  trailer?: string;
  movieId: number;
  showChill?: (movieId: number) => void;
}

const PlayingProduct: React.FC<PlayingProductProps> = ({
  className,
  poster,
  category,
  date,
  startDay,
  name,
  trailer,
  movieId,
  showChill,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDetailClick = () => {
    if (showChill) {
      showChill(movieId);
    }
  };

  return (
    <div className={`playingProduct ${className}`}>
      <div className="product-img" onClick={handleDetailClick}>
        <img className="img" src={poster} alt={name} />
        <div className="hover-btn">
          <Link className="btn" to={`/booking/${movieId}`}>
            Đặt vé
          </Link>
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              showModal();
            }}
          >
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
              src={
                trailer ||
                "https://www.youtube.com/embed/lxFmeBhoA1Y?si=vAHx_2eC9bovJvMh"
              }
              title={`${name} trailer`}
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
      {startDay && (
        <h4 className="start-day">
          Ngày khởi chiếu: <span className="word-render">{startDay}</span>
        </h4>
      )}
      <h2 className="product-title cliptextTitle">{name}</h2>
    </div>
  );
};

export default PlayingProduct;
