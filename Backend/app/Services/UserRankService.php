<?php

namespace App\Services;

use App\Models\User;

class UserRankService
{
    /**
     * Cập nhật điểm và hạng cho người dùng dựa trên giao dịch.
     *
     * @param int $userId ID của người dùng
     * @param float $totalPrice Tổng số tiền giao dịch
     * @param int|null $bookingId ID của booking (nếu có)
     * @return array|false Trả về thông tin cập nhật hoặc false nếu không tìm thấy user
     */
    public function updateRankAndPoints($userId, $totalPrice, $bookingId = null)
    {
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        // Cập nhật tổng chi tiêu
        $user->total_spent += $totalPrice;

        // Phân hạng
        $oldRank = $user->rank;
        if ($user->total_spent >= 4000000) {
            $user->rank = 'diamond';
            // Tích điểm: 10% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.1 / 1000);
        } elseif ($user->total_spent >= 2000000) {
            $user->rank = 'gold';
            // Tích điểm: 5% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.05 / 1000);
        } else {
            $user->rank = 'regular';
            // Tích điểm: 3% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.03 / 1000);
        }

        $user->points += $pointsEarned;

        // Lưu thay đổi
        $user->save();

        return [
            'points_earned' => $pointsEarned,
            'total_points' => $user->points,
            'rank' => $user->rank,
            'total_spent' => $user->total_spent,
            'rank_changed' => $oldRank !== $user->rank, // Kiểm tra xem hạng có thay đổi không
        ];
    }

    /**
     * Lấy thông tin hạng và điểm của người dùng.
     *
     * @param int $userId ID của người dùng
     * @return array|false Trả về thông tin hoặc false nếu không tìm thấy user
     */
    public function getRankAndPoints($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'total_spent' => $user->total_spent,
            'rank' => $user->rank,
            'points' => $user->points,
        ];
    }
}
