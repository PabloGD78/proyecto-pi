import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  studentId: number | null = null;
  activeTab = 'datos';
  
  // Form data for Datos Básicos
  dni = 'Cargando...';
  fechaNacimiento = 'Cargando...';
  contactoTutor = 'Cargando...';
  
  // Form data for Ficha
  datosMedicos = '';
  adaptacionesCurriculares = '';
  
  // Form data for Observaciones
  nuevaObservacion = '';
  tipoObservacion = '';
  visibleAlTutor = false;
  observaciones = [
    { fecha: '12/05/2025', tipo: 'Conducta', contenido: 'Comentario de ejemplo de 120 caracteres para simular contenido.' },
    { fecha: '28/04/2025', tipo: 'Académico', contenido: 'El alumno ha mostrado una gran mejoría en la asignatura de PI.' },
    { fecha: '15/03/2025', tipo: 'Social', contenido: 'Requiere apoyo adicional en el trabajo en grupo con sus compañeros.' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = +params['id'];
      this.loadStudent(this.studentId);
    });
  }

  loadStudent(id: number): void {
    const students = this.studentService.getStudents();
    this.student = students.find(s => s.id === id) || null;
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  saveChanges(): void {
    alert('Cambios guardados');
  }

  addObservation(): void {
    if (this.nuevaObservacion.trim()) {
      const today = new Date().toLocaleDateString('es-ES');
      this.observaciones.unshift({
        fecha: today,
        tipo: this.tipoObservacion || 'Otro',
        contenido: this.nuevaObservacion
      });
      this.nuevaObservacion = '';
      this.tipoObservacion = '';
    }
  }

  getStudentInitials(): string {
    if (this.student) {
      const parts = this.student.nombre.split(' ');
      return parts[0].charAt(0).toUpperCase() + (parts[1]?.charAt(0).toUpperCase() || '');
    }
    return '';
  }

  generateReport(): void {
    alert('Generando informe rápido...');
  }
}
