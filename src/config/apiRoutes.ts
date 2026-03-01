// Base URLs
import { API_URL } from './config';
export const API_V1 = API_URL;
export const V2 = "http://45.251.56.104:5001/api/v2";

// Utility to build full URL
const buildUrl = (base: string, path: string) => `${base}/${path}`;

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: buildUrl(V2, "SecUsers/Login"),

  // HRM - Role & Menu
  HRM: {
    GET_MENUS: buildUrl(V2, "SecUsers/LoginMenu"),
    GET_ROLES: buildUrl(V2, "SecRoles/GetAllRoles"),
    GET_USERS: buildUrl(V2, "SecUsers/GetUsers"),
    DELETE_ROLE: buildUrl(V2, "SecRoles/DeleteRole"),
    SAVE_ROLE: buildUrl(V2, "SecRoles/SaveRole"),
    GET_ALL_MENUS: buildUrl(V2, "SecMenuRolePermission/AllMenuList"),
    SIDE_MENUS: buildUrl(V2, "SecMenuRolePermission/SideMenuList"),
  },

  // Employment / Employee
  EMPLOYMENT: {
    GET_EMPLOYEE_LIST: buildUrl(API_V1, "Employment/GetEmployeeList"),
    GET_EMPLOYEE_SEARCH: buildUrl(API_V1, "Employment/GetEmployeeListSearch"),
    GET_EMPLOYEE_RESIGN_LIST: buildUrl(API_V1, "Employment/GetEmployeeResignList"),
    GET_EMPLOYEE_DTL: buildUrl(API_V1, "Employment/GetEmployeeDtl"),
    CREATE_EMPLOYEE: buildUrl(API_V1, "Employment/CreateEmployee"),
    SAVE_PERSONAL: buildUrl(API_V1, "Employment/SaveEmployeePersonal"),
    SAVE_JOB: buildUrl(API_V1, "Employment/SaveEmployeeJob"),
    SAVE_EDUCATION: buildUrl(API_V1, "Employment/SaveEmpEducation"),
    SAVE_CERTIFICATE: buildUrl(API_V1, "Employment/SaveProfessionCertificate"),
    SAVE_WORK_EXPERIENCE: buildUrl(API_V1, "Employment/SaveWorkexperience"),
    CREATE_RESIGN: buildUrl(API_V1, "Employment/CreateResignList"),
    REINSTATE: buildUrl(API_V1, "Employment/ReinstateList"),
    SAVE_RESIGN_INFO: buildUrl(API_V1, "Employment/SaveResignInfo"),
    DELETE_EDUCATION: buildUrl(API_V1, "Employment/DeleteEmpEducation"),
    DELETE_CERTIFICATE: buildUrl(API_V1, "Employment/DeleteProfessionCertificate"),
  },

  // Department
  DEPARTMENT: {
    GET_LIST: buildUrl(API_V1, "HrManagement/GetDepartmentList"),
  },
};