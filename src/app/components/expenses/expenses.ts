import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Expense {
  name: string;
  paidBy: string;
  amount: number;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-expenses',
  imports: [CommonModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses {

  activeTab: 'gastos' | 'saldos' | 'estadisticas' = 'gastos';

  tabs = [
    { key: 'gastos',       label: 'Gastos'       },
    { key: 'saldos',       label: 'Saldos'       },
    { key: 'estadisticas', label: 'Estadísticas' },
  ];

  expenses: Expense[] = [
    { name: 'Alquiler',     paidBy: 'Alex (Yo)', amount: 800.00, icon: '🏢', iconClass: 'icon-alquiler' },
    { name: 'Electricidad', paidBy: 'Julia',      amount: 85.50,  icon: '💡', iconClass: 'icon-electric' },
    { name: 'Agua',         paidBy: 'Alex (Yo)', amount: 45.00,  icon: '💧', iconClass: 'icon-agua'     },
    { name: 'Internet',     paidBy: 'Guillermo',  amount: 50.00,  icon: '📶', iconClass: 'icon-internet' },
    { name: 'Varios',       paidBy: 'Alex (Yo)', amount: 120.00, icon: '🛒', iconClass: 'icon-varios'   },
  ];

  get myExpenses(): number {
    return this.expenses
      .filter(e => e.paidBy.includes('Yo'))
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalExpenses(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  setTab(key: string): void {
    this.activeTab = key as 'gastos' | 'saldos' | 'estadisticas';
  }
}