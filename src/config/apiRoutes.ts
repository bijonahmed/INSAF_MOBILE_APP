// Base URL
import { API_URL } from "./config";

// Versioned Base URLs
const API_v1 = `${API_URL}/v1`;
const API_v2 = `${API_URL}/v2`;

/**
 * - Removes trailing slash from base
 * - Removes leading slash from path
 * - Prevents double slash (//)
 */
const buildUrl = (base: string, path: string): string => {
  const safeBase = base.replace(/\/+$/, "");
  const safePath = path.replace(/^\/+/, "");
  return `${safeBase}/${safePath}`;
};


export const API_ENDPOINTS = {
  // Authentication
  LOGIN: buildUrl(API_v2, "SecUsers/Login"),
  // HRM - Role & Menu
  HRM: {
    GET_MENUS: buildUrl(API_v2, "SecUsers/LoginMenu"),
    GetMisReportHR: buildUrl(API_v1, "Misreport/GetMisReportHR"),
    GetEmpLeaveInfo: buildUrl(API_v1, "Hrleave/GetEmpLeaveBalance"),
    GET_HR_LEAVE_TYPES: buildUrl(API_v1, "HrManagement/GetHrLeaveTypeList"),
    SAVE_LEAVE_APPLICATION: buildUrl(API_v1, "/HrLeave/SaveLeaveApplication"),
    GetMonthlyRosterByEmpId: buildUrl(API_v1, "/HrDutyRoster/GetMonthlyRosterByEmpId"),
    UpdateSecUser: buildUrl(API_v2, "SecUsers/UpdateSecUserProfile"),
    ResetPassSecUser: buildUrl(API_v2, "SecUsers/ResetPassSecUser"),

  },

  // Employment / Employee
  EMPLOYMENT: {
    GET_EMPLOYEE_LIST: buildUrl(API_v1, "Employment/GetEmployeeList"),
  },
  // Department
  DEPARTMENT: {
    GET_LIST: buildUrl(API_v1, "HrManagement/GetDepartmentList"),
  },
};