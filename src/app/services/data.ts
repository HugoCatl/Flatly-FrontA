import { Injectable, inject, signal ,computed, effect} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario, Propiedad, Bills, Tag,AdminStats,AdminUser,Expense} from '../models/flatly';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';





@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  // 2. Inicializar signals leyendo del localStorage
  user = signal<Usuario | null>(JSON.parse(localStorage.getItem('app_user') || 'null'));

  adminUsersList = signal<AdminUser[]>([]);

  proces= signal(false); 

  tags = signal<string[]>([]);
  

  showDeleteModal = signal(false);
  showRoleModal = signal(false);

  profile = signal<Usuario | null>(JSON.parse(localStorage.getItem('app_user') || 'null')); 
  loading = signal(false);

  //este expenses es los datos necesarios para mostrar en expenses
  expenses = signal<Expense[]>([]);

  personalExpenses = signal<Bills[]>(localStorage.getItem('app_personal_expenses') ? JSON.parse(localStorage.getItem('app_personal_expenses') || '{}') : null);

  
  hoseholdBills = signal<Bills[]>([]);
  properties = signal<Propiedad[]>([]);

  availableTags = signal<Tag[]>(JSON.parse(localStorage.getItem('app_tags_list') || '[]'));  

  sesion = signal<boolean>(localStorage.getItem('app_session') === 'true');
  busqueda = signal<string>(localStorage.getItem('app_busqueda') || '');
  precioMax = signal<number>(Number(localStorage.getItem('app_precioMax')) || 2500);
  etiquetasSeleccionadas = signal<string[]>([]);

  stats = signal<AdminStats | null>(null);

  constructor() {
    // 3. Crear efectos para guardar en localStorage cuando cambien
    
    effect(() => {
      localStorage.setItem('app_user', JSON.stringify(this.user()));
      localStorage.setItem('app_session', String(this.sesion()));
    });

    effect(() => {
      localStorage.setItem('app_busqueda', this.busqueda());
      localStorage.setItem('app_precioMax', String(this.precioMax()));
    });

    effect(() => {
      localStorage.setItem('app_tags_list', JSON.stringify(this.availableTags()));
      localStorage.setItem('app_personal_expenses', JSON.stringify(this.personalExpenses()));
    });
    this.loadTagsPublic();
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
  updateMyProfile(body: any) {
  // body contiene: { name, phone, avatarUrl }
  return this.http.put(`${this.url}/users/me`, body).pipe(
    tap(() => {
      // 1. Obtener los datos actuales que tenemos en la signal (o localStorage)
      const currentUser = this.user();
      
      if (currentUser) {
        // 2. Fusionar: Datos actuales + Nuevos datos del formulario
        const updatedUser = {
          ...currentUser,
          ...body
        };

        console.log('Fusionando y actualizando datos:', updatedUser);

        // 3. Actualizar la señal con el objeto completo.
        // Esto dispara el effect() y guarda en localStorage automáticamente.
        this.user.set(updatedUser);
        this.profile.set(updatedUser);
      }
    })
  );
}
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
        priceMonth:  p.price_month  || p.priceMonth  || p.price || 0,
        ownerId:     p.owner_id     || p.ownerId     || 0,
        householdId: p.household_id || p.householdId || undefined,
        isAvailable: p.is_available ?? p.isAvailable ?? true,
      } as Propiedad));
    })
  );
} 
// Obtener una propiedad por ID
getPropertyById(id: number) {
  return this.http.get<any>(`${this.url}/properties/${id}`).pipe(
    map((p: any) => ({
      ...p,
      priceMonth:  p.price_month  || p.priceMonth  || p.price || 0,
      ownerId:     p.owner_id     || p.ownerId     || 0,
      householdId: p.household_id || p.householdId || undefined,
      isAvailable: p.is_available ?? p.isAvailable ?? true,
    } as Propiedad))
  );
}

