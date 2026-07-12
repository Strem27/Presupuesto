import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell,
  Tooltip
} from 'recharts';
import { Movement } from '../types';
import { CategoryColor, CategoryIcon } from './Layout';
import { ChevronRight, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardProps {
  movements: Movement[];
  budget: number;
  onUpdateBudget: (budget: number) => void;
  onViewAll: () => void;
  onSelectMovement: (movement: Movement) => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export default function Dashboard({ 
  movements, 
  budget, 
  onUpdateBudget, 
  onViewAll, 
  onSelectMovement, 
  onAddExpense,
  onAddIncome
}: DashboardProps) {
  const totalSpent = movements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);
  
  const totalIncomes = movements
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  // The "Available" logic: Budget + Incomes - Spent
  const available = budget + totalIncomes - totalSpent;
  const spentPercentage = budget > 0 ? (totalSpent / (budget + totalIncomes)) * 100 : 0;
  const isPositive = available >= 0;

  const expenses = movements.filter(m => m.type === 'expense');
  const hasExpenses = expenses.length > 0;

  // Group by day for the chart
  const chartData = [
    { day: '1', amount: 50000 },
    { day: '2', amount: 120000 },
    { day: '3', amount: 30000 },
    { day: '4', amount: 5000 },
    { day: '5', amount: 60000 },
    { day: '6', amount: 40000 },
    { day: '7', amount: 55000 },
    { day: '8', amount: 120000 },
    { day: '9', amount: 230000 },
    { day: '10', amount: 100000 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Día {label}</p>
          <p className="text-sm font-bold text-white">$ {payload[0].value.toLocaleString('es-CO')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1.5">Presupuesto Inicial</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white tracking-tight">$</span>
                <input 
                  type="number"
                  value={budget || ''}
                  onChange={(e) => onUpdateBudget(Number(e.target.value))}
                  className="bg-transparent text-3xl font-bold text-white tracking-tight focus:outline-none w-full border-b border-white/10 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 ml-4">
              <CategoryIcon category="Otros" className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Gastado</p>
                <p className="text-xl font-bold text-rose-400 tracking-tight">$ {totalSpent.toLocaleString('es-CO')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Disponible</p>
                <p className={cn("text-xl font-bold tracking-tight", isPositive ? "text-emerald-400" : "text-rose-500")}>
                  $ {available.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="h-2.5 flex-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]",
                    isPositive ? "bg-indigo-500" : "bg-rose-500 shadow-rose-500/50"
                  )}
                  style={{ width: `${Math.min(Math.max(spentPercentage, 0), 100)}%` }}
                />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                isPositive 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
              )}>
                {isPositive ? "Balance positivo" : "Balance negativo"}
              </span>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>{spentPercentage.toFixed(1)}% utilizado</span>
              <span className={isPositive ? "text-emerald-500/80" : "text-rose-500/80"}>
                {(100 - spentPercentage).toFixed(1)}% disponible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Container */}
      <div className="space-y-4">
        <p className="text-[10px] text-center text-slate-500 font-black uppercase tracking-[0.3em]">Acciones Rápidas</p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-md mx-auto">
          <button 
            onClick={onAddIncome}
            className="flex-1 w-full sm:w-auto py-5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] rounded-[2rem] text-[#0F172A] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 ring-1 ring-white/10"
          >
            <ArrowUpRight className="w-5 h-5 stroke-[3px]" />
            Registrar Ingreso
          </button>
          <button 
            onClick={onAddExpense}
            className="flex-1 w-full sm:w-auto py-5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 ring-1 ring-white/10"
          >
            <ArrowDownLeft className="w-5 h-5 stroke-[3px]" />
            Registrar Gasto
          </button>
        </div>
      </div>

      {!hasExpenses ? (
        <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
            <ArrowDownLeft className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white tracking-tight">Aún no hay gastos este mes</h4>
            <p className="text-slate-400 text-sm max-w-[240px]">Registra el primero y empieza a ver en qué se va la plata</p>
          </div>
          <button 
            onClick={onAddExpense}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 ring-1 ring-white/10"
          >
            Registrar tu primer gasto
          </button>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Actividad Diaria</h4>
              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg text-slate-400 font-bold uppercase tracking-widest border border-white/5">Julio 2026</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                    label={{ value: 'Días del Mes', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 9, fontWeight: 'bold', textAnchor: 'middle' }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 6 }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={16}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 8 ? '#f43f5e' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Movimientos</h4>
              <button 
                onClick={onViewAll}
                className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Ver todos <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {movements.slice(0, 4).map((m) => (
                <button 
                  key={m.id}
                  onClick={() => onSelectMovement(m)}
                  className="w-full flex items-center justify-between p-3 -mx-3 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3.5 rounded-2xl border border-white/5", CategoryColor(m.category))}>
                      <CategoryIcon category={m.category} className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{m.title}</h5>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.category} • {m.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold tracking-tight group-hover:text-indigo-400 transition-colors",
                      m.type === 'income' ? 'text-emerald-400' : 'text-white'
                    )}>
                      {m.type === 'income' ? '+' : '-'}$ {m.amount.toLocaleString('es-CO')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">COP</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
