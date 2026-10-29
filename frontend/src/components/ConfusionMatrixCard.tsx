import React from 'react';

interface Props {
  matrix: number[][];
  labels: [string, string];
  title?: string;
}

export const ConfusionMatrixCard: React.FC<Props> = ({ matrix, labels, title = "Confusion Matrix (Held-Out Test Set)" }) => {
  if (!matrix || matrix.length < 2) return null;

  const tn = matrix[0][0];
  const fp = matrix[0][1];
  const fn = matrix[1][0];
  const tp = matrix[1][1];
  const total = tn + fp + fn + tp;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              <th colSpan={2} className="p-2 text-xs font-bold text-slate-600 bg-slate-50 border-b border-slate-200 uppercase">
                Predicted Class
              </th>
            </tr>
            <tr>
              <th className="p-2 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 uppercase text-left">
                Actual Class
              </th>
              <th className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                {labels[0]} (0)
              </th>
              <th className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                {labels[1]} (1)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 text-left">
                {labels[0]} (0)
              </td>
              <td className="p-3 bg-emerald-50 border border-slate-200">
                <span className="text-base font-bold text-emerald-800">{tn.toLocaleString()}</span>
                <span className="block text-[10px] text-emerald-600 uppercase font-medium">True Negative</span>
              </td>
              <td className="p-3 bg-rose-50 border border-slate-200">
                <span className="text-base font-bold text-rose-800">{fp.toLocaleString()}</span>
                <span className="block text-[10px] text-rose-600 uppercase font-medium">False Positive</span>
              </td>
            </tr>
            <tr>
              <td className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 text-left">
                {labels[1]} (1)
              </td>
              <td className="p-3 bg-rose-50 border border-slate-200">
                <span className="text-base font-bold text-rose-800">{fn.toLocaleString()}</span>
                <span className="block text-[10px] text-rose-600 uppercase font-medium">False Negative</span>
              </td>
              <td className="p-3 bg-emerald-50 border border-slate-200">
                <span className="text-base font-bold text-emerald-800">{tp.toLocaleString()}</span>
                <span className="block text-[10px] text-emerald-600 uppercase font-medium">True Positive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500 text-center">
        Total Evaluated Samples: <span className="font-semibold text-slate-700">{total.toLocaleString()}</span>
      </p>
    </div>
  );
};
