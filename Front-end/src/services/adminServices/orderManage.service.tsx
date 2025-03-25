import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DETAIL_ORDER, ORDERS_LIST } from "../../config/ApiConfig";
import { useAuthContext } from "../../ClientComponents/UseContext/TokenContext";

export const useOrdersList = () => {
    const { tokenUserId } = useAuthContext();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["OrdersList"],
        queryFn: async () => {
            const { data } = await axios.get(ORDERS_LIST, {
                headers: {
                    Authorization: `Bearer ${tokenUserId}`,
                },
            });
            // console.log("check-data", data.data);
            return data.data.map((item: any) => ({ ...item, key: item.id }));
        },
        staleTime: 1000 * 60 * 20,
    });
    return { data, isLoading, isError };
};

// chi tiết đơn hàng
export const useDetailOrder = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: ["detailOrder", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_ORDER(id));
            console.log("check-data", data.data);
            return data.data;
        },
        staleTime: 1000 * 60 * 20,
    });
    return { data, isLoading };
};
