import { Injectable, inject, signal ,computed, effect} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario, Propiedad, Factura, Tag } from '../models/flatly';
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

  // 2. Inicializar signals leyendo del localStorage
  user = signal<Usuario | null>(JSON.parse(localStorage.getItem('app_user') || 'null'));
  profile = signal<Usuario | null>(null);
  expenses = signal<Factura[]>([]);
  loading = signal(true);
  hoseholdBills = signal<Factura[]>([]);
  properties = signal<Propiedad[]>([]);
  availableTags = signal<string[]>([]);
  
  sesion = signal<boolean>(localStorage.getItem('app_session') === 'true');
  busqueda = signal<string>(localStorage.getItem('app_busqueda') || '');
  precioMax = signal<number>(Number(localStorage.getItem('app_precioMax')) || 2500);
  etiquetasSeleccionadas = signal<string[]>(JSON.parse(localStorage.getItem('app_tags') || '[]'));

  constructor() {
    // 3. Crear efectos para guardar en localStorage cuando cambien
    
    effect(() => {
      localStorage.setItem('app_user', JSON.stringify(this.user()));
      localStorage.setItem('app_session', String(this.sesion()));
    });

    effect(() => {
      localStorage.setItem('app_busqueda', this.busqueda());
      localStorage.setItem('app_precioMax', String(this.precioMax()));
      localStorage.setItem('app_tags', JSON.stringify(this.etiquetasSeleccionadas()));
    });
  }


  // --- 1. BLOQUE: AUTH & SESIÓN  ---
  register(body: any) { return this.http.post(`${this.url}/users/auth/register`, body); }
  login(body: any) { 
    return this.http.post(`${this.url}/users/auth/login`, body).pipe(
        map((res: any) => {
            this.user.set(res.user);
            this.sesion.set(true);
            return res;
        })
    );
  }
  loginFirebase(idToken: string) { return this.http.post(`${this.url}/users/auth/firebase`, { idToken }); }
  checkSession() { return this.http.get(`${this.url}/users/session`); }
  logout() { 
    return this.http.post(`${this.url}/users/logout`, {}).pipe(
        map((res) => {
            this.user.set(null);
            this.sesion.set(false);
            localStorage.clear(); // O localStorage.removeItem(...)
            return res;
        })
    );
  }

  // --- 2. BLOQUE: MI PERFIL (ME)  ---
  getMyProfile() {
  // Forzamos el envío de credenciales manualmente para probar
  return this.http.get<Usuario>(`${this.url}/users/me`);}
  updateMyProfile(body: any) { return this.http.put(`${this.url}/users/me`, body); }
  deleteMyAccount() { return this.http.delete(`${this.url}/users/me`); }
  becomeOwner() { return this.http.put(`${this.url}/users/me/becomeOwner`, {withCredentials: true}); }
  returnStudent() { return this.http.put(`${this.url}/users/me/returnStudent`, {withCredentials: true}); }

/**
 * Obtiene todas las propiedades y mapea los campos de la DB (snake_case)
 * a los campos de la interfaz Propiedad (camelCase).
 */
getProperties() {
  return this.http.get<any[]>(`${this.url}/properties`).pipe(
    map((list) => {
      console.log('DATOS BRUTOS DEL BACKEND:', list[0]); // <--- Mira esto en la consola
      return list.map(p => ({
        ...p,
        // Si en la consola ves "price_month", pon p.price_month
        // Si en la consola ves "price", pon p.price
        priceMonth: p.price_month || p.priceMonth || p.price || 0,
        ownerId: p.owner_id || p.ownerId || 0,
        isAvailable: p.is_available ?? p.isAvailable ?? true,
        // ... repite con los demás
      } as Propiedad));
    })
  );
} 
// Método para obtener las etiquetas de la tabla 'tags'
getAllTags() {
  return this.http.get<any[]>(`${this.url}/properties/tags`);
}

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
  //body tag:{"name":"string"}
  adminGetTags(body: any) { return this.http.get(`${this.url}/admin/tags`, body); }
  adminCreateTag(body: string) { return this.http.post(`${this.url}/admin/tags`, { body }); }
  adminEditTag(body: string) { return this.http.post(`${this.url}/admin/tags`, { body }); }

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


// loadMapData actualizado para usar la función simple
loadMapData() {
  this.getProperties().subscribe({
    next: (data) => this.properties.set(data),
    error: (err) => console.error('Error Propiedades:', err)
  });

  this.getAllTags().subscribe({
    next: (tags) => this.availableTags.set(tags.map(t => t.name)),
    error: (err) => console.error('Error Tags:', err)
  });
}
propertiesFiltered = computed(() => {
  // Aseguramos valores limpios
  const q = (this.busqueda() || '').toLowerCase().trim();
  const max = Number(this.precioMax());
  const tagsFiltro = this.etiquetasSeleccionadas();
  const listaOriginal = this.properties() || [];

  return listaOriginal.filter((p: Propiedad) => {
    // 1. Filtro por Texto (Título o Dirección)
    const titulo = (p.title || '').toLowerCase();
    const direccion = (p.address || '').toLowerCase();
    const matchQ = !q || titulo.includes(q) || direccion.includes(q);

    // 2. Filtro por Precio (Forzamos a número)
    // Usamos el campo mapeado 'priceMonth' que hicimos antes
    const precio = Number(p.priceMonth || 0);
    const matchPrecio = precio <= max;

    // 3. Filtro por Etiquetas (Seguro contra nulos)
    const matchTags = tagsFiltro.length === 0 || 
                      (p.tags && tagsFiltro.every(nombre => 
                        p.tags?.some((t: Tag) => t.name === nombre)
                      ));

    // Solo si cumple las 3 condiciones
    return matchQ && matchPrecio && matchTags;
  });
});
}