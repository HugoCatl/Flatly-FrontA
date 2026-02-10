import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb = inject(FormBuilder);
  private data = inject(DataService);
  private router = inject(Router);

  showPassword = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.data.register(this.form.value).subscribe({
        next: (res) => {
          console.log('Registro exitoso:', res);
          // Tras registrarse, lo mandamos al login para que entre
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          alert('Error al conectar con el servidor de la VPN');
        }
      });
    }
  }
}