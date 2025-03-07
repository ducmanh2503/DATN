import React from "react";
import "./BoxNumbers.css";
import { Link } from "react-router-dom";
const BoxNumbers = ({ time, onclick }: any) => {
    return (
        <Link to="/booking" className="box-numbers" onClick={() => onclick()}>
            {time}
        </Link>
    );
};

export default BoxNumbers;
