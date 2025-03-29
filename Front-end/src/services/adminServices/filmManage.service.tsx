import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CREATE_FILM,
  DELETE_FILM,
  GET_FILM_DETAIL,
  GET_FILM_LIST,
  UPDATE_FILM,
} from "../../config/ApiConfig";
import { useEffect, useState } from "react";
import { useAdminContext } from "../../AdminComponents/UseContextAdmin/adminContext";
import authService from "../auth.service";
import axiosInstance from "../../utils/axios-instance";

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

// Hàm helper để tạo config với token
const getAuthConfig = () => {
  const token = authService.getToken();
  const userRole = authService.getRole();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      "X-User-Role": userRole || "",
    },
    params: {
      role: userRole || "", // Thêm role vào params để đảm bảo backend nhận được thông tin quyền
    },
  };
};

// lấy danh sách film
export const useFilmManage = () => {
  const { setListFilms } = useAdminContext();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["filmList"],
    queryFn: async () => {
      try {
        console.log(
          "[FilmManage] Đang gọi API lấy danh sách phim với axiosInstance"
        );
        const config = getAuthConfig();
        console.log("[FilmManage] Config request:", config);

        const { data } = await axiosInstance.get(`${GET_FILM_LIST}`, config);
        console.log("Danh sách phim từ API:", data.movies);

        return data.movies.map((item: any) => ({
          ...item,
          key: item.id,
        }));
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        // Trả về mảng rỗng thay vì ném lỗi
        console.log("[FilmManage] Trả về mảng rỗng do lỗi API");
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 3, // Tăng số lần thử lại
  });

  useEffect(() => {
    if (data) {
      setListFilms(data);
    }
  }, [data, setListFilms]);

  return { data: data || [], isLoading, isError, error };
};

// xóa film
export const useDeleteFilm = (messageApi: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await axiosInstance.delete(DELETE_FILM(id), getAuthConfig());
      } catch (error: any) {
        console.error(`Lỗi khi xóa phim ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa phim thành công");
      queryClient.invalidateQueries({
        queryKey: ["filmList"],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xóa phim!"
      );
    },
  });
};

// chi tiết film
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

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["filmDetail", id],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(
          GET_FILM_DETAIL(id),
          getAuthConfig()
        );
        return data.data;
      } catch (error: any) {
        console.error(`Lỗi khi lấy chi tiết phim ID ${id}:`, error);
        throw error;
      }
    },
    enabled: ready, // Chỉ kích hoạt khi ready = true
    onSuccess: (data: any) => {
      if (data) {
        // Cập nhật form với dữ liệu từ API
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          duration: data.duration,
          release_date: data.release_date,
          language: data.language,
          country: data.country,
          director: data.director,
          actors: data.actors?.map((actor: any) => actor.id) || [],
          genres: data.genres?.map((genre: any) => genre.id) || [],
          status: data.status,
        });
        // Cập nhật poster nếu có
        if (data.poster) {
          setPoster(data.poster);
        }
      }
    },
    retry: 1,
  });

  return { data, isLoading, refetch, error };
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
  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const { data } = await axiosInstance.post(UPDATE_FILM(id), formData, {
          ...getAuthConfig(),
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        });
        return data;
      } catch (error: any) {
        console.error(`Lỗi khi cập nhật phim ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Cập nhật phim thành công");
      form.resetFields();
      setSelectedFile(undefined);
      setPreview(undefined);
      queryClient.invalidateQueries({
        queryKey: ["filmList"],
      });
      queryClient.invalidateQueries({
        queryKey: ["filmDetail", id],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi cập nhật phim!"
      );
    },
  });
};

// thêm mới film
export const useCreateFilm = ({
  form,
  messageApi,
  setSelectedFile,
  setPreview,
}: UseCreateFilmProps) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const { data } = await axiosInstance.post(CREATE_FILM, formData, {
          ...getAuthConfig(),
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        });
        return data;
      } catch (error: any) {
        console.error("Lỗi khi tạo phim mới:", error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Thêm phim mới thành công");
      form.resetFields();
      setSelectedFile(undefined);
      setPreview(undefined);
      queryClient.invalidateQueries({
        queryKey: ["filmList"],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi thêm phim mới!"
      );
    },
  });
};
