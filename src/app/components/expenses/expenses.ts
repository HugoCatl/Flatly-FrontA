import { Component, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from './components/expense-form/expense-form';

interface Expense {
  name: string;
  paidBy: string;
  amount: number;
  icon: string;
  iconClass: string;
  period_month: number;
  period_year: number;
}

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, ExpenseForm],
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

  expenses: Expense[] = [
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 2, period_year: 2026 },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 85.50,  icon: '💡', iconClass: 'icon-electric', period_month: 2, period_year: 2026 },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 45.00,  icon: '💧', iconClass: 'icon-agua',     period_month: 2, period_year: 2026 },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet', period_month: 2, period_year: 2026 },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 120.00, icon: '🛒', iconClass: 'icon-varios',   period_month: 2, period_year: 2026 },
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler', period_month: 1, period_year: 2026 },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 90.00,  icon: '💡', iconClass: 'icon-electric', period_month: 1, period_year: 2026 },
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