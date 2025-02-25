import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST, URL_IMAGE } from "../../../config/ApiConfig";
import { useEffect } from "react";

const ListNameFilms = () => {
    const { data: moviesName, refetch: refetchMovieName } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            console.log("check-4", data);

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        enabled: false,
    });
    useEffect(() => {
        refetchMovieName();
    }, []);
    return (
        <>
            {moviesName?.map((film: any) => (
                <div key={film.key} className="list-product">
                    <img
                        src={`${URL_IMAGE}${film.poster}`}
                        alt={film.title}
                        className="moviesNameOfImage"
                    />
                    <h2 className="moviesNameOfTitle">{film.title}</h2>
                </div>
            ))}
        </>
    );
};

export default ListNameFilms;
