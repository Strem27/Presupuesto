import React, { useState } from 'react';
import { Category, Movement } from '../types';
import { CategoryColor, CategoryIcon } from './Layout';
import { Check, X } from 'lucide-react';

interface AddIncomeProps {
  onSave: (income: Omit<Movement, 'id'>) => void;
  onCancel: () => void;
}

const INCOME_CATEGORIES: Category[] = [
  'Salario',
  'Trabajo independiente',
  'Negocio',
  'Inversiones',
  'Regalo',
  'Bonificación',
  'Reembolso',
  'Otro'
];

const PAYMENT_METHODS = [
  'Efectivo',
  'Cuenta bancaria',
  'Nequi',
  'Daviplata',
  'Tarjeta',
  'Otro'
];

export default function AddIncome({ onSave, onCancel }: AddIncomeProps) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Salario');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cuenta bancaria');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero');
      return;
    }
    if (!title) {
      setError('Por favor ingresa una descripción para el ingreso');
      return;
    }

    onSave({
      title,
      amount: Number(amount),
      category,
      date,
      type: 'income',
      paymentMethod,
      observations
    });

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
          <Check className="w-10 h-10 text-[#0F172A] stroke-[3px]" />
        </div>
        <p className="text-xl font-bold text-white text-center">
          ✅ Ingreso registrado correctamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pt-2">
      {/* Amount Input */}
      <div className="space-y-4 text-center">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">Valor del Ingreso</p>
        <div className="relative inline-block w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-light text-indigo-400 opacity-50">$</span>
          <input 
            autoFocus
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            className="w-full bg-transparent text-6xl font-light text-center text-white focus:outline-none placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tracking-tight"
          />
          {!amount && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-12 bg-indigo-500 animate-pulse ml-4" />
          )}
        </div>
        {amount && (
           <p className="text-emerald-400 font-bold text-lg">
             ${Number(amount).toLocaleString('es-CO')} COP
           </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Descripción</p>
          <input 
            type="text"
            placeholder="Ej: Salario, Freelance..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-600 transition-all text-white backdrop-blur-xl"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Categoría</p>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white backdrop-blur-xl appearance-none"
            >
              {INCOME_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#0F172A]">{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Fecha</p>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Medio de Pago</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "py-3 px-4 rounded-xl border text-xs font-bold transition-all",
                  paymentMethod === method 
                    ? "bg-indigo-600 border-indigo-400 text-white" 
                    : "bg-white/5 border-white/10 text-slate-400"
                )}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Observaciones (Opcional)</p>
          <textarea 
            placeholder="Detalles adicionales..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-600 transition-all text-white backdrop-blur-xl min-h-[100px] resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-center text-rose-500 text-sm font-bold animate-pulse tracking-wide uppercase">{error}</p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button 
          type="submit"
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] rounded-[2rem] text-[#0F172A] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
        >
          <Check className="w-6 h-6 stroke-[3px]" />
          Guardar Ingreso
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="w-full py-5 bg-white/5 hover:bg-white/10 active:scale-[0.98] rounded-[2rem] text-slate-400 font-bold text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
      </div>
    </form>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
