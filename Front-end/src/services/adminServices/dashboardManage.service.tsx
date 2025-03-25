import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useDashboard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const { data } = await axios.get(
                "http://localhost:8000/api/statistics"
            );
            console.log(data.data);

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
    });
    return { data, isLoading };
};
