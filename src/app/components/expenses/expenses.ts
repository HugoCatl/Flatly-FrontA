import { Component, ViewChild, HostListener, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from './components/expense-form/expense-form';
import { ExpenseDetail } from './components/expense-detail/expense-detail';
import { ExpenseStats } from './components/expense-stats/expense-stats';
import { ExpenseSaldos } from './components/expense-saldos/expense-saldos';
import { Expense } from '../../models/flatly';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, ExpenseForm, ExpenseDetail, ExpenseStats, ExpenseSaldos],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses {
  private dataService = inject(DataService);

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;

  expenses = this.dataService.expenses;

  months = this.dataService.months;
  years = this.dataService.years;
  tabs = this.dataService.tabs;

  

  // ── Estado ──
  activeTab = signal<'gastos' | 'saldos' | 'estadisticas'>('gastos');
  selectedMonth = signal(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());
  showMonthDropdown = signal(false);
  showYearDropdown = signal(false);
  selectedExpense = signal<Expense | null>(null);

  // ── Computed ──
  filteredExpenses = computed(() =>
    this.dataService.expenses().filter(e =>
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
    this.dataService.expenses.update(prev => prev.filter(e => e !== expense));
    this.selectedExpense.set(null);
  }

  setTab(key: string): void {
    this.activeTab.set(key as 'gastos' | 'saldos' | 'estadisticas');
  }

  openForm(): void {
    this.expenseForm.open();
  }

  onExpenseCreated(expense: Expense): void {
    this.dataService.expenses.update(prev => [expense, ...prev]);
  }
}