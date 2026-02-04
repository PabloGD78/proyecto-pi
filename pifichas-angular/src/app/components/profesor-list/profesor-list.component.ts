import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profesor-list.component.html',
  styleUrls: ['./profesor-list.component.css']
})
export class ProfesorListComponent implements OnInit {
  profesores: any[] = [];
  mostrarFormulario = false;
  cargando = true; 
  nuevoProfe = { nombre: '', email: '', contrasenia: '' };

  constructor(
    private http: HttpClient, 
    private cd: ChangeDetectorRef // ✅ Inyectado para forzar el refresco visual
  ) {}

  ngOnInit() {
    this.cargarProfesores();
  }

  cargarProfesores() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn("No se encontró token");
      this.cargando = false;
      return;
    }

    this.cargando = true;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    this.http.get<any[]>('http://localhost:3000/admin/profesores', { headers })
      .subscribe({
        next: (data) => {
          console.log("Servidor envió:", data);
          
          if (data && Array.isArray(data)) {
            // Filtramos al admin de forma segura
            const filtrados = data.filter(p => {
              const mail = (p.email || '').toLowerCase().trim();
              return mail !== 'admin@sistema.com';
            });

            this.profesores = [...filtrados]; 
          }
          
          // ✅ Finalizamos carga y forzamos a Angular a pintar la tabla
          this.cargando = false; 
          this.cd.detectChanges(); 
          console.log("Tabla lista con:", this.profesores.length, "profesores");
        },
        error: (err) => {
          console.error("Error en la petición:", err);
          this.cargando = false;
          this.cd.detectChanges();
          if (err.status === 401 || err.status === 403) {
            console.warn("Sesión expirada");
          }
        }
      });
  }

  guardarProfesor() {
    if (!this.nuevoProfe.nombre || !this.nuevoProfe.email || !this.nuevoProfe.contrasenia) {
      alert('Por favor, rellena todos los campos');
      return;
    }

    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    this.http.post('http://localhost:3000/admin/profesores', this.nuevoProfe, { headers })
      .subscribe({
        next: () => {
          alert('Profesor creado con éxito');
          this.nuevoProfe = { nombre: '', email: '', contrasenia: '' };
          this.mostrarFormulario = false;
          this.cargarProfesores();
        },
        error: () => alert('Error al guardar. El correo podría ya existir.')
      });
  }

  eliminarProfe(id: number, nombre: string) {
    if (confirm(`¿Seguro que quieres eliminar al profesor ${nombre}?`)) {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      this.http.delete(`http://localhost:3000/admin/profesores/${id}`, { headers })
        .subscribe(() => this.cargarProfesores());
    }
  }
}