import { createContext, useContext, useState } from "react";

const StepsContext = createContext<any>(null);

export const StepsProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1); // step payment
  const [calendarShowtimeID, setCalendarShowtimeID] = useState<string | null>(
    null
  ); // id lịch chiếu của suất chiếu
  const [userIdFromShowtimes, setUserIdFromShowtimes] = useState<number | null>(
    0
  ); // user ID
  const [dataDetailFilm, setDataDetailFilm] = useState({
    title: "",
    language: "",
    rated: "",
  }); // lưu tạm thời data 1 phim
  const [paymentType, setPaymentType] = useState<number | null>(); //hình thức thanh toán

  return (
    <StepsContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        calendarShowtimeID,
        setCalendarShowtimeID,
        userIdFromShowtimes,
        setUserIdFromShowtimes,
        dataDetailFilm,
        setDataDetailFilm,
        paymentType,
        setPaymentType,
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};

export const useStepsContext = () => {
  return useContext(StepsContext);
};
