import { CombosProvider } from "./CombosContext";
import { FilmsProvider } from "./FIlmContext";
import { FinalPriceProvider } from "./FinalPriceContext";
import { SeatsProvider } from "./SeatsContext";
import { StepsProvider } from "./StepsContext";
import { AuthProvider } from "./TokenContext";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <FilmsProvider>
                <SeatsProvider>
                    <CombosProvider>
                        <StepsProvider>
                            <FinalPriceProvider>{children}</FinalPriceProvider>
                        </StepsProvider>
                    </CombosProvider>
                </SeatsProvider>
            </FilmsProvider>
        </AuthProvider>
    );
};
