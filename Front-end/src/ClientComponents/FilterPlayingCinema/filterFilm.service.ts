import axios from 'axios';

interface FilterOptions {
  sortBy?: string;
  genre?: string;
  cinema?: string;
}

export const fetchFilteredMovies = async (options: FilterOptions = {}) => {
  try {
    // Lấy danh sách phim từ API
    const { data } = await axios.get("http://localhost:8000/api/movies-index");
    
    let filteredMovies = [...data.now_showing];
    
    // Lọc theo thể loại
    if (options.genre && options.genre !== "Tất cả") {
      filteredMovies = filteredMovies.filter((movie: any) => 
        movie.genres.some((g: any) => g.name_genre === options.genre)
      );
    }
    
    // Lọc theo rạp
    if (options.cinema && options.cinema !== "Tất cả") {
      filteredMovies = filteredMovies.filter((movie: any) => 
        movie.cinemas?.some((c: any) => c.name === options.cinema) || false
      );
    }
    
    // Sắp xếp
    if (options.sortBy === "Mới nhất") {
      filteredMovies.sort((a: any, b: any) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      );
    } else if (options.sortBy === "Phổ biến") {
      filteredMovies.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
    }
    
    return filteredMovies.map((movie: any) => ({
      ...movie,
      key: movie.id
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim:", error);
    return [];
  }
};
