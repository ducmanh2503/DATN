import "./BoxDay.css";

const BoxDay = ({ date, number, searchDate, onClick }: any) => {
    return (
        <div
            className={`box-days ${searchDate === date ? "active-btn" : ""}`}
            onClick={onClick}
        >
            <div className="title-days">{number}</div>
            <div className="number-days">{date}</div>
        </div>
    );
};

export default BoxDay;
