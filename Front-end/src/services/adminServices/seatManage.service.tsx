import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    DELETE_ALL_SEATS_IN_ROOM,
    DELETE_SEAT,
    GET_SEATS_BY_ROOM,
    GET_SEATS_TYPE,
} from "../../config/ApiConfig";

// lấy danh sách ghế trong phòng chiếu
export const useGetSeatsByRoom = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: ["SeatsByRoom", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_SEATS_BY_ROOM(id));
            console.log("check-seats-by_room", data);

            return data;
        },
    });
    return { data, isLoading };
};

// lấy danh sách loại ghế
export const useOptionSeats = () => {
    const { data } = useQuery({
        queryKey: ["OptionSeats"],
        queryFn: async () => {
            const { data } = await axios.get(GET_SEATS_TYPE);
            console.log("check-ghế", data);
            return data;
        },
    });
    return { data };
};

//Xóa 1 ghế
export const useDeleteOneSeat = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (seatId: number) => {
            await axios.delete(DELETE_SEAT(seatId));
        },
        onSuccess: () => {
            messageApi.success("Xóa ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message || "Có lỗi xảy ra!");
        },
    });
};

//xóa tất cả ghế của phòng
export const useDeleteAllSeats = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (roomId: number) => {
            await axios.delete(DELETE_ALL_SEATS_IN_ROOM(roomId));
        },
        onSuccess: () => {
            messageApi.success("Xóa tất cả ghế thành công");
            queryClient.invalidateQueries({
                queryKey: ["SeatsByRoom"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message || "Có lỗi xảy ra!");
        },
    });
};
