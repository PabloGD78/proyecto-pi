export interface Student {
  id?: number;
  nombre: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  contacto_tutor?: string;
  id_ficha?: number;
  id_curso?: number;
  grupo?: string;
  ultima_modificacion?: string;
  // Campos extra que vienen de la ficha en el detalle
  alergias?: string;
  medicacion?: string;
  ficha_comentarios?: string;
}