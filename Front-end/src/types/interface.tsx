export interface FormData {
  title: string;
  trailer: string;
  name_director: number[];
  name_actor: number[];
  movie_status: string;
  release_date: string;
  running_time: number;
  rated: string;
  language: string;
  genre_id: number;
  name_genres: string;
  description: string;
  directors: string; //filmManage type
  genre: string; //filmManage type
  id: number; // editFilmManage type
}

export interface DataTypeGenresActorsDirectors {
  key: string;
  id: number;
  genre: string;
  actors: string;
  directors: string;
  movie: string;
}

export interface SelectFormProps {
  queryKey: string;
  endpoint: string;
  labelKey?: string;
  valueKey?: string;
  dataName?: { label: string; value: string | number }[];
  refetchDataName?: () => void;
  onChange?: (value: string[], fieldName: string) => void;
  form?: any;
  name: string;
  placeholder?: string;
}

export interface RefreshBtnProps {
  queryKey: (string | number)[];
}

export interface FieldType {
  room_id: string;
<<<<<<< HEAD
=======
  room_type_id: string;
>>>>>>> main
  show_date: string;
  date: string;
}

export interface RoomSHowtimesType {
  key: string;
  id: number;
  name: string;
  age: number;
  address: string;
}

// onError: (error: any) => {
//     messageApi.error(
//         error?.response?.data?.message || "Có lỗi xảy ra!"
//     );
// },

export interface AuthResponse {
  token: string;
  role: string; // Thêm thuộc tính role vào đây
<<<<<<< HEAD
=======
}

export interface BookingType {
    id: number;
    roomId: number;
    row: string;
    column: number;
    seatCode: string;
    seatType: string;
    price: string;
    type: string;
    dayType: "weekday" | "weekend" | "holiday";
    status?: string;
    heldByCurrentUser?: boolean;
>>>>>>> main
}
