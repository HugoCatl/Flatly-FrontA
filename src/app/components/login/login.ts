import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(DataService);
  private router = inject(Router);

  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Comprobación al cargar
  ngOnInit() {
    // Al usar cookies, el token ya no se guarda en localStorage.
    // Comprobamos si existe el nombre de usuario para saber si ya estabas logueado.
    const userName = localStorage.getItem('user_name');
    if (userName) {
      console.log('Sesión detectada (nombre encontrado), saltando al Home...');
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.data.login(this.form.value).subscribe({
        next: (res: any) => {
          console.log('Login OK, cookie recibida');

          // 1. Guardamos el nombre para el saludo "Hola, Hugo" (Opcional pero recomendado)
          if (res && res.name) {
            localStorage.setItem('user_name', res.name);
          }

          // 2. Ya no guardamos token manual. El navegador gestiona la cookie.
          // 3. Redirigimos al Home
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al iniciar sesión. Revisa tus datos.');
        }
      });
    }
  }
}