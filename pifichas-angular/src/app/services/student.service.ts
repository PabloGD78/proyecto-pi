import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  // Asegúrate de que esta URL es accesible desde tu navegador
  private apiUrl = 'http://localhost:3000/alumnos';

  constructor(private http: HttpClient) { }

  // 1. Obtener lista de todos los alumnos
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener lista de cursos
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/cursos`);
  }

  // 2. Obtener detalle de un alumno (Carga datos personales + ficha médica)
  // Esta función es la que rellena la vista del "Informe"
  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear un nuevo alumno en la base de datos
  crearAlumno(alumno: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, alumno);
  }

  // 4. Guardar los cambios realizados en el detalle o la ficha
  // Envía los datos a la ruta /alumnos/:id/guardar del backend
  saveStudentDetail(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/guardar`, data);
  }

  // 5. Obtener el historial de observaciones del alumno
  getObservations(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${studentId}/observaciones`);
  }

  // 6. Añadir una nueva observación al historial
  addObservation(studentId: number, observation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${studentId}/observacion`, observation);
  }

  // 7. Borrar una observación por su id
  deleteObservation(observationId: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:3000/observaciones/${observationId}`);
  }

  // 8. Eliminar un alumno completamente
  deleteStudent(studentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${studentId}`);
  }

  // 9. Obtener todos los módulos de un alumno
  getModulos(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${studentId}/modulos`);
  }

  // 10. Agregar un nuevo módulo
  addModulo(studentId: number, modulo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${studentId}/modulo`, modulo);
  }

  // 11. Actualizar un módulo
  updateModulo(moduloId: number, modulo: any): Observable<any> {
    return this.http.put<any>(`http://localhost:3000/modulos/${moduloId}`, modulo);
  }

  // 12. Eliminar un módulo
  deleteModulo(moduloId: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:3000/modulos/${moduloId}`);
  }
}