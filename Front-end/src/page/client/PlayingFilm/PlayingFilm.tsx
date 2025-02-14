import FilterPlayingCinema from "../../../ClientComponents/FilterPlayingCinema/FilterPlayingCinema";
import PlayingMain from "../../../ClientComponents/PlayingMain/PlayingMain";
import ClientLayout from "../Layout";

const PlayingFilm = () => {
    return (
        <div>
            <ClientLayout>
                <FilterPlayingCinema></FilterPlayingCinema>
                <PlayingMain></PlayingMain>
            </ClientLayout>
        </div>
    );
};

export default PlayingFilm;
