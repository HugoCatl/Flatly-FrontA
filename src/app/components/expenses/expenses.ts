import { Component, ViewChild, HostListener, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseForm } from './components/expense-form/expense-form';
import { ExpenseDetail } from './components/expense-detail/expense-detail';
import { ExpenseStats } from './components/expense-stats/expense-stats';
import { ExpenseSaldos } from './components/expense-saldos/expense-saldos';
import { Expense,ExpenseTabType,Tab } from '../../models/flatly';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ExpenseForm, ExpenseDetail, ExpenseStats, ExpenseSaldos],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses implements OnInit {
  // ✅ SonarLint: Marcado como readonly
  private readonly dataService = inject(DataService);

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;

  // Signals heredadas del servicio
  user = this.dataService.user;
  expenses = this.dataService.expenses;
  personalExpenses = this.dataService.personalExpenses;
  months = this.dataService.months;
  years = this.dataService.years;
tabs: Tab[] = [
    { key: 'gastos',       label: 'Gastos'       },
    { key: 'saldos',       label: 'Saldos'       },
    { key: 'estadisticas', label: 'Estadísticas' },
  ];

  // ── Estado Local ──
  activeTab = signal<ExpenseTabType>('gastos');
  selectedMonth = signal(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());
  
  showMonthDropdown = signal(false);
  showYearDropdown = signal(false);
  
  selectedExpense = signal<Expense | null>(null);
  billStatus = signal<'idle' | 'success' | 'error'>('idle');

  // ── Computados ──
  filteredExpenses = computed(() => {
    const all = this.expenses();
    const month = this.selectedMonth();
    const year  = this.selectedYear();
    return all.filter(e =>
      e.period_month - 1 === month &&
      e.period_year === year
    );
  });

  myExpenses = computed(() =>
    this.filteredExpenses()
      .filter(e => e.paidBy === this.user()?.name)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  totalExpenses = computed(() =>
    this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0)
  );

  ngOnInit(): void {
    this.dataService.loadHouseholdBills();
  }

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

  // ✅ CORRECCIÓN: Método para borrar usando el servicio
  onExpenseDeleted(expense: Expense): void {
    console.log('Solicitando eliminación:', expense);
    
    if (expense.id) {
        this.dataService.deleteBill(expense.id).subscribe({
            next: () => {
                console.log('Factura eliminada');
                this.closeDetail();
                // El servicio ya debería recargar la lista automáticamente con tap()
            },
            error: (err) => {
                console.error('Error al eliminar factura:', err);
            }
        });
    }
  }

  // ✅ CORRECCIÓN: Método para crear usando el servicio
  handleExpenseCreated(newExpense: Expense): void {
    this.dataService.createBill(newExpense).subscribe({
      next: () => {
        this.billStatus.set('success');
        setTimeout(() => this.billStatus.set('idle'), 3000);
      },
      error: () => {
        this.billStatus.set('error');
        setTimeout(() => this.billStatus.set('idle'), 3000);
      }
    });
  }

setTab(tab: ExpenseTabType): void {
    this.activeTab.set(tab);
  }
}