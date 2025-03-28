import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import {
    CREATE_ROOM,
    DELETE_ROOM,
    GET_ONE_ROOM,
    GET_ROOM_TYPES,
    GET_ROOMS,
    UPDATE_ROOM,
} from "../../config/ApiConfig";
import { handleApiError } from "./utils";

// lấy danh sách phòng chiếu và loại phòng chiếu
export const useGetRooms = () => {
    const results = useQueries({
        queries: [
            {
                queryKey: ["roomsCinema"],
                queryFn: async () => {
                    const { data } = await axios.get(GET_ROOMS);
                    console.log("check-room", data);
                    return data.rooms;
                },
                staleTime: 1000 * 60 * 10,
                refetchOnMount: false,
            },
            {
                queryKey: ["seatTypes"],
                queryFn: async () => {
                    const { data } = await axios.get(GET_ROOM_TYPES);
                    // console.log("check-seat-types", data);
                    return data;
                },
                staleTime: 1000 * 60 * 10,
                refetchOnMount: false,
            },
        ],
    });

    const [roomsQuery, seatTypesQuery] = results;

    return {
        rooms: roomsQuery.data,
        isRoomsLoading: roomsQuery.isLoading,
        seatTypes: seatTypesQuery.data,
        isSeatTypesLoading: seatTypesQuery.isLoading,
    };
};

// xóa phòng chiếu
export const useDeleteRoom = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_ROOM(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa phòng chiếu thành công");
            queryClient.invalidateQueries({
                queryKey: ["roomsCinema"],
            });
        },
        onError: handleApiError,
    });
};

//detail phòng chiếu
export const useDetailRoom = (id: any, open: boolean) => {
    const { data, isLoading } = useQuery({
        queryKey: ["detailRoom", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_ONE_ROOM(id));
            return data;
        },
        staleTime: 1000 * 60 * 10,
        enabled: Boolean(id && open),
    });

    return { data, isLoading };
};

// edit phòng chiếu
export const useUpdateRoom = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            await axios.put(UPDATE_ROOM(id), data);
        },
        onSuccess: () => {
            messageApi.success("Cập nhật phòng chiếu thành công");
            queryClient.invalidateQueries({
                queryKey: ["roomsCinema"],
            });
        },
        onError: handleApiError,
    });
};

// thêm phòng chiếu
export const useCreateRoom = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: any }) => {
            await axios.post(CREATE_ROOM, data);
        },
        onSuccess: () => {
            messageApi.success("Thêm mới phòng chiếu thành công");
            queryClient.invalidateQueries({
                queryKey: ["roomsCinema"],
            });
        },
        onError: handleApiError,
    });
};
