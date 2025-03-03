import React, { useState, useEffect } from "react";
import PlayingProduct from "../PlayingProduct/PlayingProduct";
import "./PlayingMain.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GET_FILM_LIST, URL_IMAGE } from "../../config/ApiConfig";
const PlayingMain = ({ showChill }: any) => {
  const [showMore, setShowMore] = useState(false);

  const { data: playingfilm } = useQuery({
    queryKey: ["playingfilms"],
    queryFn: async () => {
      const { data } = await axios.get(GET_FILM_LIST);
      console.log(data.now_showing);

      return data.now_showing.map((film: any) => ({
        ...film,
        key: film.id,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="playingMain main-base">
      {playingfilm?.map((film: any, index: number) => (
        <PlayingProduct
          className={`item-main ${index >= 4 && !showMore ? "hidden" : ""}`}
          id={film.id}
          key={film.id}
          trailer={film.trailer}
          poster={`${URL_IMAGE}${film.poster}`}
          genres={film.genres.map((genre: any) => genre.name_genre).join(", ")}
          date={film.date}
          title={film.title}
          release_date={film.release_date}
          showChill={showChill}
        />
      ))}
      <button className="show-more-btn" onClick={() => setShowMore(!showMore)}>
        {showMore ? "Ẩn bớt " : "Xem thêm..."}
      </button>
    </div>
  );
};

export default PlayingMain;
