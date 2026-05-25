export type Role = 'admin' | 'profesor' | 'alumno'

export interface UserProfile {
  id: string
  email: string
  nombre: string
  role: Role
  created_at: string
}

export interface Lead {
  id: number
  nombre: string
  celular: string
  correo: string
  fuente: 'WhatsApp' | 'Landing' | 'Referido' | 'Otro'
  tiene_grupo: boolean
  estado: 'new' | 'contact' | 'interest' | 'closed'
  nota: string
  grupo_id: number | null
  pago_confirmado: boolean
  created_at: string
}

export interface Grupo {
  id: number
  nombre: string
  horario: string
  dias: string
  profesor_id: string
  profesor_nombre: string
  max_alumnos: number
  created_at: string
}

export interface Sesion {
  id: number
  grupo_id: number
  numero: number
  realizada: boolean
  no_realizada: boolean
  correo_enviado: boolean
  foto_adjunta: boolean
  foto_url: string | null
  feedback: string
  fecha: string | null
}

export interface Cierre {
  id: number
  grupo_id: number
  nps_enviado: boolean
  certificado_enviado: boolean
  pago_confirmado: boolean
}

export interface MaterialItem {
  id: number
  sesion_numero: number
  nombre: string
  url: string
  created_at: string
}