// Método para obtener las etiquetas de la tabla 'tags'
getAllTags() {
  return this.http.get<Tag[]>(`${this.url}/properties/tags`);
}

  // Favoritos 
  getFavorites() { return this.http.get(`${this.url}/users/me/favorites`); }
  addFavorite(propertyId: number) { return this.http.post(`${this.url}/users/me/favorites`, { propertyId }); }
  removeFavorite(id: number) { return this.http.delete(`${this.url}/users/me/favorites/${id}`); }

  // --- 3. BLOQUE: ESTUDIANTES (HOUSEHOLDS & EXPENSES)  ---
  joinHousehold(householdId: number) { return this.http.post(`${this.url}/students/households/join`, { householdId }); }
  getMyHousehold() { return this.http.get(`${this.url}/students/households/me`); }
  leaveHousehold() { return this.http.delete(`${this.url}/students/households/me`); }

  getPendingExpenses() { return this.http.get<Bills[]>(`${this.url}/students/expenses`,{ withCredentials: true }); }
  getExpenseHistory(year: number, month: number) {
    return this.http.get<Bills[]>(`${this.url}/students/expenses/history?year=${year}&month=${month}`, { withCredentials: true });
  }
  getHouseholdBills() { return this.http.get<Bills[]>(`${this.url}/students/households/myBills`, { withCredentials: true }); }

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
  // Asumiendo que este método existe
  adminGetTags(params: any) {
    return this.http.get(`${this.url}/admin/tags`);
  }

  adminCreateTag(tag: Tag) {
    return this.http.post(`${this.url}/admin/tags`, tag.name).pipe(
      tap(() => {
        // Optimista: asumimos éxito
        this.loadTagsPublic(); // Recarga la lista de tags después de crear uno nuevo
      }),
      catchError(() => {
        // Forzamos actualización si se creó a pesar del error
        this.loadTagsPublic();
        return of(null);
      })
    );
  }

  adminEditTag(body: string) { return this.http.post(`${this.url}/admin/tags`, { body }); }  
  
  //funcion para pasar facturas a expenses y mostrar el icono correspondiente
  billsToExpenses(){
    const bills = this.hoseholdBills();
    const expenses: Expense[] = bills.map(bill => ({
      name: bill.type,
      paidBy: "pepe",
      amount: bill.amount_total,
      icon: this.getExpenseIconAndClass(bill.type).icon, // Obtener el icono según el tipo
      type: bill.type,
      iconClass: this.getExpenseIconAndClass(bill.type).iconClass, // Clase CSS para el icono
      period_month: bill.period_month,
      period_year: bill.period_year,
      due_date: bill.due_date,
      status: bill.status,
      created_at: bill.created_at,
    }));
    this.expenses.set(expenses);
    

  }



  // Función para asignar un icono y clase CSS según el nombre del gasto se basa en billTipe
  getExpenseIconAndClass(type: string): { icon: string; iconClass: string } {
    switch (type.toLowerCase()) {
      case 'rent':
        return { icon: '🏠', iconClass: 'rent-icon' };
      case 'water':
        return { icon: '💧', iconClass: 'water-icon' };
      case 'electricity':
        return { icon: '⚡', iconClass: 'electricity-icon' };
      case 'internet':
        return { icon: '🌐', iconClass: 'internet-icon' };
      case 'gas':
        return { icon: '🔥', iconClass: 'gas-icon' };
      default:
        return { icon: '📝', iconClass: 'default-icon' };
    }
  }
  


  //load
  loadAllBills() {
    this.loadPersonalExpenses();
    this.loadHouseholdBills();
    
  }

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
        this.hoseholdBills.set(list);
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }
 
  loadHouseholdBills() {
    this.getHouseholdBills().subscribe({
      next: (Bills) => { 
        this.hoseholdBills.set(Bills); 
        console.log('Facturas del hogar cargadas:', Bills);
        //comvertir a expenses
      },
      error: (err) => console.error('Error al cargar facturas del hogar:', err)
    });

    return (this.hoseholdBills());
  }



// loadMapData actualizado para usar la función simple
loadMapData() {
  this.getProperties().subscribe({
    next: (data) => this.properties.set(data),
    error: (err) => console.error('Error Propiedades:', err)
  });
  this.loadTagsPublic();

}
propertiesFiltered = computed(() => {
  // Aseguramos valores limpios
  const q = (this.busqueda() || '').toLowerCase().trim();
  const max = Number(this.precioMax());
  const tagsFiltro = this.etiquetasSeleccionadas();
  const listaOriginal = this.properties() || [];

  return listaOriginal.filter((p: Propiedad) => {
    // 1. Filtro por Texto (Zona y Ciudad)
    const zona = (p.zone || '').toLowerCase();
    const ciudad = (p.city || '').toLowerCase();
    const matchQ = !q || zona.includes(q) || ciudad.includes(q);

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

loadTagsPublic() {
  this.getAllTags().subscribe({
    next: (data) => {
      this.availableTags.set(data);
      console.log('Tags cargados:', data);
    },
    error: (err) => console.error('Error al cargar tags:', err)
  });
  }

    loadStats(): void {
  this.loading.set(true); // Activar carga
  this.adminGetStats().subscribe({
    next: (data: any) => {
      this.stats.set(data); // <--- GUARDAR EN SEÑAL
      this.loading.set(false); // Desactivar carga
    },
    error: (err) => {
      console.error('Error al cargar stats:', err);
      this.loading.set(false);
    }
  });
}

// Método corregido para asegurar el seteo de señal y loading
loadUsers(): void {
  this.loading.set(true); // Activar carga
  this.adminGetAllUsers().subscribe({
    next: (data: any) => {
      this.adminUsersList.set(data); // <--- GUARDAR EN SEÑAL
      this.loading.set(false); // Desactivar carga
    },
    error: (err) => {
      console.error('Error al cargar usuarios:', err);
      this.loading.set(false);
    }
  });
}

loadPersonalExpenses(){
  this.loading.set(true); // Activar carga
  this.getPendingExpenses().subscribe({
    next: (data: Bills[]) => {
      this.personalExpenses.set(data); 
      this.loading.set(false); // Desactivar carga
      localStorage.setItem('app_personal_expenses', JSON.stringify(data));
      console.log('Gastos personales cargados:', data);
    },
    error: (err) => {
      console.error('Error al cargar gastos personales:', err);
      this.loading.set(false);
    }
  });
}

  // ── Datos estáticos ──
  tabs = [
    { key: 'gastos',       label: 'Gastos'       },
    { key: 'saldos',       label: 'Saldos'       },
    { key: 'estadisticas', label: 'Estadísticas' },
  ];

  months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  years = [2024, 2025, 2026];

}