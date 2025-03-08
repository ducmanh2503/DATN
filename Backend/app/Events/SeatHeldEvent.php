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


class SeatHeldEvent implements ShouldBroadcastNow
{
    use SerializesModels, InteractsWithSockets;

    public $seats;
    public $userId;

    public function __construct($seats, $userId)
    {
        $this->seats = $seats;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new Channel('seats');
    }

    //định nghĩa tên sự kiện phát đi
    public function broadcastAs()
    {
        return 'seat-held';
    }
}
