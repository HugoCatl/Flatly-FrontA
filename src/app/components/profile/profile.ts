import { Component ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';


@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private dataService = inject(DataService);
  
  user = this.dataService.user;



}