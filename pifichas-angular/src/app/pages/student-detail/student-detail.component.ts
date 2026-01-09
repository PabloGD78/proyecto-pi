import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  student: any = null;
  studentId: number | null = null;
  activeTab = 'datos';
  
  dni: string = '';
  fechaNacimiento: string = '';
  contactoTutor: string = '';
  datosMedicos: string = '';
  adaptacionesCurriculares: string = '';
  id_ficha: number | null = null;
  
  nuevaObservacion: string = '';
  tipoObservacion: string = 'General';
  visibleAlTutor: boolean = false;
  observaciones: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef // Inyectamos esto para forzar el refresco visual
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.studentId = +idParam;
      this.loadStudentData(this.studentId);
      this.loadObservations(this.studentId);
    }
  }

  loadStudentData(id: number): void {
    console.log('Solicitando datos para ID:', id);
    this.studentService.getStudentById(id).subscribe({
      next: (data: any) => {
        // --- PASO CRÍTICO ---
        // Asignamos el objeto student inmediatamente para que desaparezca el "Cargando"
        this.student = data;
        
        // Usamos un try-catch para que si la fecha falla, no se bloquee el componente
        try {
          this.dni = data.dni || '';
          this.contactoTutor = data.contacto_tutor || '';
          this.datosMedicos = data.datos_medicos || '';
          this.adaptacionesCurriculares = data.adaptacion_curriculares || '';
          this.id_ficha = data.id_ficha;

          if (data.fecha_nacimiento) {
            const dateObj = new Date(data.fecha_nacimiento);
            // Verificamos que la fecha sea válida antes de convertirla
            if (!isNaN(dateObj.getTime())) {
              this.fechaNacimiento = dateObj.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          console.error("Error procesando campos secundarios:", e);
        }

        // Forzamos a Angular a que detecte los cambios (solución al error NG0505)
        this.cdr.detectChanges();
        console.log('Frontend actualizado con éxito:', this.student);
      },
      error: (err) => {
        console.error('Error en la recepción de datos:', err);
      }
    });
  }

  loadObservations(id: number): void {
    this.studentService.getObservations(id).subscribe({
      next: (data) => {
        this.observaciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Sin observaciones')
    });
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/alumnos']); 
  }

  saveChanges(): void {
    if (!this.studentId) return;

    const updateData = {
      dni: this.dni,
      fecha_nacimiento: this.fechaNacimiento,
      contacto_tutor: this.contactoTutor,
      datos_medicos: this.datosMedicos,
      adaptacion_curriculares: this.adaptacionesCurriculares,
      id_ficha: this.id_ficha
    };

    this.studentService.saveStudentDetail(this.studentId, updateData).subscribe({
      next: (response: any) => {
        alert('¡Información actualizada!');
        if (response.id_ficha) this.id_ficha = response.id_ficha;
        this.loadStudentData(this.studentId!);
      },
      error: (err) => alert('Error al guardar.')
    });
  }

  addObservation(): void {
    if (!this.nuevaObservacion.trim() || !this.studentId) return;

    const obsData = { 
      contenido: this.nuevaObservacion, 
      tipo: this.tipoObservacion, 
      visible_tutor: this.visibleAlTutor 
    };

    this.studentService.addObservation(this.studentId, obsData).subscribe({
      next: () => {
        this.loadObservations(this.studentId!);
        this.nuevaObservacion = '';
        alert('Observación añadida.');
      }
    });
  }

  getStudentInitials(): string {
    if (this.student?.nombre) {
      return (this.student.nombre.charAt(0) + (this.student.apellidos ? this.student.apellidos.charAt(0) : '')).toUpperCase();
    }
    return 'AL';
  }

  // Función para el botón de PDF
  generarPDF(): void {
    window.print();
  }
}