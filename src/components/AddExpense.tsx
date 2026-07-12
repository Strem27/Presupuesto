import React, { useState } from 'react';
import { Category, Movement } from '../types';
import { CategoryColor, CategoryIcon } from './Layout';
import { Check } from 'lucide-react';

interface AddExpenseProps {
  onSave: (movement: Omit<Movement, 'id'>) => void;
}

const CATEGORIES: Category[] = [
  'Alimentación',
  'Transporte',
  'Servicios',
  'Ropa',
  'Entretenimiento',
  'Otros'
];

export default function AddExpense({ onSave }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Otros');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }
    if (!title) {
      setError('Por favor ingresa un nombre para el gasto');
      return;
    }

    onSave({
      title,
      amount: Number(amount),
      category,
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'expense'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pt-4">
      {/* Amount Input */}
      <div className="space-y-4 text-center">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">Monto del Gasto</p>
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
          {/* Mock cursor animation like in mockup */}
          {!amount && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-12 bg-indigo-500 animate-pulse ml-4" />
          )}
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">¿En qué gastaste?</p>
          <input 
            type="text"
            placeholder="Ej: Cena con amigos, Netflix..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-600 transition-all text-white backdrop-blur-xl"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-4">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-2">Categoría del Movimiento</p>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-[2rem] border transition-all backdrop-blur-xl",
                  category === cat 
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 scale-105 z-10" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-2xl border border-white/5 shadow-inner",
                  category === cat ? "bg-white/20" : CategoryColor(cat)
                )}>
                  <CategoryIcon category={cat} className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-center text-rose-500 text-sm font-bold animate-pulse tracking-wide uppercase">{error}</p>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button 
          type="submit"
          className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3"
        >
          <Check className="w-6 h-6 stroke-[3px]" />
          Guardar Gasto
        </button>
      </div>
    </form>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
