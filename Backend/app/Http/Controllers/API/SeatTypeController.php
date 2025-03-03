<?php

namespace App\Http\Controllers\API;

use App\Models\SeatType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SeatTypeController extends Controller
{
    public function index()
    {
        $seatTypes = SeatType::all(['id', 'name', 'price']);
        return response()->json($seatTypes, 200);
    }
}
