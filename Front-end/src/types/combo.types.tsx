export interface Combo {
  id: string | number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string; // Vẫn là string vì server trả về URL sau khi upload
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ComboCreateRequest {
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: File; // Thay string thành File
}

export interface ComboCreateResponse {
  message: string;
  combo: Combo;
}

export interface ComboUpdateRequest {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  image?: File; // Thay string thành File
}

export interface ComboUpdateResponse {
  message: string;
  combo: Combo;
}

export interface ComboListResponse {
  message?: string;
  combo: Combo[];
}

export interface ComboDeleteRequest {
  ids: (string | number)[];
}

export interface ComboDeleteResponse {
  message: string;
  deletedCount?: number;
  deletedIds?: (string | number)[];
}

export interface ComboRestoreResponse {
  message: string;
  combo?: Combo;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
  status?: number;
}