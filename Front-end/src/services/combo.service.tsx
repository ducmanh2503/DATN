import axios, { AxiosError, CancelTokenSource } from "axios";
import {
  Combo,
  ComboCreateResponse,
  ComboUpdateResponse,
  ComboListResponse,
  ApiError,
} from "../types/combo.types";

const BASE_URL = "http://localhost:8000/api";
export const URL_IMAGE = "http://localhost:8000";

const ENDPOINTS = {
  GET_COMBOS: `${BASE_URL}/combo`,
  GET_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  CREATE_COMBO: `${BASE_URL}/combo`,
  UPDATE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_MULTIPLE_COMBOS: `${BASE_URL}/combo`,
  RESTORE_COMBO: (id: string | number) => `${BASE_URL}/combo/restore/${id}`,
  RESTORE_MULTIPLE_COMBOS: `${BASE_URL}/combo/multiple/restore`,
};

const normalizeId = (id: string | number): string => String(id);

const getAuthToken = () => localStorage.getItem("token") || "";

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
  throw new Error("Lỗi không xác định");
};

// Lấy danh sách combo
export const getCombos = async (
  includeDeleted: boolean = false,
  cancelToken?: CancelTokenSource
): Promise<ComboListResponse> => {
  try {
    const url = includeDeleted
      ? `${ENDPOINTS.GET_COMBOS}?include_deleted=1`
      : ENDPOINTS.GET_COMBOS;
    const response = await axios.get<ComboListResponse>(url, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      cancelToken: cancelToken?.token,
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

// Lấy thông tin một combo
export const getCombo = async (
  id: string | number,
  cancelToken?: CancelTokenSource
): Promise<Combo> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.get<Combo>(ENDPOINTS.GET_COMBO(comboId), {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      cancelToken: cancelToken?.token,
    });
    return { ...response.data, id: normalizeId(response.data.id) };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Tạo combo mới
export const createCombo = async (data: FormData): Promise<ComboCreateResponse> => {
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
      combo: { ...response.data.combo, id: normalizeId(response.data.combo.id) },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Cập nhật combo
export const updateCombo = async (
  id: string | number,
  data: FormData
): Promise<ComboUpdateResponse> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.post<ComboUpdateResponse>(
      `${ENDPOINTS.UPDATE_COMBO(comboId)}?_method=PUT`,
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
      combo: { ...response.data.combo, id: normalizeId(response.data.combo.id) },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Xóa mềm combo
export const deleteCombo = async (id: string | number): Promise<void> => {
  const comboId = normalizeId(id);
  try {
    await axios.delete(ENDPOINTS.DELETE_COMBO(comboId), {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Xóa mềm nhiều combo
export const deleteMultipleCombos = async (
  ids: (string | number)[]
): Promise<void> => {
  try {
    await axios.delete(ENDPOINTS.DELETE_MULTIPLE_COMBOS, {
      data: { ids: ids.map(normalizeId) },
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Khôi phục combo
export const restoreCombo = async (id: string | number): Promise<void> => {
  const comboId = normalizeId(id);
  try {
    await axios.post(ENDPOINTS.RESTORE_COMBO(comboId), null, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Khôi phục nhiều combo
export const restoreMultipleCombos = async (
  ids: (string | number)[]
): Promise<void> => {
  try {
    await axios.post(
      ENDPOINTS.RESTORE_MULTIPLE_COMBOS,
      { ids: ids.map(normalizeId) },
      {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }
    );
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
};