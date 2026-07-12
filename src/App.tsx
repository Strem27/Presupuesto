/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MovementsList from './components/MovementsList';
import ExpenseDetail from './components/ExpenseDetail';
import AddExpense from './components/AddExpense';
import AddIncome from './components/AddIncome';
import Modal from './components/Modal';
import { Movement, View } from './types';
import AssistantDrawer from './components/AssistantDrawer';
import { Bot } from 'lucide-react';

const INITIAL_MOVEMENTS: Movement[] = [];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [budget, setBudget] = useState(3500000);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleAddExpenseClick = () => {
    setView('add');
    setSelectedMovement(null);
  };

  const handleAddIncomeClick = () => {
    setView('add-income');
    setSelectedMovement(null);
  };

  const handleSelectMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setView('detail');
  };

  const handleSaveMovement = (newMovement: Omit<Movement, 'id'>) => {
    const movement: Movement = {
      ...newMovement,
      id: Math.random().toString(36).substring(2, 9)
    };
    setMovements([movement, ...movements]);
    
    // Simulate delay for the success message to be seen
    setTimeout(() => {
      setView('dashboard');
    }, 1500);
  };

  const getModalTitle = () => {
    switch (view) {
      case 'movements': return 'Historial de Movimientos';
      case 'detail': return selectedMovement ? 'Detalle del Movimiento' : 'Detalle';
      case 'add': return 'Registrar Nuevo Gasto';
      case 'add-income': return 'Registrar Nuevo Ingreso';
      default: return '';
    }
  };

  const closeModal = () => {
    if (view === 'detail' && selectedMovement) {
      setView('movements');
    } else {
      setView('dashboard');
    }
  };

  return (
    <>
      <Layout
        title="Mi Presupuesto"
        activeView="dashboard"
        onNavigate={() => setView('dashboard')}
        onAddClick={handleAddExpenseClick}
      >
        <Dashboard 
          movements={movements} 
          budget={budget}
          onUpdateBudget={setBudget}
          onViewAll={() => setView('movements')}
          onSelectMovement={handleSelectMovement}
          onAddExpense={handleAddExpenseClick}
          onAddIncome={handleAddIncomeClick}
        />
      </Layout>

      <Modal 
        isOpen={view !== 'dashboard'} 
        onClose={closeModal} 
        title={getModalTitle()}
      >
        {view === 'movements' && (
          <MovementsList 
            movements={movements} 
            onSelectMovement={handleSelectMovement}
            onAddExpense={handleAddExpenseClick}
          />
        )}
        {view === 'detail' && (
          selectedMovement ? (
            <ExpenseDetail 
              movement={selectedMovement} 
              onEdit={() => {}} 
              onBack={() => setView('movements')}
            />
          ) : (
            <div className="flex items-center justify-center py-20 px-6">
              <p className="text-slate-500 font-bold text-center text-sm">
                Selecciona un gasto en Movimientos para ver el detalle
              </p>
            </div>
          )
        )}
        {view === 'add' && (
          <AddExpense 
            onSave={handleSaveMovement} 
          />
        )}
        {view === 'add-income' && (
          <AddIncome 
            onSave={handleSaveMovement} 
            onCancel={() => setView('dashboard')}
          />
        )}
      </Modal>

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 active:scale-95 transition-all z-[90] ring-4 ring-indigo-600/20 group"
      >
        <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0F172A] animate-pulse" />
      </button>

      <AssistantDrawer 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)}
        onRegisterExpense={handleSaveMovement}
        movements={movements}
        budget={budget}
      />
    </>
  );
}

