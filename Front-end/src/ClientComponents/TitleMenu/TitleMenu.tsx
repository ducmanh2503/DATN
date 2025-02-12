import React from "react";
import "./TitleMenu.css";
const TitleMenu = (props: any) => {
    return (
        <div className="ranking">
            <div className="title">
                <h1 className="sub-vn">{props.name}</h1>
                <h1 className="sub-en">{props.nameSub}</h1>
            </div>
            <div className="main"></div>
        </div>
    );
};

export default TitleMenu;
