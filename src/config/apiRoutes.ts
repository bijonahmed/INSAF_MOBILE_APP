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
    SAVE_LEAVE_APPLICATION: buildUrl(API_v1,"/HrLeave/SaveLeaveApplication"),
    
  },

  // Employment / Employee
  EMPLOYMENT: {
    GET_EMPLOYEE_LIST: buildUrl(API_v1, "Employment/GetEmployeeList"),
    // GET_EMPLOYEE_SEARCH: buildUrl(API_v1, "Employment/GetEmployeeListSearch"),
    // GET_EMPLOYEE_RESIGN_LIST: buildUrl(API_v1, "Employment/GetEmployeeResignList"),
    // GET_EMPLOYEE_DTL: buildUrl(API_v1, "Employment/GetEmployeeDtl"),
    // CREATE_EMPLOYEE: buildUrl(API_v1, "Employment/CreateEmployee"),
    // SAVE_PERSONAL: buildUrl(API_v1, "Employment/SaveEmployeePersonal"),
    // SAVE_JOB: buildUrl(API_v1, "Employment/SaveEmployeeJob"),
    // SAVE_EDUCATION: buildUrl(API_v1, "Employment/SaveEmpEducation"),
    // SAVE_CERTIFICATE: buildUrl(API_v1, "Employment/SaveProfessionCertificate"),
    // SAVE_WORK_EXPERIIENCE: buildUrl(API_v1, "Employment/SaveWorkexperience"),
    // CREATE_RESIGN: buildUrl(API_v1, "Employment/CreateResignList"),
    // REINSTATE: buildUrl(API_v1, "Employment/ReinstateList"),
    // SAVE_RESIGN_INFO: buildUrl(API_v1, "Employment/SaveResignInfo"),
    // DELETE_EDUCATION: buildUrl(API_v1, "Employment/DeleteEmpEducation"),
    // DELETE_CERTIFICATE: buildUrl(API_v1, "Employment/DeleteProfessionCertificate"),

  },
  // Department

  DEPARTMENT: {
    GET_LIST: buildUrl(API_v1, "HrManagement/GetDepartmentList"),
  },
};