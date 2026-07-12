import React from 'react';
import { Movement } from '../types';
import { CategoryColor, CategoryIcon } from './Layout';
import { Search, Filter } from 'lucide-react';

interface MovementsListProps {
  movements: Movement[];
  onSelectMovement: (movement: Movement) => void;
  onAddExpense: () => void;
}

export default function MovementsList({ movements, onSelectMovement, onAddExpense }: MovementsListProps) {
  // Sort by date (desc)
  const sortedMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (movements.length === 0) {
    return (
      <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
          <History className="w-10 h-10 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white tracking-tight">Tus gastos van a vivir aquí</h4>
          <p className="text-slate-400 text-sm max-w-[240px]">cada vez que pagues algo, lo registras y aparece en esta lista</p>
        </div>
        <button 
          onClick={onAddExpense}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 ring-1 ring-white/10"
        >
          Registrar gasto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar movimiento..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-600 transition-all text-white backdrop-blur-xl"
          />
        </div>
        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 px-1">Julio 2026</h4>
          <div className="space-y-3">
            {sortedMovements.map((m) => (
              <button 
                key={m.id}
                onClick={() => onSelectMovement(m)}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group text-left backdrop-blur-xl shadow-xl ring-1 ring-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3.5 rounded-2xl border border-white/5", CategoryColor(m.category))}>
                    <CategoryIcon category={m.category} className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">{m.title}</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.category} • {m.date} • {m.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold tracking-tight group-hover:text-indigo-400 transition-colors",
                    m.type === 'income' ? 'text-emerald-400' : 'text-white'
                  )}>
                    {m.type === 'income' ? '+' : '-'}$ {m.amount.toLocaleString('es-CO')}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">COP</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { History } from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
