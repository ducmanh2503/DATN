import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  CREATE_CALENDAR,
  DELETE_CALENDAR,
  DETAIL_CALENDAR,
  GET_CALENDAR,
  GET_FILM_LIST,
  UPDATE_CALENDAR,
} from "../../config/ApiConfig";
import axiosInstance from "../../utils/axios-instance";

// danh sách lịch chiếu
export const useCalendarManage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["showtimesFilm"],
    queryFn: async () => {
      try {
        console.log(
          "[CalendarManage] Đang gọi API lấy danh sách lịch chiếu với axiosInstance"
        );
        const { data } = await axiosInstance.get(GET_CALENDAR);
        console.log("showtime-data", data);

        return data.map((item: any) => ({
          ...item,
          key: item.id,
        }));
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách lịch chiếu:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        // Trả về mảng rỗng thay vì ném lỗi
        console.log("[CalendarManage] Trả về mảng rỗng do lỗi API");
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 3, // Tăng số lần thử lại
  });

  return { data: data || [], isLoading, isError };
};

// xóa lịch chiếu
export const useDeleteCalendar = (messageApi: any) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (id: number) => {
      try {
        await axiosInstance.delete(DELETE_CALENDAR(id));
      } catch (error: any) {
        console.error(`Lỗi khi xóa lịch chiếu ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa lịch chiếu thành công");
      queryClient.invalidateQueries({
        queryKey: ["showtimesFilm"],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xóa lịch chiếu!"
      );
    },
  });

  return { mutate };
};

// lấy danh sách film
export const useFilmList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["filmList"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(GET_FILM_LIST);
        return data.movies;
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 3,
  });

  return { data: data || [], isLoading, isError };
};

// lấy danh sách lịch chiếu
export const useShowtimesList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["showtimesFilm"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(GET_CALENDAR);
        return data;
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách lịch chiếu:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 3,
  });

  return { data: data || [], isLoading, isError };
};

// tạo lịch chiếu
export const useCreateCalendar = (
  form: any,
  messageApi: any,
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      try {
        const newFormData = {
          ...formData,
          show_date: formData.show_date
            ? dayjs(formData.show_date).format("YYYY/MM/DD")
            : null,
        };
        await axiosInstance.post(CREATE_CALENDAR, newFormData);
      } catch (error: any) {
        console.error("Lỗi khi tạo lịch chiếu:", error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Tạo lịch chiếu thành công");
      form.resetFields();
      onSuccess();
      queryClient.invalidateQueries({
        queryKey: ["showtimesFilm"],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi tạo lịch chiếu!"
      );
    },
  });

  return { mutate, isLoading: isPending };
};

// chi tiết lịch chiếu
export const useDetailCalendar = (id: number) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["showtimesFilm", id],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(DETAIL_CALENDAR(id));
        console.log("check", data);
        return data;
      } catch (error: any) {
        console.error(`Lỗi khi lấy chi tiết lịch chiếu ID ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });

  return { data, isLoading, isError };
};

// cập nhật lịch chiếu
export const useUpdateCalendar = (
  id: number,
  form: any,
  messageApi: any,
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      try {
        const response = await axiosInstance.put(UPDATE_CALENDAR(id), formData);
        return response.data;
      } catch (error: any) {
        console.error(`Lỗi khi cập nhật lịch chiếu ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      messageApi.success("Cập nhật lịch chiếu thành công");
      form.resetFields();
      onSuccess();
      queryClient.invalidateQueries({
        queryKey: ["showtimesFilm"],
      });
      queryClient.invalidateQueries({
        queryKey: ["showtimesFilm", id],
      });
    },
    onError: (error: any) => {
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi cập nhật lịch chiếu!"
      );
    },
  });

  return { mutate, isLoading: isPending };
};

// Kiểm tra xem phim đã có lịch chiếu hay chưa
export const useHasShowtime = (movieId: number) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hasShowtime", movieId],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(GET_CALENDAR);
        // Kiểm tra xem phim đã có trong lịch chiếu chưa
        const hasShowtime = data.some((item: any) => item.movie_id === movieId);
        return hasShowtime;
      } catch (error: any) {
        console.error(
          `Lỗi khi kiểm tra lịch chiếu cho phim ID ${movieId}:`,
          error
        );
        return false;
      }
    },
    enabled: !!movieId,
    retry: 2,
  });

  return { hasShowtime: data || false, isLoading, isError };
};
