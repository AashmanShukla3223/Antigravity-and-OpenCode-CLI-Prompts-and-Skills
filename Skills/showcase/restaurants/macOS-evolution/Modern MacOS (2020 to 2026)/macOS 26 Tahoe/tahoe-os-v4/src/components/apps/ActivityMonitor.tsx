import React, { useState, useEffect } from 'react';
import { Activity01Icon } from 'hugeicons-react';
import { EKGCanvas } from './EKGCanvas';
import { useTelemetry } from '../../hooks/useTelemetry';

export const ActivityMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CPU' | 'Memory' | 'Network'>('CPU');
  const telemetry = useTelemetry();
  
  const [processes, setProcesses] = useState(
    Array.from({ length: 15 }).map((_, i) => ({
      id: 1000 + i,
      name: ['WindowServer', 'kernel_task', 'Google Chrome', 'React', 'Framer Motion', 'Terminal'][i % 6] + (i > 5 ? ` Helper ${i}` : ''),
      cpu: (Math.random() * 15).toFixed(1),
      memory: (Math.random() * 500 + 10).toFixed(0),
      threads: Math.floor(Math.random() * 50 + 5),
    }))
  );

  // Simulate updating stats, but scale cpu load with our telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: (Math.random() * 15 + telemetry.cpuPressure * 20).toFixed(1),
        }))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, [telemetry.cpuPressure]);

  return (
    <div className="flex flex-col h-full w-full bg-white text-black font-sans">
      {/* Toolbar */}
      <div className="h-14 bg-[#f6f6f6] border-b border-gray-300 flex items-center px-4 gap-6">
        <div className="flex bg-gray-200 rounded-md p-1">
          {(['CPU', 'Memory', 'Network'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1 text-sm">
          <input type="text" placeholder="Search" className="border-none focus:outline-none w-32" />
        </div>
      </div>
      
      {/* Process Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-white border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="font-medium px-4 py-2 border-r border-gray-200">Process Name</th>
              <th className="font-medium px-4 py-2 border-r border-gray-200 text-right">% CPU</th>
              <th className="font-medium px-4 py-2 border-r border-gray-200 text-right">Threads</th>
              <th className="font-medium px-4 py-2 text-right">Memory</th>
            </tr>
          </thead>
          <tbody>
            {processes.sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu)).map((p, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-blue-50">
                <td className="px-4 py-1 flex items-center gap-2">
                  <Activity01Icon size={14} className="text-gray-500 hugeicon-tahoe" />
                  {p.name}
                </td>
                <td className="px-4 py-1 text-right">{p.cpu}</td>
                <td className="px-4 py-1 text-right text-gray-500">{p.threads}</td>
                <td className="px-4 py-1 text-right text-gray-500">{p.memory} MB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Bottom Graph Area */}
      <div className="h-32 bg-[#f6f6f6] border-t border-gray-300 flex p-4 gap-8">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between text-xs mb-1">
            <span>System:</span>
            <span className="text-red-500 font-medium">{(12.4 + telemetry.cpuPressure * 10).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>User:</span>
            <span className="text-blue-500 font-medium">{(8.2 + telemetry.cpuPressure * 20).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>Idle:</span>
            <span className="text-gray-500 font-medium">{(79.4 - telemetry.cpuPressure * 30).toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex-[2] rounded-md overflow-hidden relative flex items-end">
          {/* EKG Canvas Graph */}
          <EKGCanvas />
        </div>
      </div>
    </div>
  );
};
