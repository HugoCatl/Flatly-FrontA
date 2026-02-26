import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { Usuario, Factura } from '../../models/flatly';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private dataService = inject(DataService);

  user = this.dataService.user;
  expenses = this.dataService.expenses;
  loading = this.dataService.loading;


  ngOnInit() {
    this.dataService.loadHomeData();
    this.dataService.downloadHouseholdBills();
  }
}