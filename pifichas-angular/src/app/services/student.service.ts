import { Injectable } from '@angular/core';
import { Student } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private students: Student[] = [
    {
      id: 101,
      nombre: 'Juan Martínez Guerrero',
      grupo: 'DAW 2',
      ultimaModificacion: '10/11/2025',
    },
    {
      id: 102,
      nombre: 'Andrés González Pérez',
      grupo: 'DAM 1',
      ultimaModificacion: '24/10/2025',
    },
    {
      id: 103,
      nombre: 'Lucia Guerra León',
      grupo: 'DAW 2',
      ultimaModificacion: '13/10/2025',
    },
    {
      id: 104,
      nombre: 'Antonio Martínez López',
      grupo: 'DAM 2',
      ultimaModificacion: '08/10/2025',
    },
    {
      id: 105,
      nombre: 'Andrea Dorado González',
      grupo: 'DAW 1',
      ultimaModificacion: '30/09/2025',
    },
  ];

  getStudents(): Student[] {
    return this.students;
  }

  getStudentById(id: number): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  addStudent(student: Student): void {
    this.students.push(student);
  }

  updateStudent(student: Student): void {
    const index = this.students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      this.students[index] = student;
    }
  }

  deleteStudent(id: number): void {
    this.students = this.students.filter(s => s.id !== id);
  }
}
