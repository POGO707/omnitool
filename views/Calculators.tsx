import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { Plus, Trash2, Download } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Calculators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('t') || 'expense';

  const setTab = (t: string) => {
    setSearchParams({ t });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex space-x-4 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['expense', 'gst', 'exam'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`px-4 py-2 font-medium capitalize rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab} Calculator
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        {activeTab === 'expense' && <ExpenseCalculator />}
        {activeTab === 'gst' && <GSTCalculator />}
        {activeTab === 'exam' && <ExamCalculator />}
      </div>
    </div>
  );
}

// --- Sub Components ---

function ExpenseCalculator() {
  const [items, setItems] = useState<{id: number, name: string, amount: number}[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const add = () => {
    if (!name || !amount) return;
    setItems([...items, { id: Date.now(), name, amount: parseFloat(amount) }]);
    setName('');
    setAmount('');
  };

  const downloadCsv = () => {
      const header = "Item Name,Amount\n";
      const rows = items.map(i => `${i.name},${i.amount}`).join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "expenses.csv";
      a.click();
  }

  const total = items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
        <div className="space-y-3">
          <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" />
          <button onClick={add} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
            <Plus size={18} /> Add
          </button>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
             <h4 className="font-medium text-slate-700">History</h4>
             {items.length > 0 && (
                 <button onClick={downloadCsv} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                     <Download size={14}/> CSV
                 </button>
             )}
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span>{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${item.amount.toFixed(2)}</span>
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-500"><Trash2 size={16}/></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold mb-4">Total: ${total.toFixed(2)}</h3>
        <div className="w-full h-64">
           {items.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={items} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                   {items.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <ReTooltip />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400">Add items to see chart</div>
           )}
        </div>
      </div>
    </div>
  );
}

function GSTCalculator() {
  const [amount, setAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(18);
  const [type, setType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const gstAmount = type === 'exclusive' 
    ? (amount * rate) / 100 
    : amount - (amount * (100 / (100 + rate)));
  
  const total = type === 'exclusive' ? amount + gstAmount : amount;
  const net = type === 'exclusive' ? amount : amount - gstAmount;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="text-xl font-bold text-center">GST Calculator</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
          <select value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full p-2 border rounded">
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>
        <div className="flex gap-4">
           <label className="flex items-center gap-2">
             <input type="radio" checked={type === 'exclusive'} onChange={() => setType('exclusive')} /> Exclusive
           </label>
           <label className="flex items-center gap-2">
             <input type="radio" checked={type === 'inclusive'} onChange={() => setType('inclusive')} /> Inclusive
           </label>
        </div>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
        <div className="flex justify-between"><span>Net Amount:</span> <span className="font-mono">{net.toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold text-blue-600"><span>GST Amount:</span> <span className="font-mono">{gstAmount.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 border-slate-300"><span>Total Amount:</span> <span className="font-mono">{total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

function ExamCalculator() {
  const [marks, setMarks] = useState<string>('');
  
  const calculate = () => {
    const arr = marks.split(',').map(m => parseFloat(m.trim())).filter(n => !isNaN(n));
    if (arr.length === 0) return { avg: 0, total: 0, count: 0 };
    const sum = arr.reduce((a, b) => a + b, 0);
    return { avg: sum / arr.length, total: sum, count: arr.length };
  };

  const result = calculate();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h3 className="text-xl font-bold text-center">Exam Marks Calculator</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Enter Marks (comma separated)</label>
        <textarea 
          value={marks} 
          onChange={e => setMarks(e.target.value)} 
          className="w-full p-2 border rounded h-32" 
          placeholder="e.g. 85, 92, 78, 88.5"
        />
      </div>
      
      {result.count > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded text-center">
            <div className="text-sm text-blue-600">Average</div>
            <div className="text-2xl font-bold text-blue-800">{result.avg.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded text-center">
            <div className="text-sm text-green-600">Total</div>
            <div className="text-2xl font-bold text-green-800">{result.total}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded text-center col-span-2">
            <div className="text-sm text-purple-600">Subjects Count</div>
            <div className="text-xl font-bold text-purple-800">{result.count}</div>
          </div>
        </div>
      )}
    </div>
  );
}