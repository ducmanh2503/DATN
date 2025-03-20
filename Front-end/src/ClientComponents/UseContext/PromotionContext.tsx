import { createContext, useContext, useState } from "react";

const PromotionContext = createContext<any>(null);

export const PromotionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [promotionOptions, setPromotionOptions] = useState<string | []>([]); // danh sách mã khuyến mãi
    const [quantityPromotion, setQuantityPromotion] = useState<number | null>(
        0
    ); // số lượng mã khuyến mãi
    const [totalPricePromotion, setTotalPricePromotion] = useState<number>(0); // tổng tiền khuyến mãi
    const [totalPricePoint, setTotalPricePoint] = useState<number>(0); // tổng tiền point
    const [userPoint, setUserPoint] = useState<number>(999); // Point của User
    return (
        <PromotionContext.Provider
            value={{
                promotionOptions,
                setPromotionOptions,
                quantityPromotion,
                setQuantityPromotion,
                totalPricePromotion,
                setTotalPricePromotion,
                totalPricePoint,
                setTotalPricePoint,
                userPoint,
                setUserPoint,
            }}
        >
            {children}
        </PromotionContext.Provider>
    );
};

export const usePromotionContextContext = () => {
    return useContext(PromotionContext);
};
