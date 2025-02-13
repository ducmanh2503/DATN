import React from "react";
import Layout from "../Layout";
import { useLocation } from "react-router-dom";
import FilterPlayingCinema from "../../../ClientComponents/FilterPlayingCinema/FilterPlayingCinema";
import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";

const PlayingFilm = () => {
    const location = useLocation;

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
