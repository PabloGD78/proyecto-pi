import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos una interfaz para que TypeScript sepa qué es un Alumno
export interface Student {
  id?: number;
  nombre: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  contacto_tutor?: string;
  id_ficha?: number;
  id_curso?: number;
  ultima_modificacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = 'http://localhost:3000/alumnos';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  crearAlumno(alumno: Student): Observable<any> {
    return this.http.post(this.apiUrl, alumno);
  }
}