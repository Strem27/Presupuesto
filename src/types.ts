export type Category = 
  | 'Alimentación' | 'Transporte' | 'Servicios' | 'Ropa' | 'Entretenimiento' | 'Otros'
  | 'Salario' | 'Trabajo independiente' | 'Negocio' | 'Inversiones' | 'Regalo' | 'Bonificación' | 'Reembolso' | 'Otro';

export interface Movement {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  description?: string;
  type: 'expense' | 'income';
  paymentMethod?: string;
  observations?: string;
}

export type View = 'dashboard' | 'movements' | 'detail' | 'add' | 'add-income';

export interface Attachment {
  type: 'image' | 'audio';
  data: string; // base64
  mimeType: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  status?: 'sending' | 'sent' | 'error';
  isFunctionCall?: boolean;
  attachments?: Attachment[];
}

