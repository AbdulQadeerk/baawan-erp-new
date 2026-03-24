/**
 * Auth-related TypeScript interfaces
 * Derived from Angular login response structure (login.component.ts lines 122-132)
 */

export interface AuthUser {
  first_Name: string;
  lastname: string;
  currentSessionId: string;
  userId?: number;
  loginName?: string;
  roleId?: number;
  roleName?: string;
  email?: string;
  mobile?: string;
  [key: string]: any;
}

export interface AuthCompany {
  id: number;
  compId?: number;
  compName: string;
  shortCode: string;
  stateCode?: number;
  gstNo?: string;
  [key: string]: any;
}

export interface CompanyAsset {
  assetType: number;
  url: string;
  [key: string]: any;
}

/** Full response from POST /api/Auth/Login */
export interface LoginResponse {
  user: AuthUser;
  company: AuthCompany;
  companyAssets?: CompanyAsset[];
  token?: string;
  [key: string]: any;
}

/** What gets stored as 'userLoginDetail' in localStorage */
export interface UserLoginDetail {
  companyShortCode: string;
  userLoginName: string;
  userName: string;
}

/** The payload sent to POST /api/Auth/Login */
export interface LoginPayload {
  username: string;
  password: string;
  shortcode: string;
}
