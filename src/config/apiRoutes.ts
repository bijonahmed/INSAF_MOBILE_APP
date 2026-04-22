// Base URL
import { API_URL } from "./config";
// Versioned Base URLs

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_URL}/login`,
  // HRM - Role & Menu
  HRM: {
    GET_MENUS: `${API_URL}/login-menu`,
    getMyAttendance: `${API_URL}/my/getMyAttendance`,
    GetEmpLeaveInfo: `${API_URL}/my/getMyEmpLeaveBalance`,
    GET_HR_LEAVE_TYPES: `${API_URL}/my/getLeaveType`,
    SAVE_LEAVE_APPLICATION: `${API_URL}/leave/saveLeaveApplication`,
    GetMonthlyRosterByEmpId: `${API_URL}/my/mygetMonthlyRoster`,
    GetWeeklyRosterByEmpId: `${API_URL}/my/mygetWeeklyRoster`,
    UpdateSecUser: `${API_URL}/updateProfile`,
    ResetPassSecUser: `${API_URL}/users/updatePassword`,
    GET_EMP_UNDER_DPT: `${API_URL}/employee/getUnderDeptEmployee`,
    GET_WEEKLY_ROSTER: `${API_URL}/roster/index`,
    ADD_WEEKLY_ROSTER: `${API_URL}/roster/createWeeklyRoster`,
    UPDATE_EMP_WEEKLY_ROSTER: `${API_URL}/roster/updateWeeklyRoster`,
    GET_MONTHLY_ROSTER: `${API_URL}/roster/getMonthlyRoster`,
    ADD_YEARLY_ROSTER: `${API_URL}/roster/createRosterYearly`,
    UPDATE_MONTHLY_ROSTER: `${API_URL}/roster/UpdateMonthlyRosterById`,
    GET_ATTENDANCE_DETAIL_REPORT: `${API_URL}/hrm_report/getAttendanceDetail`,

  },
  // Employment / Employee
  EMPLOYMENT: {
    GET_EMPLOYEE_LIST: `${API_URL}/employee/getEmployee`,
    GetEmployeeDetails: `${API_URL}/employee/checkemployee`,
  },
  // Department
  DEPARTMENT: {
    GET_LIST: `${API_URL}/my/getLeaveType`, //buildUrl(API_v1, "HrManagement/GetDepartmentList"),
  },
};