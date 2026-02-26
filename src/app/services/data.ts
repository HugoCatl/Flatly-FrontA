import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario, Propiedad, Factura } from '../models/flatly';
import { map } from 'rxjs/operators';

type Role = 'ADMIN' | 'USER' | 'PROPIETARIO';

export interface User {
  id?: number;
  role: Role;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  phone?: string;
  avatarUrl: string;
}

interface Expense {
  name: string;
  paidBy: string;
  amount: number;
  icon: string;
  iconClass: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  user = signal<Usuario | null>(null);
  expenses = signal<Factura[]>([]);
  loading = signal(true);
  hoseholdBills = signal<Factura[]>([]);
  properties = signal<Propiedad[]>([]);
  availableTags = signal<string[]>([]);
  sesion = signal(false);


  // --- 1. BLOQUE: AUTH & SESIÓN  ---
  register(body: any) { return this.http.post(`${this.url}/users/auth/register`, body); }
  login(body: any) { return this.http.post(`${this.url}/users/auth/login`, body); }
  loginFirebase(idToken: string) { return this.http.post(`${this.url}/users/auth/firebase`, { idToken }); }
  checkSession() { return this.http.get(`${this.url}/users/session`); }
  logout() { return this.http.post(`${this.url}/users/logout`, {}); }

  // --- 2. BLOQUE: MI PERFIL (ME)  ---
  getMyProfile() {
  // Forzamos el envío de credenciales manualmente para probar
  return this.http.get<Usuario>(`${this.url}/users/me`);}
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

  getPendingExpenses() { return this.http.get<Factura[]>(`${this.url}/students/expenses`,{ withCredentials: true }); }
  getExpenseHistory(year: number, month: number) {
    return this.http.get<Factura[]>(`${this.url}/students/expenses/history?year=${year}&month=${month}`, { withCredentials: true });
  }
  getHouseholdBills() { return this.http.get<Factura[]>(`${this.url}/students/households/myBills`, { withCredentials: true }); }

  // --- 4. BLOQUE: OWNERS (PROPIETARIOS)  ---
  createProperty(body: any) { return this.http.post(`${this.url}/owners/properties`, body); }
  getMyProperties() { return this.http.get<Propiedad[]>(`${this.url}/owners/properties`); }
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

  //load

loadHomeData() {
    this.getMyProfile().subscribe({
      next: (profile) => {
        console.log('Perfil cargado con éxito:', profile);
        this.user.set({
          ...profile,
          name: profile.name || localStorage.getItem('user_name') || ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.loading.set(false);

        if (err.status === 401 || err.status === 403) {
          alert('Tu sesión ha caducado o no tienes permiso.');
        }
      }
    });

    this.getPendingExpenses().subscribe({
      next: (list) => {
        console.log('Gastos cargados:', list);
        this.expenses.set(list);
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }

  //expenses 
  downloadHouseholdBills() {
    this.getHouseholdBills().subscribe({
      next: (Bills) => { 
        this.hoseholdBills.set(Bills); 
        console.log('Facturas del hogar cargadas:', Bills);
      },
      error: (err) => console.error('Error al cargar facturas del hogar:', err)
    });

    return (this.hoseholdBills());
  }

  getExpenseIcon(expenseName: string): { icon: string; iconClass: string } {
    const lowerName = expenseName.toLowerCase();
    if (lowerName.includes('agua')) return { icon: 'water_drop', iconClass: 'icon-agua' };
    if (lowerName.includes('luz') || lowerName.includes('electricidad')) return { icon: 'flash_on', iconClass: 'icon-luz' };
    if (lowerName.includes('internet') || lowerName.includes('wifi')) return { icon: 'wifi', iconClass: 'icon-internet' };
    if (lowerName.includes('gas')) return { icon: 'local_gas_station', iconClass: 'icon-gas' };
    if (lowerName.includes('alquiler') || lowerName.includes('renta')) return { icon: 'home', iconClass: 'icon-alquiler' };
    if (lowerName.includes('comida') || lowerName.includes('supermercado')) return { icon: 'restaurant', iconClass: 'icon-comida' };
    return { icon: 'receipt_long', iconClass: 'icon-otros' };
  }
  // Propiedades
// Método para obtener pisos para el mapa (Público)
// En data.ts (ejemplo de cómo asegurar el nombre)
getPublicProperties() {
  return this.http.get<any[]>(`${this.url}/properties/public`).pipe(
    map((list: any[]) => list.map(p => ({
      ...p,
      // Aseguras que el front use camelCase aunque la DB traiga snake_case
      priceMonth: p.price_month, 
      avatar_url: p.avatar_url,
      isAvailable: p.is_available
    })))
  );
}

// Método para obtener las etiquetas de la tabla 'tags'
getAllTags() {
  return this.http.get<any[]>(`${this.url}/tags`);
}

loadMapData() {
  // Carga paralela de pisos y etiquetas
  this.getPublicProperties().subscribe({
    next: (data) => this.properties.set(data),
    error: (err) => console.error('Error al cargar propiedades del mapa', err)
  });

  this.getAllTags().subscribe({
    next: (tags) => this.availableTags.set(tags.map(t => t.name)),
    error: (err) => console.error('Error al cargar etiquetas de la DB', err)
  });
}

}