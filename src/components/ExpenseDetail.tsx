import React from 'react';
import { Movement } from '../types';
import { CategoryColor, CategoryIcon } from './Layout';
import { Calendar, Tag, FileText, CreditCard, Edit2, Share2 } from 'lucide-react';

interface ExpenseDetailProps {
  movement: Movement;
  onEdit: () => void;
  onBack: () => void;
}

export default function ExpenseDetail({ movement, onEdit, onBack }: ExpenseDetailProps) {
  const isIncome = movement.type === 'income';

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="text-center py-8">
        <div className={cn("inline-flex p-6 rounded-[2rem] mb-6 border border-white/5 backdrop-blur-xl shadow-2xl", CategoryColor(movement.category))}>
          <CategoryIcon category={movement.category} className="w-12 h-12" />
        </div>
        <h2 className={cn(
          "text-5xl font-bold mb-2 tracking-tight",
          isIncome ? "text-emerald-400" : "text-white"
        )}>
          {isIncome ? '+' : '-'}$ {movement.amount.toLocaleString('es-CO')}
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{movement.title}</p>
      </div>

      {/* Details Card */}
      <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
        <div className="flex items-center gap-5 group">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Fecha de Registro</p>
            <p className="text-slate-100 font-bold tracking-tight">{movement.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 group">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Categoría</p>
            <p className="text-slate-100 font-bold tracking-tight">{movement.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 group">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Tipo de Movimiento</p>
            <p className={cn("font-bold tracking-tight", isIncome ? "text-emerald-400" : "text-rose-400")}>
              {isIncome ? 'Ingreso Recibido' : 'Gasto Realizado'}
            </p>
          </div>
        </div>

        {(movement.paymentMethod || movement.observations || movement.description) && (
          <div className="flex items-start gap-5 group">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Más Información</p>
              <div className="space-y-2">
                {movement.paymentMethod && (
                  <p className="text-slate-100 text-sm font-medium">Método: <span className="text-indigo-400">{movement.paymentMethod}</span></p>
                )}
                {(movement.description || movement.observations) && (
                  <p className="text-slate-300 text-xs italic">"{movement.description || movement.observations}"</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button 
          onClick={onBack}
          className="col-span-2 flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 py-5 rounded-[1.5rem] text-indigo-400 font-bold uppercase tracking-widest text-xs transition-all backdrop-blur-xl shadow-lg active:scale-95 mb-2"
        >
          Volver al Historial
        </button>
        <button 
          onClick={onEdit}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-[1.5rem] text-slate-200 font-bold uppercase tracking-widest text-xs transition-all backdrop-blur-xl shadow-lg active:scale-95"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-[1.5rem] text-slate-200 font-bold uppercase tracking-widest text-xs transition-all backdrop-blur-xl shadow-lg active:scale-95">
          <Share2 className="w-4 h-4" />
          Compartir
        </button>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
