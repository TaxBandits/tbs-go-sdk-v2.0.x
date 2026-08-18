import api from "../api/client";
import {
  Payer,
  DBADetail,
  BusinessListResponse,
  BusinessGetResponse,
  BusinessCreateResponse,
  BusinessDeleteResponse,
  BusinessStatusResponse,
  DBAListResponse,
  DBAActionResponse,
  DBADeleteResponse,
} from "../types";

export const payerService = {
  savePayer: async (payerData: { Businesses: Payer[] }) => {
    console.log(payerData);
    console.log(api);
    return api.post<BusinessCreateResponse>(
      "/business/create",
      payerData,
    ) as any as Promise<BusinessCreateResponse>;
  },
  saveDBA: async (dbaData: { DBADetails: DBADetail[] }) => {
    return api.post<{ success: boolean; data: any }>("/dba", dbaData) as any;
  },
  getBusinesses: async (params: {
    last4digit?: string;
    payername?: string;
    page?: number;
    pagesize?: number;
    fromdate?: string;
    todate?: string;
  }) => {
    return api.get<BusinessListResponse>("/business/list", {
      params,
    }) as any as Promise<BusinessListResponse>;
  },
  getBusinessById: async (businessId: string) => {
    return api.get<BusinessGetResponse>("/business/get", {
      params: { businessid: businessId },
    }) as any as Promise<BusinessGetResponse>;
  },
  listDBA: async (params: {
    businessId: string;
    page?: number;
    pagesize?: number;
  }) => {
    const queryParams = {
      businessid: params.businessId,
      page: params.page,
      pagesize: params.pagesize,
    };
    return api.get<DBAListResponse>("/business/listdba", {
      params: queryParams,
    }) as any as Promise<DBAListResponse>;
  },
  addDBA: async (dbaData: any) => {
    return api.post<DBAActionResponse>(
      "/business/adddba",
      dbaData,
    ) as any as Promise<DBAActionResponse>;
  },
  updateDBA: async (dbaData: any) => {
    return api.put<DBAActionResponse>(
      "/business/updatedba",
      dbaData,
    ) as any as Promise<DBAActionResponse>;
  },
  deleteDBA: async (businessId: string, dbaIds: string) => {
    return api.delete<DBADeleteResponse>("/business/deletedba", {
      params: { businessid: businessId, dbaids: dbaIds },
    }) as any as Promise<DBADeleteResponse>;
  },
  updatePayer: async (payerData: { Businesses: Payer[] }) => {
    return api.put<BusinessCreateResponse>(
      "/business/update",
      payerData,
    ) as any as Promise<BusinessCreateResponse>;
  },
  deletePayer: async (businessId: string) => {
    return api.delete<BusinessDeleteResponse>("/business/delete", {
      params: { businessids: businessId },
    }) as any as Promise<BusinessDeleteResponse>;
  },
  activatePayer: async (businessIds: string) => {
    return api.get<BusinessStatusResponse>("/business/reactivate", {
      params: { businessids: businessIds },
    }) as any as Promise<BusinessStatusResponse>;
  },
  deactivatePayer: async (businessIds: string) => {
    return api.get<BusinessStatusResponse>("/business/deactivate", {
      params: { businessids: businessIds },
    }) as any as Promise<BusinessStatusResponse>;
  },
};
