import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST, URL_IMAGE } from "../../../config/ApiConfig";
import { Spin } from "antd";

const contentStyle: React.CSSProperties = {
    padding: 50,
};

const content = <div style={contentStyle} />;

const ListNameFilms = () => {
    const { data: moviesName, isLoading } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_LIST);
            console.log("check-4", data);

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });

    if (isLoading)
        return (
            <Spin tip="Loading" size="large">
                {content}
            </Spin>
        );
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
