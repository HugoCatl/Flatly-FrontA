import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Inyectamos el cliente HTTP (forma moderna de Angular 21)
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Creamos un Signal para que tus componentes se enteren de los cambios al instante
  public datosDelDocker = signal<any[]>([]);
  public cargando = signal<boolean>(false);

  constructor() { }

  /**
   * Método para obtener datos de la API de tu compañero
   * @param endpoint El nombre de la ruta (ej: 'usuarios')
   */
  obtenerDatos(endpoint: string) {
    this.cargando.set(true);
    
    this.http.get<any[]>(`${this.baseUrl}/${endpoint}`).subscribe({
      next: (respuesta) => {
        this.datosDelDocker.set(respuesta);
        this.cargando.set(false);
        console.log('✅ Conexión con VPN exitosa');
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('❌ Error de conexión con el Docker de tu colega:', err);
      }
    });
  }
}