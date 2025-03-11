import { Link } from "react-router-dom";
import clsx from "clsx";
import styles from "./BoxNumbers.module.css";
import { useMessageContext } from "../../UseContext/ContextState";
const BoxNumbers = ({ time, onClick }: any) => {
    const { filmId } = useMessageContext();
    return (
        <Link
            to={`/booking/${filmId}`}
            className={clsx(styles.boxNumbers)}
            onClick={() => onClick()}
        >
            {time}
        </Link>
    );
};

export default BoxNumbers;
