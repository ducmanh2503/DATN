<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMoviesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // '*.title' => 'required|string|max:255|unique:movies,title',
            // '*.director' => 'required|string|max:255',
            // '*.actors' => 'required|string',
            // '*.genre' => 'required|string|max:100',
            // '*.duration' => 'required|date_format:Y-m-d',
            // '*.time' => 'required|integer',
            // '*.language' => 'required|string|max:100',
            // '*.rated' => 'required|string|max:255',
            // '*.trailer' => 'nullable|string|unique:movies,trailer',
            // '*.description' => 'nullable|string',
            // '*.poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            // '*.movie_status' => 'required|in:coming_soon,now_showing',
        ];
    }
}
