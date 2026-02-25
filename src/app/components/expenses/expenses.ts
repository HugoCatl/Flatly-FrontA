import { Component, ViewChild, HostListener, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm, Expense } from './components/expense-form/expense-form';
import { ExpenseDetail } from './components/expense-detail/expense-detail';
import { ExpenseStats } from './components/expense-stats/expense-stats';
import { ExpenseSaldos } from './components/expense-saldos/expense-saldos';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, ExpenseForm, ExpenseDetail, ExpenseStats, ExpenseSaldos],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses {

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;

  // ── Estado ──
  activeTab = signal<'gastos' | 'saldos' | 'estadisticas'>('gastos');
  selectedMonth = signal(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());
  showMonthDropdown = signal(false);
  showYearDropdown = signal(false);
  selectedExpense = signal<Expense | null>(null);

  // ── Datos ──
  expenses = signal<Expense[]>([
    // Enero
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 1, period_year: 2026, due_date: '2026-01-05', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 90.00,  icon: '💡', iconClass: 'icon-electric', period_month: 1, period_year: 2026, due_date: '2026-01-15', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Guillermo',  amount: 40.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 1, period_year: 2026, due_date: '2026-01-20', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Julia',      amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 1, period_year: 2026, due_date: '2026-01-10', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Guillermo',  amount: 85.00,  icon: '🛒', iconClass: 'icon-varios',   period_month: 1, period_year: 2026, due_date: '2026-01-28', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    // Febrero
    { name: 'Alquiler',     paidBy: 'Guillermo',  amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 2, period_year: 2026, due_date: '2026-02-05', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Alex (Yo)', amount: 85.50,  icon: '💡', iconClass: 'icon-electric', period_month: 2, period_year: 2026, due_date: '2026-02-15', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Julia',      amount: 45.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 2, period_year: 2026, due_date: '2026-02-20', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Alex (Yo)', amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 2, period_year: 2026, due_date: '2026-02-10', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Julia',      amount: 120.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 2, period_year: 2026, due_date: '2026-02-28', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    // Marzo
    { name: 'Alquiler',     paidBy: 'Julia',      amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 3, period_year: 2026, due_date: '2026-03-05', status: 'PAID',    created_at: '2026-03-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Guillermo',  amount: 78.00,  icon: '💡', iconClass: 'icon-electric', period_month: 3, period_year: 2026, due_date: '2026-03-15', status: 'PAID',    created_at: '2026-03-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 42.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 3, period_year: 2026, due_date: '2026-03-20', status: 'PAID',    created_at: '2026-03-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Julia',      amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 3, period_year: 2026, due_date: '2026-03-10', status: 'PAID',    created_at: '2026-03-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 95.00,  icon: '🛒', iconClass: 'icon-varios',   period_month: 3, period_year: 2026, due_date: '2026-03-28', status: 'PAID',    created_at: '2026-03-01T10:00:00' },
    // Abril
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 4, period_year: 2026, due_date: '2026-04-05', status: 'PAID',    created_at: '2026-04-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 65.00,  icon: '💡', iconClass: 'icon-electric', period_month: 4, period_year: 2026, due_date: '2026-04-15', status: 'PAID',    created_at: '2026-04-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Guillermo',  amount: 38.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 4, period_year: 2026, due_date: '2026-04-20', status: 'PAID',    created_at: '2026-04-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 4, period_year: 2026, due_date: '2026-04-10', status: 'PAID',    created_at: '2026-04-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Julia',      amount: 110.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 4, period_year: 2026, due_date: '2026-04-28', status: 'PAID',    created_at: '2026-04-01T10:00:00' },
    // Mayo
    { name: 'Alquiler',     paidBy: 'Guillermo',  amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 5, period_year: 2026, due_date: '2026-05-05', status: 'PAID',    created_at: '2026-05-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Alex (Yo)', amount: 60.00,  icon: '💡', iconClass: 'icon-electric', period_month: 5, period_year: 2026, due_date: '2026-05-15', status: 'PAID',    created_at: '2026-05-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Julia',      amount: 36.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 5, period_year: 2026, due_date: '2026-05-20', status: 'PAID',    created_at: '2026-05-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Alex (Yo)', amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 5, period_year: 2026, due_date: '2026-05-10', status: 'PAID',    created_at: '2026-05-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Guillermo',  amount: 98.00,  icon: '🛒', iconClass: 'icon-varios',   period_month: 5, period_year: 2026, due_date: '2026-05-28', status: 'PAID',    created_at: '2026-05-01T10:00:00' },
    // Junio
    { name: 'Alquiler',     paidBy: 'Julia',      amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 6, period_year: 2026, due_date: '2026-06-05', status: 'PAID',    created_at: '2026-06-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Guillermo',  amount: 55.00,  icon: '💡', iconClass: 'icon-electric', period_month: 6, period_year: 2026, due_date: '2026-06-15', status: 'PAID',    created_at: '2026-06-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 40.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 6, period_year: 2026, due_date: '2026-06-20', status: 'PAID',    created_at: '2026-06-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Julia',      amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 6, period_year: 2026, due_date: '2026-06-10', status: 'PAID',    created_at: '2026-06-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 130.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 6, period_year: 2026, due_date: '2026-06-28', status: 'PAID',    created_at: '2026-06-01T10:00:00' },
    // Julio
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 7, period_year: 2026, due_date: '2026-07-05', status: 'PAID',    created_at: '2026-07-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 95.00,  icon: '💡', iconClass: 'icon-electric', period_month: 7, period_year: 2026, due_date: '2026-07-15', status: 'PAID',    created_at: '2026-07-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Guillermo',  amount: 48.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 7, period_year: 2026, due_date: '2026-07-20', status: 'PAID',    created_at: '2026-07-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 7, period_year: 2026, due_date: '2026-07-10', status: 'PAID',    created_at: '2026-07-01T10:00:00' },
    // Agosto
    { name: 'Alquiler',     paidBy: 'Guillermo',  amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 8, period_year: 2026, due_date: '2026-08-05', status: 'PAID',    created_at: '2026-08-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Alex (Yo)', amount: 110.00, icon: '💡', iconClass: 'icon-electric', period_month: 8, period_year: 2026, due_date: '2026-08-15', status: 'PAID',    created_at: '2026-08-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Julia',      amount: 52.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 8, period_year: 2026, due_date: '2026-08-20', status: 'PAID',    created_at: '2026-08-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Julia',      amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 8, period_year: 2026, due_date: '2026-08-10', status: 'PAID',    created_at: '2026-08-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 140.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 8, period_year: 2026, due_date: '2026-08-28', status: 'PAID',    created_at: '2026-08-01T10:00:00' },
    // Septiembre
    { name: 'Alquiler',     paidBy: 'Julia',      amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 9, period_year: 2026, due_date: '2026-09-05', status: 'PAID',    created_at: '2026-09-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Guillermo',  amount: 88.00,  icon: '💡', iconClass: 'icon-electric', period_month: 9, period_year: 2026, due_date: '2026-09-15', status: 'PAID',    created_at: '2026-09-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 44.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 9, period_year: 2026, due_date: '2026-09-20', status: 'PAID',    created_at: '2026-09-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Alex (Yo)', amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 9, period_year: 2026, due_date: '2026-09-10', status: 'PAID',    created_at: '2026-09-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Guillermo',  amount: 105.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 9, period_year: 2026, due_date: '2026-09-28', status: 'PAID',    created_at: '2026-09-01T10:00:00' },
    // Octubre
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 10, period_year: 2026, due_date: '2026-10-05', status: 'PAID',    created_at: '2026-10-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 82.00,  icon: '💡', iconClass: 'icon-electric', period_month: 10, period_year: 2026, due_date: '2026-10-15', status: 'PENDING', created_at: '2026-10-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Guillermo',  amount: 46.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 10, period_year: 2026, due_date: '2026-10-20', status: 'PENDING', created_at: '2026-10-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Julia',      amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 10, period_year: 2026, due_date: '2026-10-10', status: 'PAID',    created_at: '2026-10-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Guillermo',  amount: 115.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 10, period_year: 2026, due_date: '2026-10-28', status: 'PENDING', created_at: '2026-10-01T10:00:00' },
    // Noviembre
    { name: 'Alquiler',     paidBy: 'Guillermo',  amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 11, period_year: 2026, due_date: '2026-11-05', status: 'PENDING', created_at: '2026-11-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Alex (Yo)', amount: 92.00,  icon: '💡', iconClass: 'icon-electric', period_month: 11, period_year: 2026, due_date: '2026-11-15', status: 'PENDING', created_at: '2026-11-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Julia',      amount: 50.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 11, period_year: 2026, due_date: '2026-11-20', status: 'PENDING', created_at: '2026-11-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 11, period_year: 2026, due_date: '2026-11-10', status: 'PENDING', created_at: '2026-11-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Julia',      amount: 125.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 11, period_year: 2026, due_date: '2026-11-28', status: 'PENDING', created_at: '2026-11-01T10:00:00' },
    // Diciembre
    { name: 'Alquiler',     paidBy: 'Julia',      amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 12, period_year: 2026, due_date: '2026-12-05', status: 'PENDING', created_at: '2026-12-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Guillermo',  amount: 105.00, icon: '💡', iconClass: 'icon-electric', period_month: 12, period_year: 2026, due_date: '2026-12-15', status: 'PENDING', created_at: '2026-12-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 55.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 12, period_year: 2026, due_date: '2026-12-20', status: 'PENDING', created_at: '2026-12-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Alex (Yo)', amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 12, period_year: 2026, due_date: '2026-12-10', status: 'PENDING', created_at: '2026-12-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Julia',      amount: 160.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 12, period_year: 2026, due_date: '2026-12-28', status: 'PENDING', created_at: '2026-12-01T10:00:00' },
  ]);

  // ── Computed ──
  filteredExpenses = computed(() =>
    this.expenses().filter(e =>
      e.period_month === this.selectedMonth() + 1 &&
      e.period_year === this.selectedYear()
    )
  );

  myExpenses = computed(() =>
    this.filteredExpenses()
      .filter(e => e.paidBy.includes('Yo'))
      .reduce((sum, e) => sum + e.amount, 0)
  );

  totalExpenses = computed(() =>
    this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0)
  );

  // ── Datos estáticos ──
  tabs = [
    { key: 'gastos',       label: 'Gastos'       },
    { key: 'saldos',       label: 'Saldos'       },
    { key: 'estadisticas', label: 'Estadísticas' },
  ];

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  years = [2024, 2025, 2026];

  // ── Métodos ──
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showMonthDropdown.set(!this.showMonthDropdown());
    this.showYearDropdown.set(false);
  }

  toggleYearDropdown(event: Event): void {
    event.stopPropagation();
    this.showYearDropdown.set(!this.showYearDropdown());
    this.showMonthDropdown.set(false);
  }

  selectMonth(index: number): void {
    this.selectedMonth.set(index);
    this.showMonthDropdown.set(false);
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.showYearDropdown.set(false);
  }

  @HostListener('document:click')
  onClickOutside(): void {
    this.showMonthDropdown.set(false);
    this.showYearDropdown.set(false);
  }

  openDetail(expense: Expense): void {
    this.selectedExpense.set(expense);
  }

  closeDetail(): void {
    this.selectedExpense.set(null);
  }

  onExpenseDeleted(expense: Expense): void {
    this.expenses.update(prev => prev.filter(e => e !== expense));
    this.selectedExpense.set(null);
  }

  setTab(key: string): void {
    this.activeTab.set(key as 'gastos' | 'saldos' | 'estadisticas');
  }

  openForm(): void {
    this.expenseForm.open();
  }

  onExpenseCreated(expense: Expense): void {
    this.expenses.update(prev => [expense, ...prev]);
  }
}