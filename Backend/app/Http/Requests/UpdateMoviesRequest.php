<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMoviesRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255', Rule::unique('movies', 'title')->ignore($this->route('movie'))],
            'director' => ['required', 'string', 'max:255'],
            'actors' => ['required', 'string'],
            'genre' => ['required', 'string', 'max:100'],
            'duration' => ['required', 'integer', 'min:1'],
            'time' => ['required', 'integer', 'min:1'],
            'language' => ['required', 'string', 'max:100'],
            'rated' => ['required', 'string', 'max:255'],
            'trailer' => ['nullable', 'url', Rule::unique('movies', 'trailer')->ignore($this->route('movie'))],
            'description' => ['nullable', 'string'],
            'poster' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048', Rule::unique('movies', 'poster')->ignore($this->route('movie'))],
            'movie_status' => ['required', Rule::in(['coming_soon', 'now_showing'])],
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Tiêu đề phim không được để trống',
            'title.unique' => 'Tiêu đề phim đã tồn tại',
            'director.required' => 'Tên đạo diễn không được để trống',
            'actors.required' => 'Danh sách diễn viên không được để trống',
            'genre.required' => 'Thể loại không được để trống',
            'duration.required' => 'Thời lượng phim không được để trống',
            'duration.integer' => 'Thời lượng phim phải là số nguyên',
            'duration.min' => 'Thời lượng phim phải lớn hơn 0 phút',
            'time.required' => 'Thời gian chiếu không được để trống',
            'time.integer' => 'Thời gian chiếu phải là số nguyên',
            'time.min' => 'Thời gian chiếu phải lớn hơn 0 phút',
            'language.required' => 'Ngôn ngữ không được để trống',
            'rated.required' => 'Đánh giá không được để trống',
            'trailer.url' => 'Trailer phải là một URL hợp lệ',
            'trailer.unique' => 'URL trailer đã tồn tại',
            'poster.image' => 'Poster phải là một file ảnh',
            'poster.mimes' => 'Ảnh poster phải có định dạng jpeg, png, jpg, gif',
            'poster.max' => 'Ảnh poster không được vượt quá 2MB',
            'poster.unique' => 'Ảnh poster đã tồn tại',
            'movie_status.required' => 'Trạng thái phim không được để trống',
            'movie_status.in' => 'Trạng thái phim phải là "coming_soon" hoặc "now_showing"',
        ];
    }
}
