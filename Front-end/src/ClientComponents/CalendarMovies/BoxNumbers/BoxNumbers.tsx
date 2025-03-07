import React from "react";
import "./BoxNumbers.css";
import { Link } from "react-router-dom";
import { Button } from "antd";
const BoxNumbers = ({ time, onClick }: any) => {
    return (
        <Link to="/booking" className="box-numbers" onClick={() => onClick()}>
            {time}
        </Link>
    );
};

export default BoxNumbers;
