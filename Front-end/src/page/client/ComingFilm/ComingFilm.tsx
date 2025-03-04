import React, { useState } from "react";
import ClientLayout from "../Layout";
import ComingMain from "../../../ClientComponents/ComingMain/ComingMain";

const ComingFilm = () => {
    const [showChill, setShowChill] = useState(true);
    return (
        <div>
            <ClientLayout>
                <ComingMain showChill={true}></ComingMain>
            </ClientLayout>
        </div>
    );
};

export default ComingFilm;
