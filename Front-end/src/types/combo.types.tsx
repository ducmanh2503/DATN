export interface Combo {
<<<<<<< HEAD
    id: string | number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    image: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface ComboCreateRequest {
    name: string;
    description: string;
    quantity: number;
    price: number;
    image: string | File;
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
    image?: string | File;
}

export interface ComboUpdateResponse {
    message: string;
    combo: Combo;
}

export interface ComboListResponse {
    message?: string;
    combo: Combo[]; // Đổi từ 'combos' thành 'combo' để khớp với backend
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
=======
  id: string | number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ComboCreateRequest {
  name: string;
  description: string;
  quantity: number;
  price: number;
  image: string | File;
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
  image?: string | File;
}

export interface ComboUpdateResponse {
  message: string;
  combo: Combo;
}

export interface ComboListResponse {
  message?: string;
  combo: Combo[]; // Đổi từ 'combos' thành 'combo' để khớp với backend
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
>>>>>>> main
