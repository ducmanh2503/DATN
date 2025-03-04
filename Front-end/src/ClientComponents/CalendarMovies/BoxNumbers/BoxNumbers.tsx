import React from "react";
import "./BoxNumbers.css";
import { Link } from "react-router-dom";
const BoxNumbers = () => {
    return (
        <Link to="/booking" className="box-numbers">
            12:00 PM
        </Link>
    );
};

export default BoxNumbers;
