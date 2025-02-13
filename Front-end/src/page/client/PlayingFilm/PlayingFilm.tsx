import React from "react";
import Layout from "../Layout";
import FilterPlayingCinema from "../../../ClientComponents/FilterPlayingCinema/FilterPlayingCinema";
import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";

const PlayingFilm = () => {
    return (
        <div>
            <Layout>
                <FilterPlayingCinema></FilterPlayingCinema>
                <PlayingMain></PlayingMain>
            </Layout>
        </div>
    );
};

export default PlayingFilm;
