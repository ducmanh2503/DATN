// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { GET_MOVIES } from "../../../config/ApiConfig";

// const ListFilm = () => {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["MOVIE"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${GET_MOVIES}`);
//       return { data };
//     },
//   });

//   return <>{console.log(data?.data.now_showing.data)}</>;
// };

// export default ListFilm;
