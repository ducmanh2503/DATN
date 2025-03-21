import { createContext, useContext, useEffect, useState } from "react";

const PromotionContext = createContext<any>(null);

export const PromotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [promotionOptions, setPromotionOptions] = useState<string | []>([]); // danh sách mã khuyến mãi
  const [quantityPromotion, setQuantityPromotion] = useState<number | null>(0); // số lượng mã khuyến mãi
  const [totalPriceVoucher, setTotalPriceVoucher] = useState<number>(0); // tổng tiền Voucher
  const [totalPricePoint, setTotalPricePoint] = useState<number>(() => {
    const storedTotalPricePoint = sessionStorage.getItem("totalPricePoint");
    return storedTotalPricePoint ? JSON.parse(storedTotalPricePoint) : 0;
  }); // tổng tiền point
  const [userPoints, setUserPoints] = useState<number>(() => {
    const storedUserPoint = sessionStorage.getItem("userPoints");
    return storedUserPoint ? JSON.parse(storedUserPoint) : 0;
  }); // điểm Point của User
  const [usedPoints, setUsedPoints] = useState<number>(() => {
    const storedUsedPoints = sessionStorage.getItem("usedPoints");
    return storedUsedPoints ? JSON.parse(storedUsedPoints) : 0;
  }); // Lưu điểm đã sử dụng

  const [rankUser, setRankUser] = useState<string>(() => {
    const storedRankUser = sessionStorage.getItem("rankUser");
    return storedRankUser ? JSON.parse(storedRankUser) : "";
  }); // lấy mức rank của user

  useEffect(() => {
    sessionStorage.setItem("userPoints", JSON.stringify(userPoints));
    sessionStorage.setItem("rankUser", JSON.stringify(rankUser));
    sessionStorage.setItem("usedPoints", JSON.stringify(usedPoints));
    sessionStorage.setItem("totalPricePoint", JSON.stringify(totalPricePoint));
  }, [userPoints, rankUser, usedPoints, totalPricePoint]);

  return (
    <PromotionContext.Provider
      value={{
        promotionOptions,
        setPromotionOptions,
        quantityPromotion,
        setQuantityPromotion,
        totalPriceVoucher,
        setTotalPriceVoucher,
        totalPricePoint,
        setTotalPricePoint,
        userPoints,
        setUserPoints,
        usedPoints,
        setUsedPoints,
        rankUser,
        setRankUser,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotionContextContext = () => {
  return useContext(PromotionContext);
};
