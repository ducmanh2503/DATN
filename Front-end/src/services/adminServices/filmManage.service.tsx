import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    CREATE_FILM,
    DELETE_FILM,
    GET_FILM_DETAIL,
    GET_FILM_LIST,
    UPDATE_FILM,
} from "../../config/ApiConfig";
import { useEffect, useState } from "react";
import { useAdminContext } from "../../AdminComponents/UseContextAdmin/adminContext";

interface UseDetailFilmProps {
    id: number;
    form: any;
    setPoster: (poster: string) => void;
    openModal: boolean;
}

interface UseUpdateFilmProps {
    id: number;
    form: any;
    messageApi: any;
    setSelectedFile: (file: File | undefined) => void;
    setPreview: (preview: string | undefined) => void;
}

interface UseCreateFilmProps {
    form: any;
    messageApi: any;
    setSelectedFile: (file: File | undefined) => void;
    setPreview: (preview: string | undefined) => void;
}

// lấy danh sách film
export const useFilmManage = () => {
    const { setListFilms } = useAdminContext();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["filmList"],
        queryFn: async () => {
            const { data } = await axios.get(`${GET_FILM_LIST}`);
            console.log(data.movies);

            return data.movies.map((item: any) => ({
                ...item,
                key: item.id,
            }));
        },
        staleTime: 1000 * 60 * 10,
    });
    useEffect(() => {
        if (data) {
            setListFilms(data);
        }
    }, [data, setListFilms]);

    return { data, isLoading, isError };
};

// xóa film
export const useDeleteFilm = (messageApi: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(DELETE_FILM(id));
        },
        onSuccess: () => {
            messageApi.success("Xóa phim thành công");
            queryClient.invalidateQueries({
                queryKey: ["filmList"],
            });
        },
        onError: (error) => {
            messageApi.error(error.message || "Có lỗi xảy ra!");
        },
    });
};

// chi tiết film
export const useDetailFilm = ({
    id,
    form,
    setPoster,
    openModal,
}: UseDetailFilmProps) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (id && openModal) {
            setReady(true);
        }
    }, [id, openModal]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["filmDetail", id],
        queryFn: async () => {
            const { data } = await axios.get(GET_FILM_DETAIL(id));
            return data.data;
        },
        enabled: ready, // Chỉ kích hoạt khi ready = true
        onSuccess: (data: any) => {
            form.setFieldsValue(data);
            setPoster(data.poster ?? "");
        },
        refetchOnWindowFocus: false,
    });

    return { data, isLoading, refetch };
};

// update film
export const useUpdateFilm = ({
    id,
    form,
    messageApi,
    setSelectedFile,
    setPreview,
}: UseUpdateFilmProps) => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (formData: FormData) => {
            if (!id) throw new Error("Thiếu ID phim!");
            await axios.post(UPDATE_FILM(id), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            form.resetFields(); // Reset form sau khi cập nhật
            messageApi.success("Cập nhật phim thành công!");
            setSelectedFile(undefined); // Xoá file đã chọn
            setPreview(undefined); // Xoá preview ảnh
            queryClient.invalidateQueries({
                queryKey: ["filmList"], // Làm mới danh sách phim
            });
        },
        onError: (error) => {
            messageApi.error(error.message || "Có lỗi xảy ra!");
        },
    });

    return { mutate };
};

// thêm mới film
export const useCreateFilm = ({
    form,
    messageApi,
    setSelectedFile,
    setPreview,
}: UseCreateFilmProps) => {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (formData: FormData) => {
            await axios.post(CREATE_FILM, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            form.resetFields(); // Reset form sau khi thêm
            messageApi.success("Thêm phim thành công!");
            setSelectedFile(undefined); // Xoá file đã chọn
            setPreview(undefined); // Xoá preview ảnh
            queryClient.invalidateQueries({
                queryKey: ["filmList"], // Làm mới danh sách phim
            });
        },
        onError: (error) => {
            messageApi.error(error.message || "Có lỗi xảy ra!");
        },
    });

    return { mutate };
};
