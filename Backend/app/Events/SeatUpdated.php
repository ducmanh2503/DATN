<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class SeatUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $roomId;
    public $showTimeId;
    public $seatingMatrix;

    public function __construct($roomId, $showTimeId, $seatingMatrix)
    {
        $this->roomId = $roomId;
        $this->showTimeId = $showTimeId;
        $this->seatingMatrix = $seatingMatrix;
    }

    public function broadcastOn()
    {
        return new Channel('seats.' . $this->roomId . '.' . $this->showTimeId);
    }

    public function broadcastAs()
    {
        return 'seat-loaded';
    }
}
