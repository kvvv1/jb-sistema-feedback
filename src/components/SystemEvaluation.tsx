import React from "react";

interface SystemEvaluationData {
  frequency: string;
  performance: number;
  likes: string;
  improvements: string;
  problems: string;
}

interface SystemEvaluationProps {
  systemName: string;
  evaluation: SystemEvaluationData;
  onEvaluationChange: (field: keyof SystemEvaluationData, value: string | number) => void;
}

export function SystemEvaluation({ systemName, evaluation, onEvaluationChange }: SystemEvaluationProps) {
  const frequencies = [
    { value: 'todos-dias', label: 'Todos os dias' },
    { value: 'algumas-semanas', label: 'Algumas vezes por semana' },
    { value: 'raro', label: 'Raramente' },
    { value: 'nunca', label: 'Nunca' },
  ];

  // Função para lidar com clique nas estrelas
  function handleStarClick(star: number) {
    if (evaluation.performance === star) {
      onEvaluationChange('performance', 0); // Permite desselecionar
    } else {
      onEvaluationChange('performance', star);
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-blue-600 mb-4">{systemName}</h3>
      <div className="mb-4">
        <label className="block font-medium mb-2 text-gray-700">Com que frequência você utiliza o sistema?</label>
        <div className="flex flex-wrap gap-4">
          {frequencies.map((freq) => (
            <label key={freq.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`frequencia-${systemName}`}
                value={freq.value}
                checked={evaluation.frequency === freq.value}
                onChange={() => onEvaluationChange('frequency', freq.value)}
                className="accent-blue-600 w-5 h-5"
              />
              <span>{freq.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-2 text-gray-700">Como você avalia o desempenho geral do sistema?</label>
        <div className="flex items-center gap-2" role="radiogroup" aria-label={`Avaliação do sistema ${systemName}`}> 
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              className={`focus:outline-none text-3xl transition ${evaluation.performance >= star ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => handleStarClick(star)}
              aria-label={`Dar nota ${star} de 5 para o sistema`}
              tabIndex={0}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-gray-500 text-sm">{evaluation.performance || 0} / 5</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-2 text-gray-700">O que você mais gosta nesse sistema?</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={evaluation.likes}
          onChange={e => onEvaluationChange('likes', e.target.value)}
          title={`O que você mais gosta no sistema ${systemName}?`}
          placeholder="Descreva aqui"
          rows={2}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-2 text-gray-700">O que poderia ser melhorado?</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={evaluation.improvements}
          onChange={e => onEvaluationChange('improvements', e.target.value)}
          title={`O que poderia ser melhorado no sistema ${systemName}?`}
          placeholder="Descreva aqui"
          rows={2}
        />
      </div>
      <div className="mb-2">
        <label className="block font-medium mb-2 text-gray-700">Você já enfrentou erros ou problemas nesse sistema? Se sim, quais?</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={evaluation.problems}
          onChange={e => onEvaluationChange('problems', e.target.value)}
          title={`Problemas encontrados no sistema ${systemName}`}
          placeholder="Descreva aqui"
          rows={2}
        />
      </div>
    </div>
  );
} 