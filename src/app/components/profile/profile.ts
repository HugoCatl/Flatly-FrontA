import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Role = 'ADMIN' | 'USER' | 'PROPIETARIO';

export interface User {
  id?: number;
  role: Role;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  phone?: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {

}
