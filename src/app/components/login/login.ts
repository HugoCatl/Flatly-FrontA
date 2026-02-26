import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { Role } from '../../models/flatly';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private router = inject(Router);

  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.dataService.checkSession().subscribe({
      next: (res: any) => {
        const role: Role = res?.role ?? res?.user?.role;
        if (role === Role.OWNER) {
          this.router.navigate(['/home-owners']);
        } else {
          this.router.navigate(['/home']);
          this.dataService.loadHomeData();
          if (this.dataService.sesion()) { this.dataService.downloadHouseholdBills(); }
        }
      },
      error: () => {
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_name');
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dataService.login(this.form.value).subscribe({
        next: (res: any) => {
          console.log('Login OK:', res);
          this.dataService.sesion.set(true);
          this.dataService.profile.set(res.user);

          if (res?.user) {
            localStorage.setItem('user_session', JSON.stringify({
              email: res.user.email,
              id: res.user.id,
              role: res.user.role
            }));
            localStorage.setItem('user_name', res.user.name);
          }

          if (res?.user?.role === Role.OWNER) {
            this.router.navigate(['/home-owners']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al iniciar sesión. Revisa tus datos.');
        }
      });
    }
  }
}
