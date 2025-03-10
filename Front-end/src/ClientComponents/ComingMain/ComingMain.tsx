import { useState } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST, URL_IMAGE } from "../../config/ApiConfig";
import clsx from "clsx";

import styles from "../PlayingMain/PlayingMain.module.css";

const ComingMain = ({ showChill }: any) => {
    const [showMore, setShowMore] = useState(false);

    // lấy data film
    const { data: comingfilms } = useQuery({
        queryKey: ["comingfilms"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            return data.coming_soon.map((film: any) => ({
                ...film,
                key: film.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    return (
        <div className={clsx(styles.playingMain, "main-base")}>
            {comingfilms?.map((film: any, index: number) => (
                <PlayingProduct
                    className={clsx(
                        styles.itemMain,
                        index >= 8 && !showMore && styles.hidden
                    )}
                    key={film.id}
                    id={film.id}
                    title={film.title}
                    trailer={film.trailer}
                    poster={`${URL_IMAGE}${film.poster}`}
                    genres={film.genres
                        .map((genre: any) => genre.name_genre)
                        .join(", ")}
                    release_date={film.release_date}
                    showChill={showChill}
                />
            ))}
            <button
                className={clsx(styles.showMoreBtn)}
                onClick={() => setShowMore(!showMore)}
            >
                {showMore ? "Ẩn bớt " : "Xem thêm..."}
            </button>
        </div>
    );
};

export default ComingMain;
