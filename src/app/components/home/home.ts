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
    this.loadHomeData();
  }

  loadHomeData() {
    // 1. Pedimos tu perfil (GET /users/me) 
    this.dataService.getMyProfile().subscribe({
      next: (profile) => {
        console.log('Perfil cargado con éxito:', profile);
        this.user = profile;
        this.loading = false; // Quitamos el cargador
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.loading = false; // ¡IMPORTANTE! Quitamos el cargador aunque falle

        if (err.status === 401 || err.status === 403) {
          alert('Tu sesión ha caducado o no tienes permiso.');
        }
      }
    });

    // 2. Pedimos los gastos (GET /students/expenses) 
    this.dataService.getPendingExpenses().subscribe({
      next: (list) => {
        console.log('Gastos cargados:', list);
        this.expenses = list;
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }
}