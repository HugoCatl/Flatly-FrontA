import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { Expense } from '../expense-form/expense-form';
import { BottomSheet } from '../../../shared/bottom-sheet/bottom-sheet';

Chart.register(...registerables);

interface StatsConfig {
  chartType: 'bar' | 'line' | 'pie';
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

// Colores distintivos que combinan con el tema esmeralda
const PERSON_COLORS = [
  { bg: 'rgba(16, 185, 129, 0.75)',  border: '#10B981' }, // emerald
  { bg: 'rgba(99, 102, 241, 0.75)',  border: '#6366F1' }, // indigo
  { bg: 'rgba(245, 158, 11, 0.75)',  border: '#F59E0B' }, // amber
  { bg: 'rgba(236, 72, 153, 0.75)',  border: '#EC4899' }, // pink
  { bg: 'rgba(14, 165, 233, 0.75)',  border: '#0EA5E9' }, // sky
];

@Component({
  selector: 'app-expense-stats',
  imports: [CommonModule, FormsModule, BaseChartDirective, BottomSheet],
  templateUrl: './expense-stats.html',
  styleUrl: './expense-stats.scss',
})
export class ExpenseStats {

  @Input() set expenses(value: Expense[]) {
    this._expenses = value;
    this.buildCharts();
  }

  _expenses: Expense[] = [];
  showConfig = false;

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  monthsShort = [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ];

  years = [2024, 2025, 2026];

  chartTypes: { value: 'bar' | 'line' | 'pie'; label: string; icon: string }[] = [
    { value: 'bar',  label: 'Barras', icon: '📊' },
    { value: 'line', label: 'Líneas', icon: '📈' },
    { value: 'pie',  label: 'Tarta',  icon: '🥧' },
  ];

  config: StatsConfig = {
    chartType: 'bar',
    fromMonth: new Date().getMonth(),
    fromYear: new Date().getFullYear(),
    toMonth: new Date().getMonth(),
    toYear: new Date().getFullYear(),
  };

  get filteredExpenses(): Expense[] {
    return this._expenses.filter(e => {
      const eDate = e.period_year * 12 + e.period_month;
      const from = this.config.fromYear * 12 + (this.config.fromMonth + 1);
      const to = this.config.toYear * 12 + (this.config.toMonth + 1);
      return eDate >= from && eDate <= to;
    });
  }

  get totalAll(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }

  get expenseCount(): number {
    return this.filteredExpenses.length;
  }

  monthlyChartData: ChartData = { labels: [], datasets: [] };
  personChartData: ChartData = { labels: [], datasets: [] };

  get monthlyChartOptions(): ChartOptions {
    const isPie = this.config.chartType === 'pie';
    
    return {
      responsive: true,
      plugins: {
        legend: {
          display: false,
          labels: { generateLabels: () => [] }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${((ctx.parsed as any).y ?? ctx.parsed ?? 0).toFixed(2)} €`
          }
        }
      },
      scales: isPie ? {
        x: { display: false },
        y: { display: false }
      } : {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `${value} €` },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    };
  }

  get personChartOptions(): ChartOptions {
    const isPie = this.config.chartType === 'pie';
    
    return {
      responsive: true,
      plugins: {
        legend: { display: isPie },
        tooltip: {
          callbacks: {
            label: ctx => `${((ctx.parsed as any).y ?? ctx.parsed ?? 0).toFixed(2)} €`
          }
        }
      },
      scales: isPie ? {
        x: { display: false },
        y: { display: false }
      } : {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `${value} €` },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
      }
    };
  }

  openConfig(): void {
    this.showConfig = true;
  }

  applyConfig(): void {
    this.showConfig = false;
    this.buildCharts();
  }

  dismissConfig(): void {
    this.showConfig = false;
  }

  private buildCharts(): void {
    this.buildMonthlyChart();
    this.buildPersonChart();
  }

  private buildMonthlyChart(): void {
    const totals: Record<string, number> = {};

    this.filteredExpenses.forEach(e => {
      const key = `${this.monthsShort[e.period_month - 1]} ${e.period_year}`;
      totals[key] = (totals[key] || 0) + e.amount;
    });

    const sorted = Object.entries(totals).sort((a, b) => {
      const [aMonth, aYear] = a[0].split(' ');
      const [bMonth, bYear] = b[0].split(' ');
      if (aYear !== bYear) return Number(aYear) - Number(bYear);
      return this.monthsShort.indexOf(aMonth) - this.monthsShort.indexOf(bMonth);
    });

    this.monthlyChartData = {
      labels: sorted.map(([label]) => label),
      datasets: [{
        data: sorted.map(([, value]) => value),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: this.config.chartType !== 'line' ? 8 : 0,
        fill: this.config.chartType === 'line',
        tension: 0.4,
        hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
      }]
    };
  }

  private buildPersonChart(): void {
    const totals: Record<string, number> = {};

    this.filteredExpenses.forEach(e => {
      totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
    });

    const keys = Object.keys(totals);

    this.personChartData = {
      labels: keys,
      datasets: [{
        data: Object.values(totals),
        backgroundColor: keys.map((_, i) => PERSON_COLORS[i % PERSON_COLORS.length].bg),
        borderColor: keys.map((_, i) => PERSON_COLORS[i % PERSON_COLORS.length].border),
        borderWidth: 2,
        borderRadius: this.config.chartType !== 'line' ? 8 : 0,
        fill: this.config.chartType === 'line',
        tension: 0.4,
        hoverBackgroundColor: keys.map((_, i) =>
          PERSON_COLORS[i % PERSON_COLORS.length].bg.replace('0.75', '0.95')
        ),
      }]
    };
  }
}