import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import axios from "axios";
import React, { useEffect, useMemo, useCallback } from "react";
import { SelectFormProps } from "../../../types/interface";

const SelectForm: React.FC<SelectFormProps> = React.memo(
    ({
        queryKey,
        endpoint,
        labelKey = "name_actor",
        valueKey = "name_actor",
        onChange,
        form,
        placeholder = "Please select",
    }) => {
        const { data, refetch } = useQuery({
            queryKey: [queryKey],
            queryFn: async () => {
                const { data } = await axios.get(endpoint);
                console.log("check-3", data);

                return data.map((item: any) => ({
                    label: item[labelKey],
                    value: item[valueKey],
                }));
            },
            enabled: !!endpoint,
        });

        // Memo hóa options để tránh render lại khi không cần thiết
        const options = useMemo(() => data ?? [], [data]);

        // Memo hóa handleChange để tránh tạo lại mỗi lần render
        const handleChange = useCallback(
            (value: string[]) => {
                form?.setFieldsValue({ [queryKey]: value });
                onChange?.(value, queryKey);
            },
            [form, onChange, queryKey]
        );

        return (
            <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder={placeholder}
                onChange={handleChange}
                options={options}
                value={form?.getFieldValue(labelKey)}
            />
        );
    }
);

export default SelectForm;
