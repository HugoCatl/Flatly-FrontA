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

  ngOnInit() {
    // Verificar sesión con el backend (cookie)
    this.data.checkSession().subscribe({
      next: () => {
        console.log('Sesión activa, redirigiendo al Home...');
        this.router.navigate(['/home']);
      },
      error: () => {
        // No hay sesión válida, quedarse en login
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_name');
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.data.login(this.form.value).subscribe({
        next: (res: any) => {
          console.log('Login OK:', res);

          // Guardamos info del usuario solo para la UI (no para auth)
          if (res?.user) {
            const session = {
              email: res.user.email,
              id: res.user.id,
              role: res.user.role
            };
            localStorage.setItem('user_session', JSON.stringify(session));
            localStorage.setItem('user_name', res.user.name);
          }

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
