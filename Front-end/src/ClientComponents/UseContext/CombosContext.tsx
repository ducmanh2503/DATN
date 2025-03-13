import { createContext, useContext, useState } from "react";

const ComboContext = createContext<any>(null);

export const CombosProvider = ({ children }: { children: React.ReactNode }) => {
    const [quantityCombo, setQuantityCombo] = useState<number | null>(0); // tổng số lượng combo
    const [nameCombo, setNameCombo] = useState([]); // tên combo
    const [totalComboPrice, setTotalComboPrice] = useState<string | null>(null); // tổng số tiền combo
    const [quantityMap, setQuantityMap] = useState<Record<string, number>>({}); // giá trị mặc định của combo

    return (
        <ComboContext.Provider
            value={{
                quantityCombo,
                setQuantityCombo,
                nameCombo,
                setNameCombo,
                totalComboPrice,
                setTotalComboPrice,
                quantityMap,
                setQuantityMap,
            }}
        >
            {children}
        </ComboContext.Provider>
    );
};

export const useComboContext = () => {
    return useContext(ComboContext);
};
