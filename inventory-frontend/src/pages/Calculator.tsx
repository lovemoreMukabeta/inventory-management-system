import React, { useState } from 'react';
import { 
  Calculator as CalcIcon, 
  History, 
  Delete, 
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => prev + ' ' + op + ' ');
  };

  const calculate = () => {
    try {
      // Basic eval for demo purposes - in production use a math library
      // eslint-disable-next-line no-eval
      const result = eval(display.replace('×', '*').replace('÷', '/'));
      const entry = `${display} = ${result}`;
      setHistory([entry, ...history].slice(0, 5));
      setDisplay(result.toString());
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Calculator */}
        <div className="lg:col-span-2 glass-card p-8 bg-white/90">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primary-600 text-white rounded-xl">
                <CalcIcon size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Advanced Calculator</h1>
            </div>
            <a href="/dashboard" className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 transition-all font-medium">
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </a>
          </header>

          <div className="space-y-6">
            {/* Display */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-inner text-right overflow-hidden">
              <p className="text-slate-500 text-sm font-medium mb-1 h-5 overflow-hidden whitespace-nowrap">
                {history[0]?.split('=')[0] || ''}
              </p>
              <p className="text-5xl font-black text-white tracking-tighter truncate">
                {display}
              </p>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-4">
              <button onClick={clear} className="h-16 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all text-xl">
                AC
              </button>
              <button onClick={() => handleOperator('÷')} className="h-16 flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600 font-bold hover:bg-primary-100 transition-all text-xl">
                ÷
              </button>
              <button onClick={() => handleOperator('×')} className="h-16 flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600 font-bold hover:bg-primary-100 transition-all text-xl">
                ×
              </button>
              <button onClick={() => setDisplay(prev => prev.slice(0, -1))} className="h-16 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-xl">
                <Delete size={24} />
              </button>

              {[7, 8, 9, '-', 4, 5, 6, '+', 1, 2, 3].map((val) => (
                <button 
                  key={val}
                  onClick={() => typeof val === 'number' ? handleNumber(val.toString()) : handleOperator(val)}
                  className={`h-16 flex items-center justify-center rounded-2xl font-bold transition-all text-2xl
                    ${typeof val === 'number' ? 'bg-white border border-slate-100 text-slate-700 shadow-sm hover:shadow-md' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                >
                  {val}
                </button>
              ))}
              
              <button onClick={calculate} className="h-16 flex items-center justify-center rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all text-2xl row-span-2">
                =
              </button>
              
              <button onClick={() => handleNumber('0')} className="h-16 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-700 shadow-sm hover:shadow-md font-bold text-2xl col-span-2">
                0
              </button>
              <button onClick={() => handleNumber('.')} className="h-16 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-700 shadow-sm hover:shadow-md font-bold text-2xl">
                .
              </button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="glass-card p-8 bg-white/80">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <History size={20} className="text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900">History</h2>
            </div>
            <button onClick={() => setHistory([])} className="p-2 text-slate-400 hover:text-rose-600 transition-all">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? history.map((entry, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-right duration-300">
                <p className="text-slate-500 text-xs font-medium mb-1">{entry.split('=')[0]}</p>
                <p className="text-slate-900 font-bold text-lg">= {entry.split('=')[1]}</p>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No recent calculations</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
