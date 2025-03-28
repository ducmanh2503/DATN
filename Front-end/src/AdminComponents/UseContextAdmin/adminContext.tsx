import { createContext, useContext, useState } from "react";

const AdminContext = createContext<any>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const [listFilms, setListFilms] = useState({});
    const [directors, setDirectors] = useState<string[]>([]); // lưu dữ liệu đạo diễn
    const [siderWidth, setSiderWidth] = useState(0); // chiều rộng siderWidth
    const [rowSeats, setRowSeats] = useState<string[]>([]); // lưu tên các hàng ghế
    return (
        <AdminContext.Provider
            value={{
                directors,
                setDirectors,
                listFilms,
                setListFilms,
                siderWidth,
                setSiderWidth,
                rowSeats,
                setRowSeats,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdminContext = () => {
    return useContext(AdminContext);
};
