import { createContext, useContext, useState } from "react";

const FinalPriceContext = createContext<any>(null);

export const FinalPriceProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [totalPrice, setTotalPrice] = useState<number | null>(0); // tổng tiền mua vé

    return (
        <FinalPriceContext.Provider
            value={{
                totalPrice,
                setTotalPrice,
            }}
        >
            {children}
        </FinalPriceContext.Provider>
    );
};

export const useFinalPriceContext = () => {
    return useContext(FinalPriceContext);
};
