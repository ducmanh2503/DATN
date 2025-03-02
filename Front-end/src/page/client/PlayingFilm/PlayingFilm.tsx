import React from "react";
import FilterPlayingCinema from "../../../ClientComponents/FilterPlayingCinema/FilterPlayingCinema";
import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";
import ClientLayout from "../Layout";
import { useNavigate } from "react-router-dom";

const PlayingFilm = () => {
    const navigate = useNavigate();

    const handleMovieClick = (movieId: number) => {
        navigate(`/filmDetail/${movieId}`);
    };

    return (
        <div className="playing-film-container">
            <ClientLayout>
                <FilterPlayingCinema />
                <PlayingMain showChill={handleMovieClick} />
            </ClientLayout>
        </div>
    );
};

export default PlayingFilm;