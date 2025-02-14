import React, { useState } from "react";

import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";
import ClientLayout from "../Layout";

const ComingFilm = () => {
    const [showChill, setShowChill] = useState(true);
    return (
        <div>
            <ClientLayout>
                <PlayingMain showChill={true}></PlayingMain>
            </ClientLayout>
        </div>
    );
};

export default ComingFilm;
