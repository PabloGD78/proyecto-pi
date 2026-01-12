import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-add-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-alumno.component.html',
  styles: [`
    .form-container { 
      background: #ffffff; 
      padding: 30px; 
      border-radius: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
      border: 1px solid #e0e0e0;
    }
    .title { color: #2c3e50; margin-bottom: 20px; font-weight: 600; text-align: center; }
    .input-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #666; font-size: 0.9rem; }
    input { 
      width: 100%; 
      padding: 12px; 
      border: 1px solid #dcdde1; 
      border-radius: 6px; 
      box-sizing: border-box;
      transition: border-color 0.3s;
    }
    input:focus { border-color: #3498db; outline: none; }
    .btn-save { 
      width: 100%; 
      padding: 14px; 
      background: #27ae60; 
      color: white; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer; 
      font-size: 1rem; 
      font-weight: bold;
      margin-top: 10px;
    }
    .btn-save:hover { background: #219150; }
    .btn-save:disabled { background: #bdc3c7; cursor: not-allowed; }
  `]
})
export class AddAlumnoComponent {
  @Output() guardado = new EventEmitter<void>();

  nuevoAlumno = {
    nombre: '',
    apellidos: '',
    dni: '',
    fecha_nacimiento: '',
    contacto_tutor: '',
    curso_nombre: ''
  };

  constructor(private studentService: StudentService) {}

  registrar() {
    this.studentService.crearAlumno(this.nuevoAlumno).subscribe({
      next: (res: any) => {
        alert('✅ Alumno registrado y ficha vinculada con éxito');
        this.resetForm();
        this.guardado.emit(); // Cierra el formulario y refresca la tabla
      },
      error: (err: any) => {
        console.error('Error al registrar:', err);
        alert('❌ Error al guardar. Revisa que el servidor esté encendido.');
      }
    });
  }

  resetForm() {
    this.nuevoAlumno = {
      nombre: '', apellidos: '', dni: '', 
      fecha_nacimiento: '', contacto_tutor: '', curso_nombre: '' 
    };
  }
}