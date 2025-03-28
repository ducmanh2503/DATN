import { Select } from "antd";
import clsx from "clsx";
import styles from "./FilterPlayingCinema.module.css";

const FilterPlayingCinema = () => {
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  return (
    <div className="main-base">
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Mới nhất"
        onChange={handleChange}
        options={[
          { value: "Mới nhất", label: "Mới nhất" },
          { value: "Phổ biến", label: "Phổ biến" },
        ]}
      />
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Thể loại"
        onChange={handleChange}
        options={[
          { value: "Tất cả", label: "Tất cả" },
          { value: "Hành động", label: "Hành động" },
          { value: "Tình cảm", label: "Tình cảm" },
          { value: "Kinh dị", label: "Kinh dị" },
          { value: "Viễn tưởng", label: "Viễn tưởng" },
        ]}
      />
      <Select
        className={clsx(styles.selectOption)}
        defaultValue="Rạp"
        onChange={handleChange}
        options={[
          { value: "Rạp 1", label: "Rạp 1" },
          { value: "Rạp 2", label: "Rạp 2" },
        ]}
      />
    </div>
  );
};

export default FilterPlayingCinema;
