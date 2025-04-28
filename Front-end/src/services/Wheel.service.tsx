import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Orders_Confirmed } from "../config/ApiConfig";
import { useAuthContext } from "../ClientComponents/UseContext/TokenContext";

// lấy tổng tỉền tiêu dùng của user
export const useGetTotalUsedMoneyUser = () => {
    const { tokenUserId } = useAuthContext();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["totalUsedMoneyUser"],
        queryFn: async () => {
            const { data } = await axios.get(Orders_Confirmed, {
                headers: {
                    Authorization: `Bearer ${tokenUserId}`,
                },
            });

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};
