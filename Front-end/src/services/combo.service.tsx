<<<<<<< HEAD
import axios from 'axios';
import { 
    Combo, 
    ComboCreateRequest, 
    ComboCreateResponse, 
    ComboUpdateRequest, 
    ComboUpdateResponse, 
    ComboListResponse, 
    ComboDeleteResponse, 
    ComboRestoreResponse, 
    ApiError 
} from '../types/combo.types';

const BASE_URL = 'http://localhost:8000/api';

const ENDPOINTS = {
    GET_COMBOS: `${BASE_URL}/combo`,
    GET_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
    CREATE_COMBO: `${BASE_URL}/combo`,
    UPDATE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
    DELETE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
    DELETE_MULTIPLE: `${BASE_URL}/combo`,
    RESTORE_COMBO: (id: string | number) => `${BASE_URL}/combo/restore/${id}`,
    FORCE_DELETE: (id: string | number) => `${BASE_URL}/combo/force/${id}`,
    RESTORE_MULTIPLE: `${BASE_URL}/combo/multiple/restore`,
=======
import axios from "axios";
import {
  Combo,
  ComboCreateRequest,
  ComboCreateResponse,
  ComboUpdateRequest,
  ComboUpdateResponse,
  ComboListResponse,
  ComboDeleteResponse,
  ComboRestoreResponse,
  ApiError,
} from "../types/combo.types";

const BASE_URL = "http://localhost:8000/api";

const ENDPOINTS = {
  GET_COMBOS: `${BASE_URL}/combo`,
  GET_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  CREATE_COMBO: `${BASE_URL}/combo`,
  UPDATE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_MULTIPLE: `${BASE_URL}/combo`,
  RESTORE_COMBO: (id: string | number) => `${BASE_URL}/combo/restore/${id}`,
  FORCE_DELETE: (id: string | number) => `${BASE_URL}/combo/force/${id}`,
  RESTORE_MULTIPLE: `${BASE_URL}/combo/multiple/restore`,
>>>>>>> main
};

const normalizeId = (id: string | number): string => String(id);

// Lấy token từ localStorage (nếu cần auth)
<<<<<<< HEAD
const getAuthToken = () => localStorage.getItem('token');

const handleApiError = (error: any): never => {
    if (axios.isAxiosError(error) && error.response) {
        const apiError: ApiError = {
            error: error.response.data.error || 'Đã xảy ra lỗi',
            message: error.response.data.message || error.message,
            details: error.response.data.details,
            status: error.response.status,
        };
        throw apiError;
    }
    throw error;
};

export const getCombos = async (includeDeleted: boolean = false): Promise<ComboListResponse> => {
    try {
        const url = includeDeleted ? `${ENDPOINTS.GET_COMBOS}?include_deleted=1` : ENDPOINTS.GET_COMBOS;
        const response = await axios.get<ComboListResponse>(url, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return {
            ...response.data,
            combo: response.data.combo.map(combo => ({
                ...combo,
                id: normalizeId(combo.id),
            })),
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getCombo = async (id: string | number): Promise<Combo> => {
    const comboId = normalizeId(id);
    try {
        const response = await axios.get<Combo>(ENDPOINTS.GET_COMBO(comboId), {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return { ...response.data, id: normalizeId(response.data.id) };
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createCombo = async (data: FormData): Promise<ComboCreateResponse> => {
    try {
        const response = await axios.post<ComboCreateResponse>(
            ENDPOINTS.CREATE_COMBO,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return {
            ...response.data,
            combo: { ...response.data.combo, id: normalizeId(response.data.combo.id) },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateCombo = async (
    id: string | number,
    data: ComboUpdateRequest | FormData
): Promise<ComboUpdateResponse> => {
    const comboId = normalizeId(id);
    try {
        const isFormData = data instanceof FormData;
        const response = await axios.put<ComboUpdateResponse>(
            ENDPOINTS.UPDATE_COMBO(comboId),
            data,
            {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            }
        );
        return {
            ...response.data,
            combo: { ...response.data.combo, id: normalizeId(response.data.combo.id) },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteCombo = async (id: string | number): Promise<ComboDeleteResponse> => {
    const comboId = normalizeId(id);
    try {
        const response = await axios.delete<ComboDeleteResponse>(ENDPOINTS.DELETE_COMBO(comboId), {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteMultipleCombos = async (ids: (string | number)[]): Promise<ComboDeleteResponse> => {
    try {
        const response = await axios.delete<ComboDeleteResponse>(ENDPOINTS.DELETE_MULTIPLE, {
            data: { ids },
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const restoreCombo = async (id: string | number): Promise<ComboRestoreResponse> => {
    const comboId = normalizeId(id);
    try {
        const response = await axios.post<ComboRestoreResponse>(ENDPOINTS.RESTORE_COMBO(comboId), {}, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const restoreMultipleCombos = async (ids: (string | number)[]): Promise<ComboRestoreResponse> => {
    try {
        const response = await axios.post<ComboRestoreResponse>(ENDPOINTS.RESTORE_MULTIPLE, { ids }, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const permanentDeleteCombo = async (id: string | number): Promise<ComboDeleteResponse> => {
    const comboId = normalizeId(id);
    try {
        const response = await axios.delete<ComboDeleteResponse>(ENDPOINTS.FORCE_DELETE(comboId), {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export default {
    getCombos,
    getCombo,
    createCombo,
    updateCombo,
    deleteCombo,
    deleteMultipleCombos,
    restoreCombo,
    restoreMultipleCombos,
    permanentDeleteCombo,
};
=======
const getAuthToken = () => localStorage.getItem("token");

const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error) && error.response) {
    const apiError: ApiError = {
      error: error.response.data.error || "Đã xảy ra lỗi",
      message: error.response.data.message || error.message,
      details: error.response.data.details,
      status: error.response.status,
    };
    throw apiError;
  }
  throw error;
};

export const getCombos = async (
  includeDeleted: boolean = false
): Promise<ComboListResponse> => {
  try {
    const url = includeDeleted
      ? `${ENDPOINTS.GET_COMBOS}?include_deleted=1`
      : ENDPOINTS.GET_COMBOS;
    const response = await axios.get<ComboListResponse>(url, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return {
      ...response.data,
      combo: response.data.combo.map((combo) => ({
        ...combo,
        id: normalizeId(combo.id),
      })),
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getCombo = async (id: string | number): Promise<Combo> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.get<Combo>(ENDPOINTS.GET_COMBO(comboId), {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return { ...response.data, id: normalizeId(response.data.id) };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createCombo = async (
  data: FormData
): Promise<ComboCreateResponse> => {
  try {
    const response = await axios.post<ComboCreateResponse>(
      ENDPOINTS.CREATE_COMBO,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return {
      ...response.data,
      combo: {
        ...response.data.combo,
        id: normalizeId(response.data.combo.id),
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateCombo = async (
  id: string | number,
  data: ComboUpdateRequest | FormData
): Promise<ComboUpdateResponse> => {
  const comboId = normalizeId(id);
  try {
    const isFormData = data instanceof FormData;
    const response = await axios.put<ComboUpdateResponse>(
      ENDPOINTS.UPDATE_COMBO(comboId),
      data,
      {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return {
      ...response.data,
      combo: {
        ...response.data.combo,
        id: normalizeId(response.data.combo.id),
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteCombo = async (
  id: string | number
): Promise<ComboDeleteResponse> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.delete<ComboDeleteResponse>(
      ENDPOINTS.DELETE_COMBO(comboId),
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteMultipleCombos = async (
  ids: (string | number)[]
): Promise<ComboDeleteResponse> => {
  try {
    const response = await axios.delete<ComboDeleteResponse>(
      ENDPOINTS.DELETE_MULTIPLE,
      {
        data: { ids },
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const restoreCombo = async (
  id: string | number
): Promise<ComboRestoreResponse> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.post<ComboRestoreResponse>(
      ENDPOINTS.RESTORE_COMBO(comboId),
      {},
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const restoreMultipleCombos = async (
  ids: (string | number)[]
): Promise<ComboRestoreResponse> => {
  try {
    const response = await axios.post<ComboRestoreResponse>(
      ENDPOINTS.RESTORE_MULTIPLE,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const permanentDeleteCombo = async (
  id: string | number
): Promise<ComboDeleteResponse> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.delete<ComboDeleteResponse>(
      ENDPOINTS.FORCE_DELETE(comboId),
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getCombos,
  getCombo,
  createCombo,
  updateCombo,
  deleteCombo,
  deleteMultipleCombos,
  restoreCombo,
  restoreMultipleCombos,
  permanentDeleteCombo,
};
>>>>>>> main
