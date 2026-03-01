import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { Role } from '../../models/flatly';

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

  user = this.dataService.user;
  loading = this.dataService.loading;

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
    this.dataService.loadHouseholdBills();
  }
}