import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "../../ClientComponents/UseContext/TokenContext";

// tổng quát doanh thu
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

// xuất file excel
export const useExcelExport = () => {
    const { tokenUserId } = useAuthContext();
    const mutation = useMutation({
        mutationFn: async ({
            start_date,
            end_date,
        }: {
            start_date: string;
            end_date: string;
        }) => {
            const { data } = await axios.get(
                `http://localhost:8000/api/export-stats-by-date-range`,
                {
                    params: { start_date, end_date },
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${tokenUserId}`,
                    },
                }
            );
            return data;
        },
    });

    return mutation;
};
