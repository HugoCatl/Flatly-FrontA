import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { BillStatus, Role } from '../../models/flatly';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);

  user     = this.dataService.user;
  loading  = this.dataService.loading;
  expenses = this.dataService.expenses;

  // ── Resumen del mes actual ──
  private readonly nowMonth = new Date().getMonth() + 1; // 1-indexed
  private readonly nowYear  = new Date().getFullYear();

  currentMonthExpenses = computed(() =>
    this.expenses().filter(e =>
      e.period_month === this.nowMonth &&
      e.period_year  === this.nowYear
    )
  );

  currentMonthTotal = computed(() =>
    this.currentMonthExpenses().reduce((sum, e) => sum + e.amount, 0)
  );

  myMonthTotal = computed(() =>
    this.currentMonthExpenses()
      .filter(e => e.paidBy === this.user()?.name || e.paidBy === 'Yo')
      .reduce((sum, e) => sum + e.amount, 0)
  );

  myMonthPercent = computed(() => {
    const total = this.currentMonthTotal();
    if (total === 0) return 0;
    return Math.round((this.myMonthTotal() / total) * 100);
  });

  // ── Pagos pendientes ──
  pendingExpenses = computed(() =>
    this.expenses().filter(e => e.status === BillStatus.PENDING)
  );

  ngOnInit() {
    const session = localStorage.getItem('user_session');
    if (session) {
      const { role } = JSON.parse(session);
      if (role === Role.OWNER) {
        this.router.navigate(['/home-owners']);
        return;
      }
    }
    this.dataService.loadHomeData();
    this.dataService.loadAllBills();
  }
}
