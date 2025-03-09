import { useState } from "react";
import "./PlayingProduct.css";
import { Modal } from "antd";
import CalendarMovies from "../CalendarMovies/CalendarMovies";
import { Link } from "react-router-dom";

const PlayingProduct = ({
    id,
    title,
    className,
    genres,
    release_date,
    poster,
    trailer,
    showChill,
    onClick,
}: any) => {
    const [videoKey, setVideoKey] = useState(0);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const showModal1 = () => {
        setVideoKey((prevKey) => prevKey + 1);
        setIsModalOpen1(true);
    };

    const handleCancel1 = () => {
        setIsModalOpen1(false);
    };

    const showModal2 = () => {
        setIsModalOpen2(true);
    };
    const handleCancel2 = () => {
        setIsModalOpen2(false);
    };

    return (
        <div
            className={`playingProduct ${className}`}
            onClick={() => onClick()}
        >
            <div className="product-img" onClick={(e) => e.stopPropagation()}>
                <Link to={`/filmDetail/${id}`}>
                    <img className="img" src={poster} alt="" />
                </Link>
                ;
                <div className="hover-btn" onClick={(e) => e.stopPropagation()}>
                    <button className="btn" onClick={showModal2}>
                        Đặt vé
                    </button>
                    <button className="btn" onClick={showModal1}>
                        Trailer
                    </button>
                    <Modal
                        title={`Lịch chiếu phim`}
                        width={700}
                        open={isModalOpen2}
                        onCancel={handleCancel2}
                        footer={null}
                    >
                        <CalendarMovies
                            id={id}
                            setIsModalOpen2={setIsModalOpen2}
                        ></CalendarMovies>
                    </Modal>
                    <Modal
                        width={720}
                        open={isModalOpen1}
                        onCancel={handleCancel1}
                        footer={null}
                        closable={false}
                        destroyOnClose={true}
                    >
                        {isModalOpen1 && (
                            <iframe
                                key={videoKey}
                                width="670"
                                height="375"
                                src={`${trailer}?autoplay=1`}
                                title="YouTube video player"
                                style={{ border: "none" }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        )}
                    </Modal>
                </div>
            </div>
            <div className="product-sub">
                <h4 className="category cliptextTitle">{genres}</h4>
                {showChill || <span className="date">{release_date}</span>}
            </div>
            {showChill && (
                <h4 className="start-day">
                    Ngày khởi chiếu:{" "}
                    <span className="word-render">{release_date}</span>
                </h4>
            )}
            <h2 className="product-title cliptextTitle">{title}</h2>
        </div>
    );
};

export default PlayingProduct;
