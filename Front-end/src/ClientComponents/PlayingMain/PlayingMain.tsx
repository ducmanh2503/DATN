import React, { useState } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import "./PlayingMain.css";
const PlayingMain = ({ showChill }: any) => {
    const [showMore, setShowMore] = useState(false);
    // const [products, setProducts] = useState([]);
    // Fetch data call api

    //fake data
    const products = [
        {
            id: 1,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 2,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 3,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 4,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 5,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 6,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 7,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 8,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 9,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 10,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 11,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
        {
            id: 12,
            image: "https://naidecor.vn/wp-content/uploads/2023/09/landscape_photography_tips_featured_image_1024x1024.webp",
            category: "Hành động",
            date: "17/01/2025",
            name: "Bộ tử báo thủ",
        },
    ];

    return (
        <div className="playingMain  main-base ">
            {products.map((product, index) => (
                <PlayingProduct
                    key={product.id}
                    className={`item-main ${
                        index >= 8 && !showMore ? "hidden" : ""
                    }`}
                    image={product.image}
                    category={product.category}
                    date={product.date}
                    name={product.name}
                    showChill={showChill}
                ></PlayingProduct>
            ))}
            <button
                className="show-more-btn"
                onClick={() => setShowMore(!showMore)}
            >
                {showMore ? "Ẩn bớt " : "Xem thêm..."}
            </button>
        </div>
    );
};

export default PlayingMain;
