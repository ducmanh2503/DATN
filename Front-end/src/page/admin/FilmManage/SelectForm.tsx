// import { useQuery } from "@tanstack/react-query";
// import { Select } from "antd";
// import axios from "axios";
// import React, { useEffect } from "react";
// import { SelectFormProps } from "../../../types/interface";

// const SelectForm: React.FC<SelectFormProps> = ({
//     queryKey,
//     endpoint,
//     labelKey = "name_director",
//     dataName,
//     refetchDataName,
//     onChange,
//     form,
// }) => {
//     const { data, refetch } = useQuery({
//         queryKey: [queryKey],
//         queryFn: async () => {
//             const { data } = await axios.get(endpoint ?? "");
//             return data.map((item: any) => ({
//                 label: item[labelKey],
//                 value: item.id,
//             }));
//         },
//         enabled: false,
//     });

//     // Ưu tiên dữ liệu từ props nếu có, nếu không dùng từ query
//     const options = dataName ?? data ?? [];

//     // Fetch khi endpoint thay đổi và không có dataName
//     useEffect(() => {
//         if (!dataName && endpoint && refetchDataName) {
//             refetchDataName();
//         }
//     }, [dataName, endpoint, refetch]);

//     // Xử lý khi thay đổi lựa chọn
//     const handleSelectChange = (value: string[], fieldName: string) => {
//         form.setFieldsValue({ [fieldName]: value });
//     };

//     return (
//         <Select
//             mode="multiple"
//             allowClear
//             style={{ width: "100%" }}
//             placeholder="Please select"
//             onChange={handleSelectChange}
//             options={options}
//         />
//     );
// };

// export default SelectForm;
