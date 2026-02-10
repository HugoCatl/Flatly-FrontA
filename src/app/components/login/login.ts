import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data'; // Importando directo de data.ts

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html', // Nombre limpio
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private data = inject(DataService);
  private router = inject(Router);

  // Formulario reactivo simple
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.form.valid) {
      this.data.login(this.form.value).subscribe({
        next: (res) => {
          console.log('Login OK:', res);
          // Aquí guardaremos el token más adelante
          this.router.navigate(['/home']); 
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
    }
  }
}