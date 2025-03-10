import { useMessageContext } from "../../UseContext/ContextState";
import "./BoxNumbers.css";
import { Link } from "react-router-dom";
const BoxNumbers = ({ time, onClick }: any) => {
    const { filmId } = useMessageContext();
    return (
        <Link
            to={`/booking/${filmId}`}
            className="box-numbers"
            onClick={() => onClick()}
        >
            {time}
        </Link>
    );
};

export default BoxNumbers;
