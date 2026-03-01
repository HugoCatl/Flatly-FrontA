// ========================
// ENUMS
// ========================

export enum Role {
  STUDENT = 'STUDENT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export enum BillType {
  RENT = 'RENT',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER',
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

// ========================
// ENTIDADES PRINCIPALES
// ========================

export interface Usuario {
  id?: number;
  role: Role;
  name: string;
  email: string;
  password_hash: string;
  created_at: string; // ISO 8601 LocalDateTime
  phone?: string;
  avatarUrl?: string;
}

export interface Propiedad {
  id: number;
  ownerId: number;
  title: string;
  description?: string;
  priceMonth: number;
  city: string;
  zone: string;
  rooms: number;
  expensesIncluded: boolean;
  propertiesCreatedAt: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  isAvailable: boolean;
  bathrooms: number;
  squareMeters?: number;
  isFurnished: boolean;
  tags?: Tag[];
  images?: PropertyImage[];
}

export interface Hogar {
  id: number;
  name: string;
  createdBy: number;
  property_id: number;
  householdsCreatedAt: string;
}

export interface Bills {
  id: number;
  household_id: number;
  type: BillType;
  amount_total: number;
  period_year: number;
  period_month: number;
  due_date: string; // ISO 8601 LocalDate
  created_by: number;
  created_at: string;
  status: BillStatus;
  splits?: BillSplit[];
}

export interface Expense {
  name: string;
  paidBy: string;
  amount: number;
  icon: string;
  iconClass: string;
  period_month: number;
  period_year: number;
  due_date: string;
  status: BillStatus;
  created_at: string;
}
export interface NewBill {
  type: string;
  amount: number | null;
  period_month: number;
  period_year: number;
  due_date?: string;
}

export interface BillSplit {
  billId: number;
  userId: number;
  amount: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PropertyImage {
  id: number;
  propertyId: number;
  url: string;
  orderIndex: number;
  isMain: boolean;
  createdAt: string;
}

export interface Favorito {
  userId: number;
  propertyId: number;
  createdAt: string;
}

export interface HouseholdMember {
  householdId: number;
  userId: number;
  joinedAt: string;
}

export interface TagDePropiedad {
  propertyId: number;
  tagId: number;
}

// ========================
// REQUEST MODELS
// ========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ActualizarUsuarioRequest {
  name: string;
  phone: string;
  avatarUrl: string;
}

// ========================
// SESSION
// ========================

export interface UserSession {
  email: string;
  id?: number;
  role: Role;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminStats {
  totalUsuarios: number;
  totalEstudiantes: number;
  totalPropietarios: number;
  totalAdmins: number;
  totalPropiedades: number;
  propiedadesDisponibles: number;
  timestamp: string;
}
