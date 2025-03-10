// giar<div className="matrix-seat">
//                             {matrix.map((row, rowIndex) => (
//                                 <div key={rowIndex} className="row-seats">
//                                     <div className="col-seats">
//                                         {String.fromCharCode(65 + rowIndex)}
//                                     </div>
//                                     {row.map((seat, colIndex) => {
//                                         const isSelected = nameSeats.includes(
//                                             seat.id
//                                         );
//                                         return (
//                                             <button
//                                                 className="seat-name"
//                                                 key={seat.id}
//                                                 onClick={() =>
//                                                     handleSeatClick(seat)
//                                                 }
//                                                 style={{
//                                                     background: isSelected
//                                                         ? "#52c41a" // Màu xanh lá khi được chọn
//                                                         : "transparent", // Màu mặc định
//                                                     border:
//                                                         seat.type === "vip"
//                                                             ? "1px solid #1890ff" // Màu xanh dương cho ghế VIP
//                                                             : seat.type ===
//                                                               "sweatbox"
//                                                             ? "1px solid #f5222d" // Màu đỏ cho ghế sweatbox
//                                                             : "1px solid #8c8c8c",
//                                                     color:
//                                                         seat.type === "vip"
//                                                             ? "#1890ff"
//                                                             : seat.type ===
//                                                               "sweatbox"
//                                                             ? "#f5222d"
//                                                             : "black",
//                                                 }}
//                                             >
//                                                 {colIndex + 1}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             ))}
//                         </div>
