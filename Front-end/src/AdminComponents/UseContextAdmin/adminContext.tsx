import { createContext, useContext, useState } from "react";

const AdminContext = createContext<any>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const [listFilms, setListFilms] = useState({});
    const [directors, setDirectors] = useState<string[]>([]); // lưu dữ liệu đạo diễn
    return (
        <AdminContext.Provider
            value={{ directors, setDirectors, listFilms, setListFilms }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdminContext = () => {
    return useContext(AdminContext);
};
