import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Orders_Confirmed } from "../config/ApiConfig";
import { useAuthContext } from "../ClientComponents/UseContext/TokenContext";

// lấy tổng tỉền tiêu dùng của user
export const useGetTotalUsedMoneyUser = () => {
    const { tokenUserId } = useAuthContext();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["totalUsedMoneyUser"],
        queryFn: async () => {
            const { data } = await axios.get(Orders_Confirmed, {
                headers: {
                    Authorization: `Bearer ${tokenUserId}`,
                },
            });
            console.log("check-response", data);

            return data.data;
        },
        staleTime: 1000 * 60 * 10,
    });

    return { data, isLoading, isError };
};
