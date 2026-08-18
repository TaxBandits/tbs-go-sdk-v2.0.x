import api from '../api/client';
import { RecipientListResponse, RecipientGetResponse, RecipientCreateRequest, RecipientCreateResponse, RecipientUpdateRequest, RecipientDeleteResponse, RecipientActivateResponse, AssignRecipientRequest, UnAssignRecipientRequest, AssignRecipientResponse, RecipientDBAListResponse, RecipientDBAActionResponse, RecipientDBADeleteResponse } from '../types';

export const recipientService = {
  getRecipients: async (params: { businessId?: string; payerref?: string; page?: number; pagesize?: number; fromdate?: string; todate?: string; isactive?: boolean }) => {
    return api.get<RecipientListResponse>('/recipient/list', { params }) as any as Promise<RecipientListResponse>;
  },
  getRecipientById: async (recipientId: string) => {
    return api.get<RecipientGetResponse>('/recipient/get', { params: { recipientid: recipientId } }) as any as Promise<RecipientGetResponse>;
  },
  createRecipient: async (data: RecipientCreateRequest) => {
    return api.post<RecipientCreateResponse>('/recipient/create', data) as any as Promise<RecipientCreateResponse>;
  },
  updateRecipient: async (data: RecipientUpdateRequest) => {
    return api.put<RecipientCreateResponse>('/recipient/update', data) as any as Promise<RecipientCreateResponse>;
  },
  deleteRecipient: async (recipientId: string) => {
    return api.delete<RecipientDeleteResponse>('/recipient/delete', { params: { recipientid: recipientId } }) as any as Promise<RecipientDeleteResponse>;
  },
  reactivateRecipient: async (recipientId: string) => {
    return api.get<RecipientActivateResponse>('/recipient/reactivate', { params: { recipientids: recipientId } }) as any as Promise<RecipientActivateResponse>;
  },
  deactivateRecipient: async (recipientId: string) => {
    return api.get<RecipientActivateResponse>('/recipient/deactivate', { params: { recipientids: recipientId } }) as any as Promise<RecipientActivateResponse>;
  },
  assignRecipient: async (data: AssignRecipientRequest) => {
    return api.post<AssignRecipientResponse>('/recipient/assignrecipients', data) as any as Promise<AssignRecipientResponse>;
  },
  unassignRecipient: async (data: UnAssignRecipientRequest) => {
    return api.post<AssignRecipientResponse>('/recipient/unassignrecipients', data) as any as Promise<AssignRecipientResponse>;
  },
  listDBA: async (params: { recipientId: string; page?: number; pagesize?: number }) => {
    const queryParams = {
      recipientid: params.recipientId,
      page: params.page,
      pagesize: params.pagesize,
    };
    return api.get<RecipientDBAListResponse>('/recipient/listdba', { params: queryParams }) as any as Promise<RecipientDBAListResponse>;
  },
  addDBA: async (dbaData: any) => {
    return api.post<RecipientDBAActionResponse>('/recipient/adddba', dbaData) as any as Promise<RecipientDBAActionResponse>;
  },
  updateDBA: async (dbaData: any) => {
    return api.put<RecipientDBAActionResponse>('/recipient/updatedba', dbaData) as any as Promise<RecipientDBAActionResponse>;
  },
  deleteDBA: async (recipientId: string, dbaId: string) => {
    return api.delete<RecipientDBADeleteResponse>('/recipient/deletedba', { params: { recipientid: recipientId, dbaid: dbaId } }) as any as Promise<RecipientDBADeleteResponse>;
  },
};
