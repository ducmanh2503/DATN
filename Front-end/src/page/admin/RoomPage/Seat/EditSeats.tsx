import { Button, Modal } from "antd";
import React from "react";
import SeatsForm from "./SeatsForm";

interface EditSeatsProps {
    isModalOpen: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    selectedSeat: { row: string; col: string; id: number; type: string } | null;
}

const EditSeats: React.FC<EditSeatsProps> = ({
    isModalOpen,
    handleOk,
    handleCancel,
    selectedSeat,
}) => {
    return (
        <>
            {selectedSeat && (
                <SeatsForm
                    isEditing={true}
                    onDelete={true}
                    seatData={selectedSeat}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                    isModalOpen={isModalOpen}
                />
            )}
        </>
    );
};

export default EditSeats;
