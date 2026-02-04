import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modulo } from '../models/modulo';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Obtiene módulos específicos vinculados a un alumno (notas/estado)
  getModulosAlumno(idAlumno: number): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/alumnos/${idAlumno}/modulos`);
  }

  // NUEVO: Obtiene los módulos base que insertamos por SQL según el curso
  getModulosPorCurso(idCurso: number): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/cursos/${idCurso}/modulos`);
  }
}