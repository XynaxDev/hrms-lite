/// <reference types="vite/client" />
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
});

const mapEmployeeToDB = (data: any) => {
  const mapped: any = {};
  const fieldMap: {[key: string]: string} = {
    fullName: 'full_name',
    checkInTime: 'check_in_time',
    joinedDate: 'joined_date'
  };
  
  for (const [key, value] of Object.entries(data)) {
    const dbKey = fieldMap[key as keyof typeof fieldMap] || key;
    mapped[dbKey] = value;
  }
  return mapped;
};

const mapEmployeeFromDB = (data: any) => {
  const mapped: any = {...data};
  const fieldMap: {[key: string]: string} = {
    full_name: 'fullName',
    check_in_time: 'checkInTime',
    joined_date: 'joinedDate'
  };
  
  for (const [key, newKey] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      mapped[newKey] = data[key];
      delete mapped[key];
    }
  }
  
  // Ensure ID is always present
  if (!mapped.id) {
    console.warn('Employee data missing ID:', data);
  }
  
  return mapped;
};

export async function fetchEmployees() {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to fetch employees');
  const data = await response.json();
  return {
    ...data,
    employees: data.employees.map((emp: any) => mapEmployeeFromDB(emp))
  };
}

export async function createEmployee(data: any) {
  const dbData = mapEmployeeToDB(data);
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dbData),
  });
  if (!response.ok) {
    const error = await response.json();
    let errorMessage = 'Failed to create employee';
    
    if (error.detail) {
      if (Array.isArray(error.detail)) {
        errorMessage = error.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else {
        errorMessage = error.detail;
      }
    }
    throw new Error(errorMessage);
  }
  return mapEmployeeFromDB(await response.json());
}

export async function deleteEmployee(id: string) {
  console.group('DELETE EMPLOYEE');
  console.log('Employee ID:', id);
  if (!id || id.trim() === '') {
    console.error('Error: ID is required');
    console.groupEnd();
    throw new Error('Employee ID is required for deletion');
  }
  const encodedId = encodeURIComponent(id);
  const url = `${API_BASE_URL}/employees/${encodedId}`;
  console.log('DELETE URL:', url);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'X-API-Key': API_KEY }
  });
  console.log('Response:', response.status, response.statusText);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete employee' }));
    console.error('Delete Error:', error);
    console.groupEnd();
    throw new Error(error.detail || 'Failed to delete employee');
  }
  console.log('SUCCESS: Employee deleted');
  console.groupEnd();
  return true;
}

export async function fetchAttendance(date?: string) {
  const url = date ? `${API_BASE_URL}/attendance?date=${date}` : `${API_BASE_URL}/attendance`;
  const response = await fetch(url, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to fetch attendance');
  const data = await response.json();
  
  // Convert snake_case to camelCase
  if (data.attendance_records) {
    data.attendance_records = data.attendance_records.map((record: any) => ({
      id: record.id,
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      avatar: record.avatar,
      role: record.role,
      date: record.date,
      status: record.status,
      checkIn: record.check_in,
      checkOut: record.check_out,
      workHours: record.work_hours,
    }));
  }
  
  return data;
}

export async function fetchAttendanceSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `${API_BASE_URL}/attendance/summary/all${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to fetch attendance summary');
  return response.json();
}

export async function sendChatMessage(message: string, history: any[]) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, history }),
  });
  if (!response.ok) throw new Error('Failed to get chat response');
  return response.json();
}

export async function markAttendance(id: string, status: string, date?: string) {
  const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ employee_id: id, status, date }),
  });
  if (!response.ok) throw new Error('Failed to mark attendance');
  return response.json();
}

export async function updateAttendance(attendanceId: string, data: { status?: string; checkIn?: string; checkOut?: string; workHours?: string }) {
  const response = await fetch(`${API_BASE_URL}/attendance/${encodeURIComponent(attendanceId)}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      status: data.status,
      check_in: data.checkIn,
      check_out: data.checkOut,
      work_hours: data.workHours,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to update attendance');
  }
  return response.json();
}

export async function updateEmployee(id: string, data: any) {
  const dbData = mapEmployeeToDB(data);
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dbData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update employee');
  }
  return mapEmployeeFromDB(await response.json());
}
