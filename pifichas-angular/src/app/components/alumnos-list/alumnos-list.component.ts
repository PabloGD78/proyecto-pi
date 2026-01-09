import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <--- IMPORTANTE
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student'; 
import { AddAlumnoComponent } from '../add-alumno/add-alumno.component';

@Component({
  selector: 'app-alumnos-list',
  standalone: true,
  imports: [CommonModule, AddAlumnoComponent],
  templateUrl: './alumnos-list.component.html',
  styleUrls: ['./alumnos-list.component.css']
})
export class AlumnosListComponent implements OnInit {
  alumnos: Student[] = [];
  mostrarFormulario: boolean = false;

  constructor(
    private studentService: StudentService,
    private router: Router // <--- INYECTAR ROUTER
  ) {}

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.studentService.getStudents().subscribe({
      next: (data) => this.alumnos = data,
      error: (err) => console.error('Error al cargar:', err)
    });
  }

  // SOLUCIÓN ERROR 2: Esta función no existía
  verDetalle(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/student', id]);
    }
  }

  onAlumnoGuardado(): void {
    this.mostrarFormulario = false;
    this.cargarAlumnos();
  }
}