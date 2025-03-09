<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Log;


class SeatHeldEvent implements ShouldBroadcastNow
{
    use SerializesModels, InteractsWithSockets;

    public $seats;
    public $userId;
    public $roomId;
    public $showTimeId;

    public function __construct($seats, $userId, $roomId, $showTimeId)
    {
        $this->seats = $seats;
        $this->userId = $userId;
        $this->roomId = $roomId;
        $this->showTimeId = $showTimeId;
        Log::info('Room ID: ' . $this->roomId); // Sửa thành \Log::info
        Log::info('Show Time ID: ' . $this->showTimeId);
    }

    public function broadcastOn()
    {
        return new Channel('seats'  . $this->roomId . '.' . $this->showTimeId);
    }

    //định nghĩa tên sự kiện phát đi
    public function broadcastAs()
    {
        return 'seat-held';
    }
}
