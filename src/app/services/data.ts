import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserProfile, Property, Expense } from '../models/flatly';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  // --- 1. BLOQUE: AUTH & SESIÓN  ---
  register(body: any) { return this.http.post(`${this.url}/users/auth/register`, body); }
  login(body: any) { return this.http.post(`${this.url}/users/auth/login`, body); }
  loginFirebase(idToken: string) { return this.http.post(`${this.url}/users/auth/firebase`, { idToken }); }
  checkSession() { return this.http.get(`${this.url}/users/auth/session`); }
  logout() { return this.http.post(`${this.url}/users/logout`, {}); }

  // --- 2. BLOQUE: MI PERFIL (ME)  ---
  getMyProfile() { return this.http.get<UserProfile>(`${this.url}/users/me`); }
  updateMyProfile(body: any) { return this.http.put(`${this.url}/users/me`, body); }
  deleteMyAccount() { return this.http.delete(`${this.url}/users/me`); }
  
  // Favoritos 
  getFavorites() { return this.http.get(`${this.url}/users/me/favorites`); }
  addFavorite(propertyId: number) { return this.http.post(`${this.url}/users/me/favorites`, { propertyId }); }
  removeFavorite(id: number) { return this.http.delete(`${this.url}/users/me/favorites/${id}`); }

  // --- 3. BLOQUE: ESTUDIANTES (HOUSEHOLDS & EXPENSES)  ---
  joinHousehold(householdId: number) { return this.http.post(`${this.url}/students/households/join`, { householdId }); }
  getMyHousehold() { return this.http.get(`${this.url}/students/households/me`); }
  leaveHousehold() { return this.http.delete(`${this.url}/students/households/me`); }
  
  getPendingExpenses() { return this.http.get<Expense[]>(`${this.url}/students/expenses`); }
  getExpenseHistory(year: number, month: number) { 
    return this.http.get<Expense[]>(`${this.url}/students/expenses/history?year=${year}&month=${month}`); 
  }

  // --- 4. BLOQUE: OWNERS (PROPIETARIOS)  ---
  createProperty(body: any) { return this.http.post(`${this.url}/owners/properties`, body); }
  getMyProperties() { return this.http.get<Property[]>(`${this.url}/owners/properties`); }
  deleteProperty(id: number) { return this.http.delete(`${this.url}/owners/properties/${id}`); }
  
  createHousehold(name: string, propertyId: number) { 
    return this.http.post(`${this.url}/owners/households`, { name, propertyId }); 
  }
  getHouseholdTenants(id: number) { return this.http.get(`${this.url}/owners/households/${id}/tenar`); }
  deleteHousehold(id: number) { return this.http.delete(`${this.url}/owners/households/${id}`); }

  // --- 5. BLOQUE: ADMIN  ---
  adminGetAllUsers() { return this.http.get(`${this.url}/admin/users`); }
  adminDeleteUser(id: number) { return this.http.delete(`${this.url}/admin/users/${id}`); }
  adminUpdateRole(id: number, newRole: string) { 
    return this.http.put(`${this.url}/admin/users/${id}/role`, { newRole }); 
  }
  adminGetStats() { return this.http.get(`${this.url}/admin/stats`); }
}