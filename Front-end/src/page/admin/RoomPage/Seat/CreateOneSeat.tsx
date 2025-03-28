import { Button, Form, Input, Modal, Select, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useState } from "react";
import SeatForm from "../../../../AdminComponents/seat/SeatForm";
import SeatsForm from "./SeatsForm";

const CreateOneSeat = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Thêm mới ghế
            </Button>
            <SeatsForm
                isEditing={false}
                onDelete={false}
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
            ></SeatsForm>
        </>
    );
};

export default CreateOneSeat;
