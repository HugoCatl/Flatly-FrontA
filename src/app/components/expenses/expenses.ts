import { Component, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm, Expense } from './components/expense-form/expense-form';
import { ExpenseDetail } from './components/expense-detail/expense-detail';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, ExpenseForm, ExpenseDetail],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses {

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;

  activeTab: 'gastos' | 'saldos' | 'estadisticas' = 'gastos';

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

  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  showMonthDropdown = false;
  showYearDropdown = false;

  selectedExpense: Expense | null = null;

  get selectedMonthLabel(): string {
    return `${this.months[this.selectedMonth]} ${this.selectedYear}`;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showMonthDropdown = !this.showMonthDropdown;
    this.showYearDropdown = false;
  }

  toggleYearDropdown(event: Event): void {
    event.stopPropagation();
    this.showYearDropdown = !this.showYearDropdown;
    this.showMonthDropdown = false;
  }

  selectMonth(index: number): void {
    this.selectedMonth = index;
    this.showMonthDropdown = false;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.showYearDropdown = false;
  }

  @HostListener('document:click')
  onClickOutside(): void {
    this.showMonthDropdown = false;
    this.showYearDropdown = false;
  }

  openDetail(expense: Expense): void {
    this.selectedExpense = expense;
  }

  closeDetail(): void {
    this.selectedExpense = null;
  }

  onExpenseDeleted(expense: Expense): void {
    this.expenses = this.expenses.filter(e => e !== expense);
    this.selectedExpense = null;
  }

  expenses: Expense[] = [
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 2, period_year: 2026, due_date: '2026-02-05', status: 'PAID',    created_at: '2026-02-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 85.50,  icon: '💡', iconClass: 'icon-electric', period_month: 2, period_year: 2026, due_date: '2026-02-15', status: 'PENDING', created_at: '2026-02-01T10:00:00' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 45.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 2, period_year: 2026, due_date: '2026-02-20', status: 'PENDING', created_at: '2026-02-01T10:00:00' },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 2, period_year: 2026, due_date: '2026-02-10', status: 'OVERDUE', created_at: '2026-02-01T10:00:00' },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 120.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 2, period_year: 2026, due_date: '2026-02-28', status: 'PENDING', created_at: '2026-02-01T10:00:00' },
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 1, period_year: 2026, due_date: '2026-01-05', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 90.00,  icon: '💡', iconClass: 'icon-electric', period_month: 1, period_year: 2026, due_date: '2026-01-15', status: 'PAID',    created_at: '2026-01-01T10:00:00' },
  ];

  get filteredExpenses(): Expense[] {
    return this.expenses.filter(e =>
      e.period_month === this.selectedMonth + 1 &&
      e.period_year === this.selectedYear
    );
  }

  get myExpenses(): number {
    return this.filteredExpenses
      .filter(e => e.paidBy.includes('Yo'))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalExpenses(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }

  setTab(key: string): void {
    this.activeTab = key as 'gastos' | 'saldos' | 'estadisticas';
  }

  openForm(): void {
    this.expenseForm.open();
  }

  onExpenseCreated(expense: Expense): void {
    this.expenses.unshift(expense);
  }
}