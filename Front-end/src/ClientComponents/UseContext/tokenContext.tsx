// import { createContext, useContext, useState } from "react";

// const AuthContext = createContext<any>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [tokenUserId, setTokenUserId] = useState<string | null>(null); // token user

//     return (
//         <AuthContext.Provider
//             value={{
//                 tokenUserId,
//                 setTokenUserId,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuthContext = () => {
//     return useContext(AuthContext);
// };
