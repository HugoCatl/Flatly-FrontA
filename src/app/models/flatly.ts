// --- Bloque de Usuarios y Auth ---
export interface AuthResponse {
  token?: string;
  user: UserProfile;
}

export interface UserProfile {
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'STUDENT' | 'OWNER' | 'ADMIN';
}

// --- Bloque de Propiedades (Owners) ---
export interface Property {
  id?: number;
  name: string;
  address?: string;
  price?: number;
  propertyId?: number; // Usado en favoritos y grupos
}

// --- Bloque de Estudiantes y Gastos ---
export interface Household {
  id?: number;
  name?: string;
  householdId: number;
}

export interface Expense {
  id?: number;
  title: string;
  description: string;
  amount: number;
  year: number;
  month: number;
  dueDate: string;
}

// --- Bloque de Admin ---
export interface GlobalStats {
  totalUsers: number;
  totalProperties: number;
  // Añade más según devuelva el endpoint /admin/stats
}