import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/alumnos';
  private baseUrl = 'http://localhost:3000'; // Simplificamos para otras rutas

  constructor(private http: HttpClient) { }

  // 1. Obtener lista de todos los alumnos
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener lista de cursos
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cursos`);
  }

  // 2. Obtener detalle de un alumno
  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear un nuevo alumno
  crearAlumno(alumno: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, alumno);
  }

  // 4. Guardar los cambios realizados en el detalle o la ficha
  saveStudentDetail(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/guardar`, data);
  }

  // 5. Obtener el historial de observaciones
  getObservations(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${studentId}/observaciones`);
  }

  // 6. Añadir una nueva observación
  addObservation(studentId: number, observation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${studentId}/observacion`, observation);
  }

  // 7. Borrar una observación
  deleteObservation(observationId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/observaciones/${observationId}`);
  }

  // 8. Eliminar un alumno
  deleteStudent(studentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${studentId}`);
  }

  // 9. Obtener módulos específicos vinculados a un alumno (relación alumno_modulo)
  getModulos(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${studentId}/modulos`);
  }

  // 10. Agregar un nuevo módulo
  addModulo(studentId: number, modulo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${studentId}/modulo`, modulo);
  }

  // 11. Actualizar un módulo
  updateModulo(moduloId: number, modulo: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/modulos/${moduloId}`, modulo);
  }

  // 12. Eliminar un módulo
  deleteModulo(moduloId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/modulos/${moduloId}`);
  }

  // --- NUEVA FUNCIÓN CRÍTICA ---
  // 13. Obtiene los módulos base de la tabla 'modulo' filtrando por ID de curso
  // Esto es lo que permite cargar los datos que metimos por SQL
  getModulosPorCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cursos/${idCurso}/modulos`);
  }
}