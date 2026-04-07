// Base URL
import { API_URL } from "./config";
// Versioned Base URLs
const API_v1 = `${API_URL}/v1`;
const API_v2 = `${API_URL}`;
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
  LOGIN: `${API_URL}/login`, //buildUrl(API_v2, "SecUsers/Login"),
  // HRM - Role & Menu
  HRM: {
    GET_MENUS: `${API_URL}/login-menu`, //buildUrl(API_v2, "SecUsers/LoginMenu"),
    getMyAttendance: `${API_URL}/my/getMyAttendance`, // buildUrl(API_v1, "Misreport/GetMisReportHR"),
    GetEmpLeaveInfo: `${API_URL}/my/getMyEmpLeaveBalance`, //buildUrl(API_v1, "Hrleave/GetEmpLeaveBalance"), //getMyEmpLeaveBalance
    GET_HR_LEAVE_TYPES: `${API_URL}/my/getLeaveType`, //buildUrl(API_v1, "HrManagement/GetHrLeaveTypeList"),
    SAVE_LEAVE_APPLICATION: `${API_URL}/leave/saveLeaveApplication`, //buildUrl(API_v1, "/leave/saveLeaveApplication"),
    GetMonthlyRosterByEmpId: `${API_URL}/my/mygetMonthlyRoster`, //buildUrl(API_v1, "/HrDutyRoster/GetMonthlyRosterByEmpId"),
    UpdateSecUser: `${API_URL}/updateProfile`,
    ResetPassSecUser: `${API_URL}/users/updatePassword`, //buildUrl(API_v2, "SecUsers/ResetPassSecUser"),
  },
  // Employment / Employee
  EMPLOYMENT: {
    GET_EMPLOYEE_LIST: `${API_URL}/employee/getEmployee`,
  },
  // Department
  DEPARTMENT: {
    GET_LIST: `${API_URL}/my/getLeaveType`, //buildUrl(API_v1, "HrManagement/GetDepartmentList"),
  },
};