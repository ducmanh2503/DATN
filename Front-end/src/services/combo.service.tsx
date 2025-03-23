import axios from "axios";
import {
  Combo,
  ComboCreateRequest,
  ComboCreateResponse,
  ComboUpdateRequest,
  ComboUpdateResponse,
  ComboListResponse,
  ApiError,
} from "../types/combo.types";

const BASE_URL = "http://localhost:8000/api";

const ENDPOINTS = {
  GET_COMBOS: `${BASE_URL}/combo`,
  GET_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  CREATE_COMBO: `${BASE_URL}/combo`,
  UPDATE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_COMBO: (id: string | number) => `${BASE_URL}/combo/${id}`,
  DELETE_MULTIPLE_COMBOS: `${BASE_URL}/combo`, // Endpoint cho xóa mềm nhiều
  RESTORE_COMBO: (id: string | number) => `${BASE_URL}/combo/restore/${id}`,
  RESTORE_MULTIPLE_COMBOS: `${BASE_URL}/combo/multiple/restore`, // Endpoint cho khôi phục nhiều
  FORCE_DELETE: (id: string | number) => `${BASE_URL}/combo/force/${id}`, // Endpoint cho xóa vĩnh viễn
  FORCE_DELETE_MULTIPLE: `${BASE_URL}/combos/force-delete-multiple`, // Endpoint cho xóa vĩnh viễn nhiều
};

const normalizeId = (id: string | number): string => String(id);

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
  data: ComboCreateRequest
): Promise<ComboCreateResponse> => {
  try {
    const response = await axios.post<ComboCreateResponse>(
      ENDPOINTS.CREATE_COMBO,
      data,
      {
        headers: {
          "Content-Type": "application/json",
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
  data: ComboUpdateRequest
): Promise<ComboUpdateResponse> => {
  const comboId = normalizeId(id);
  try {
    const response = await axios.put<ComboUpdateResponse>(
      ENDPOINTS.UPDATE_COMBO(comboId),
      data,
      {
        headers: {
          "Content-Type": "application/json",
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

export const deleteCombo = async (id: string | number): Promise<void> => {
  const comboId = normalizeId(id);
  try {
    await axios.delete(ENDPOINTS.DELETE_COMBO(comboId), {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteMultipleCombos = async (ids: (string | number)[]): Promise<void> => {
  try {
    await axios.delete(ENDPOINTS.DELETE_MULTIPLE_COMBOS, {
      data: { ids }, // Gửi data trong body của DELETE request
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const restoreCombo = async (id: string | number): Promise<void> => {
  const comboId = normalizeId(id);
  try {
    await axios.post(ENDPOINTS.RESTORE_COMBO(comboId), null, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const restoreMultipleCombos = async (ids: (string | number)[]): Promise<void> => {
  try {
    await axios.post(ENDPOINTS.RESTORE_MULTIPLE_COMBOS, { ids }, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const permanentDeleteCombo = async (id: string | number): Promise<void> => {
  const comboId = normalizeId(id);
  try {
    await axios.delete(ENDPOINTS.FORCE_DELETE(comboId), {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const forceDeleteMultipleCombos = async (ids: (string | number)[]): Promise<void> => {
  try {
    await axios.delete(ENDPOINTS.FORCE_DELETE_MULTIPLE, {
      data: { ids }, // Gửi data trong body của DELETE request
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
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
  forceDeleteMultipleCombos,
};