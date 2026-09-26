import api from "../../../utils/api";

export interface PendingApplicationItem {
  applicationId: string;
  profileId: string;
  profileName: string;
  requestType: "coach" | "venue-owner";
  documentUrl: string;
}

export interface PendingApplicationsResponse {
  success: boolean;
  data: PendingApplicationItem[];
  pagination: {
    limit: number;
    lastApplicationId: string | null;
    hasNext: boolean;
  };
}

export const adminApi = {
  getPendingApplications: async (lastApplicationId?: string) => {
    let url = "/v1/admin/applications";
    if (lastApplicationId) {
      url = url + `?lastApplicationId=${lastApplicationId}`;
    }
    const response = await api.get<PendingApplicationsResponse>(url);
    return response.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: "approved" | "rejected",
  ) => {
    const response = await api.patch<{ success: boolean; data: any }>(
      `/v1/admin/applications/${applicationId}`,
      { status },
    );
    return response.data;
  },
};
