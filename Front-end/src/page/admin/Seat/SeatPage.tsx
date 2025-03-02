// src/page/admin/SeatPage/SeatPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Button, Table, Modal, message, Spin, Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import seatService from '../../../services/seat.service';
import { SeatingMatrix, SeatMatrixItem, SeatCreateRequest, SeatUpdateRequest, TableDataSource } from '../../../types/seat.types';
import SeatForm from '../../../AdminComponents/seat/SeatForm'; // Import default, đã kiểm tra đường dẫn
import './SeatPage.css';

const { Content } = Layout; // Chỉ cần import Content từ Layout, không cần từ Collapse

const SeatPage: React.FC = () => {
    const [seats, setSeats] = useState<SeatingMatrix>({});
    const [roomId, setRoomId] = useState<number>(1); // Mặc định roomId là 1, có thể thay đổi
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [seatTypes, setSeatTypes] = useState<{ id: number; name: string; price: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSeats();
        fetchSeatTypes();
    }, [roomId]);

    const fetchSeats = async () => {
        setLoading(true);
        try {
            const data = await seatService.getSeatsByRoom(roomId);
            setSeats(data);
        } catch (error) {
            message.error((error as { error?: string }).error || 'Lỗi khi tải danh sách ghế');
        } finally {
            setLoading(false);
        }
    };

    const fetchSeatTypes = async () => {
        setLoading(true);
        try {
            const response = await seatService.getSeatTypes();
            setSeatTypes(response);
        } catch (error) {
            message.error('Lỗi khi tải danh sách loại ghế');
            setSeatTypes([
                { id: 1, name: 'Thường', price: 50000 },
                { id: 2, name: 'VIP', price: 100000 },
                { id: 3, name: 'Sweetbox', price: 150000 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSeatStatus = async (seatId: number, newStatus: 'available' | 'booked') => {
        setLoading(true);
        const updateRequest: SeatUpdateRequest = { seat_id: seatId, seat_status: newStatus };
        try {
            await seatService.updateSeatStatus([updateRequest]);
            message.success('Cập nhật trạng thái ghế thành công');
            fetchSeats();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái ghế');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSeats = async (newSeats: SeatCreateRequest[]) => {
        setLoading(true);
        try {
            await seatService.createSeats(newSeats);
            message.success('Thêm ghế mới thành công');
            setIsModalOpen(false);
            fetchSeats();
        } catch (error) {
            message.error('Lỗi khi thêm ghế mới');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSeat = async (seatId: number) => {
        setLoading(true);
        try {
            await seatService.deleteSeat(seatId);
            message.success('Xóa ghế thành công');
            fetchSeats();
        } catch (error) {
            message.error('Lỗi khi xóa ghế: ' + (error as { error?: string }).error || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllSeats = async () => {
        setLoading(true);
        try {
            await seatService.deleteAllSeatsInRoom(roomId);
            message.success('Xóa tất cả ghế trong phòng thành công');
            fetchSeats();
        } catch (error) {
            message.error('Lỗi khi xóa tất cả ghế: ' + (error as { error?: string }).error || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Nhóm ghế theo hàng (row) để hiển thị trong Collapse
    const groupedSeats = Object.entries(seats).map(([row, columns]) => ({
        row,
        seats: Object.values(columns).sort((a, b) => {
            const getColumnNumber = (seatCode: string): number => {
                const numberMatch = seatCode.match(/\d+$/);
                return numberMatch ? parseInt(numberMatch[0], 10) : 0;
            };
            return getColumnNumber(a.seatCode) - getColumnNumber(b.seatCode);
        }),
    }));

    const columns = [
        { 
            title: 'Hàng', 
            dataIndex: 'row', 
            key: 'row',
            render: (row: string) => row, // Hiển thị tên hàng (VD: A, B, C)
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_: any, record: { row: string, seats: SeatMatrixItem[] }) => (
                <Button
                    onClick={() => {
                        Modal.confirm({
                            title: 'Xóa tất cả ghế trong hàng này?',
                            content: `Bạn có chắc muốn xóa tất cả ghế trong hàng ${record.row}?`,
                            okText: 'Xóa',
                            cancelText: 'Hủy',
                            onOk: () => handleDeleteRowSeats(record.row),
                            okButtonProps: { style: { background: 'var(--normal-rank)', color: 'var(--word-color)' } },
                        });
                    }}
                    style={{ background: 'var(--normal-rank)', color: 'var(--word-color)' }}
                    loading={loading}
                    disabled={loading}
                >
                    Xóa Hàng
                </Button>
            ),
        },
    ];

    const handleDeleteRowSeats = async (row: string) => {
        setLoading(true);
        try {
            const seatsToDelete = Object.values(seats[row] || {}).map(seat => seat.id);
            for (const seatId of seatsToDelete) {
                await seatService.deleteSeat(seatId);
            }
            message.success(`Xóa tất cả ghế trong hàng ${row} thành công`);
            fetchSeats();
        } catch (error) {
            message.error(`Lỗi khi xóa ghế trong hàng ${row}: ` + (error as { error?: string }).error || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const dataSource: TableDataSource[] = groupedSeats.map(group => ({
        key: group.row,
        row: group.row,
    }));

    // Điều chỉnh phân trang để hiển thị đúng và phù hợp hơn
    const paginationConfig = {
        pageSize: 10, // Số lượng mục (hàng) trên mỗi trang
        showSizeChanger: true, // Cho phép thay đổi số lượng mục trên trang
        pageSizeOptions: ['10', '20', '50'], // Các tùy chọn số lượng mục
        showQuickJumper: true, // Cho phép nhảy nhanh đến trang
        total: dataSource.length, // Tổng số hàng
        showTotal: (total: number, range: [number, number]) => `Hiển thị ${range[0]}-${range[1]} trong ${total} hàng`, // Hiển thị thông tin tổng số
    };

    return (
        <Layout className="full-page-layout">
            <Content className="full-page-content">
                <Spin spinning={loading}>
                    <Breadcrumb
                        items={[
                            { title: 'Trang quản lý ghế ngồi' },
                            { title: 'Hiển thị danh sách ghế trong rạp, từng phòng chiếu' },
                        ]}
                    />
                    <div className="seat-page-header">
                        <h2>Quản Lý Ghế Ngồi</h2>
                        <div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                style={{ background: 'var(--backgroud-product)', color: 'var(--word-color)', marginRight: 8 }}
                                loading={loading}
                                disabled={loading}
                            >
                                Thêm Ghế Mới
                            </Button>
                            <Button
                                onClick={handleDeleteAllSeats}
                                style={{ background: '#ff4d4f', color: 'var(--word-color)' }}
                                loading={loading}
                                disabled={loading}
                            >
                                Xóa Tất Cả Ghế
                            </Button>
                        </div>
                    </div>
                    <Table 
                        columns={columns} 
                        dataSource={dataSource} 
                        pagination={paginationConfig} 
                        className="full-page-table" 
                        expandable={{
                            expandedRowRender: (record) => (
                                <Collapse
                                    defaultActiveKey={['1']}
                                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                    style={{ background: 'var(--mainBase-color)', border: '1px solid var(--border-color)' }}
                                >
                                    <Collapse.Panel header={`Chi tiết ghế trong hàng ${record.row}`} key="1">
                                        <Table
                                            columns={[
                                                { title: 'Mã Ghế', dataIndex: 'seatCode', key: 'seatCode' },
                                                { title: 'Loại Ghế', dataIndex: 'type', key: 'type' },
                                                { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
                                                { title: 'Giá', dataIndex: 'price', key: 'price' },
                                                {
                                                    title: 'Hành Động',
                                                    key: 'action',
                                                    render: (seat: SeatMatrixItem) => (
                                                        <>
                                                            <Button
                                                                onClick={() => handleUpdateSeatStatus(seat.id, seat.status === 'available' ? 'booked' : 'available')}
                                                                style={{ background: 'var(--primary-color)', color: 'var(--word-color)', marginRight: 8 }}
                                                                loading={loading}
                                                                disabled={loading}
                                                            >
                                                                {seat.status === 'available' ? 'Đặt' : 'Hủy Đặt'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteSeat(seat.id)}
                                                                style={{ background: 'var(--normal-rank)', color: 'var(--word-color)' }}
                                                                loading={loading}
                                                                disabled={loading}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </>
                                                    ),
                                                },
                                            ]}
                                            dataSource={seats[record.row] ? Object.values(seats[record.row]).map(seat => ({
                                                ...seat,
                                                key: seat.id,
                                            })) : []}
                                            pagination={false} // Không sử dụng phân trang cho bảng con
                                            size="small"
                                        />
                                    </Collapse.Panel>
                                </Collapse>
                            ),
                            rowExpandable: (record) => Object.keys(seats[record.row] || {}).length > 0, // Chỉ hiển thị nếu có ghế trong hàng
                        }}
                    />
                    <Modal
                        title="Thêm Ghế Mới"
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                    >
                        <SeatForm onSubmit={handleCreateSeats} roomId={roomId} seatTypes={seatTypes} />
                    </Modal>
                </Spin>
            </Content>
        </Layout>
    );
};

export default SeatPage;