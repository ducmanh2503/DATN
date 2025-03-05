import React, { useState } from "react";
import "./BoxDay.css";
const BoxDay = () => {
    const [isActive, setIsActive] = useState(false);
    return (
        <div
            className={`box-days ${isActive ? "active-btn" : ""}`}
            onClick={() => setIsActive(!isActive)}
        >
            <div className="title-days">Thứ hai</div>
            <div className="number-days">03/03</div>
        </div>
    );
};

export default BoxDay;
