import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend.crr-site.online/api',
  withCredentials: true,
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
// 2FA
export const verify2FALogin = (data) => API.post('/auth/2fa/login-verify', data);
export const setup2FA = () => API.post('/auth/2fa/setup');
export const enable2FA = (code) => API.post('/auth/2fa/enable', { code });
export const disable2FA = () => API.post('/auth/2fa/disable');
export const getEvents = () => API.get('/events');
export const getEventById = (id) => API.get(`/events/${id}`);
export const getMyRegistrations = () => API.get('/events/my/registrations');
export const downloadMyActivity = (from, to) => API.get('/events/my/activity', { params: { from, to }, responseType: 'blob' });
export const getInactiveVolunteers = () => API.get('/users/inactive-volunteers');
export const getMe = () => API.get('/users/me');
export const getUserProfile = (indicator) => API.get(`/users/profile/${indicator}`);
export const getPublicUserProfile = (indicator) => API.get(`/users/public/profile/${indicator}`);

export const createEvent = (data) => API.post('/events', data);
export const registerForEvent = (code) => API.post('/events/register', { code });
export const editEventByCode = (code, data) => API.patch(`/events/code/${code}/edit`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const uploadEventActionReportByCode = (code, file) => {
  const formData = new FormData();
  formData.append('actionReport', file);
  return API.post(`/events/code/${code}/action-report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getEventDetails = (id) => API.get(`/events/${id}/details`);
export const removeVolunteerFromEvent = (eventId, userId) => API.delete(`/events/${eventId}/registrations/${userId}`);
export const addEventAdmin = (eventId, userId) => API.post(`/events/${eventId}/admins`, { userId });
export const removeEventAdmin = (eventId, userId) => API.delete(`/events/${eventId}/admins/${userId}`);
export const getUsers = () => API.get('/users');
export const updateUserRole = (userId, role) => API.patch(`/users/${userId}/role`, { role });
export const getEventByCode = (code) => API.get(`/events/${code}`); 
export const addCertificate = (type, number) => API.post('/users/me/certificate', { type, number });
export const removeCertificate = (type) => API.delete(`/users/me/certificate/${type}`);
export const updateMyDetasament = (detasament) => API.patch('/users/me/detasament', { detasament });
export const updatePersonalInfo = (domiciliu, resedinta) => API.patch('/users/me/personal-info', { domiciliu, resedinta });
export const downloadIndicativ = () => API.get('/users/me/indicativ', { responseType: 'blob' });
export const downloadIdCard = () => API.post('/users/me/id-card', {}, { responseType: 'blob' });
export const uploadPhoto = (photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  return API.post('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getVolunteers = () => API.get('/users/volunteers');
export const getUserEvents = (indicator) => API.get(`/users/profile/${indicator}/events`);
export const addExperience = (type) => API.post('/users/me/experience', { type });
export const removeExperience = (type) => API.delete(`/users/me/experience/${type}`);

// Volunteer registration
export const generateVolunteerPdf = () => API.post('/volunteer/generate-pdf', {}, { responseType: 'blob' });
export const saveSignedPdf = (signatureData) => API.post('/volunteer/save-signed-pdf', { signature: signatureData });
export const downloadVolunteerPdf = (userId) => API.get(`/volunteer/pdf/${userId}`, { responseType: 'blob' });
export const downloadMyVolunteerContract = () => API.get('/volunteer/my-contract', { responseType: 'blob' });