import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    DELETE_TICKETPRICE,
    DETAIL_TICKETPRICE,
    GET_TICKETSPRICE,
    UPDATE_TICKETPRICE,
} from "../../config/ApiConfig";

// Hàm lấy dữ liệu ticketPrice
export const useTicketsPrice = () => {
    return useQuery({
        queryKey: ["ticketsPrice"],
        queryFn: async () => {
            const { data } = await axios.get(GET_TICKETSPRICE);
            console.log("check", data.data);

            return data.data.map((item: any, index: any) => ({
                key: item.id || index,
                seat_type_name: item.seat_type_name,
                room_type_name: item.room_type_name,
                room_name: item.room_name,
                day_type: item.day_type,
                price: item.price,
            }));
        },
        staleTime: 1000 * 60 * 10, // Dữ liệu cache trong 10 phút
    });
};

// hàm xóa dữ liệu
export const useDeleteTicketPrice = (messageApi: any) => {
    const query = useQueryClient();
    return useMutation({
        mutationFn: async (id: any) => {
            await axios.delete(DELETE_TICKETPRICE(id));
        },
        onSuccess: () => {
            query.invalidateQueries({
                queryKey: ["ticketsPrice"],
            });
            messageApi.success("Xóa vé thành công");
        },
        // onError: (error: any) => {
        //     const errorMessage =
        //         JSON.parse(error.request.responseText) || "Có lỗi xảy ra";
        //     messageApi.error(errorMessage);
        // },
        onError: () => {
            messageApi.error("Không thể xóa vé");
        },
    });
};

// hàm lấy chi tiết giá vé
export const useDetailTicketsPrice = (id: any) => {
    return useQuery({
        queryKey: ["detailTicketsPrice", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_TICKETPRICE(id));

            return data;
        },
        staleTime: 1000 * 60 * 10, // Dữ liệu cache trong 10 phút
    });
};

// hàm sửa dữ liệu
export const useUpdateTicketPrice = (messageApi: any) => {
    const query = useQueryClient();
    return useMutation({
        mutationFn: async (id: any) => {
            await axios.put(UPDATE_TICKETPRICE(id));
        },
        onSuccess: () => {
            query.invalidateQueries({
                queryKey: ["ticketsPrice"],
            });
            messageApi.success("Xóa vé thành công");
        },
        // onError: (error: any) => {
        //     const errorMessage =
        //         JSON.parse(error.request.responseText) || "Có lỗi xảy ra";
        //     messageApi.error(errorMessage);
        // },
        onError: () => {
            messageApi.error("không thể xóa vé");
        },
    });
};
