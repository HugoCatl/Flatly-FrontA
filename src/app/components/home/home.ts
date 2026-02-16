import { Component, OnInit, inject } from '@angular/core';
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

  user?: Usuario;
  expenses: Factura[] = [];
  loading = true;

  ngOnInit() {
    //this.dataService.logout();
    this.checkSession();
  }

  checkSession() {
    this.dataService.checkSession();
    if (this.loading) {
      this.loadHomeData();
    }else {
      this.dataService.logout()
      console.warn('No se cargan datos porque loading es false. Esto puede ser un error en el flujo de la aplicación.');
    }
  }

  loadHomeData() {
    this.dataService.getMyProfile()
    this.dataService.getPendingExpenses()
  }
}