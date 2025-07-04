import React, { useState } from 'react';
import { FormSection } from './components/FormSection';
import { SystemEvaluation } from './components/SystemEvaluation';
import { StarRating } from './components/StarRating';
import { CheckCircle, Send } from 'lucide-react';

interface SystemEvaluationData {
  frequency: string;
  performance: number;
  likes: string;
  improvements: string;
  problems: string;
}

interface FormData {
  selectedSystems: string[];
  otherSystems: string;
  systemEvaluations: Record<string, SystemEvaluationData>;
  systemsHelpWork: string;
  systemsEasyToUse: string;
  generalImprovements: string;
  attentionToNeeds: string;
  supportEfficiency: string;
  developmentRating: number;
  technicalFeedback: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    selectedSystems: [],
    otherSystems: '',
    systemEvaluations: {},
    systemsHelpWork: '',
    systemsEasyToUse: '',
    generalImprovements: '',
    attentionToNeeds: '',
    supportEfficiency: '',
    developmentRating: 0,
    technicalFeedback: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const systems = [
    'Sistema RS',
    'Sistema OS',
    'Sistema de Senha',
    'Sistema de Roteirização',
  ];

  const handleSystemSelection = (systemName: string, checked: boolean) => {
    const newSelectedSystems = checked
      ? [...formData.selectedSystems, systemName]
      : formData.selectedSystems.filter((s) => s !== systemName);

    setFormData((prev) => ({
      ...prev,
      selectedSystems: newSelectedSystems,
    }));

    // Initialize evaluation data for new systems
    if (checked && !formData.systemEvaluations[systemName]) {
      setFormData((prev) => ({
        ...prev,
        systemEvaluations: {
          ...prev.systemEvaluations,
          [systemName]: {
            frequency: '',
            performance: 0,
            likes: '',
            improvements: '',
            problems: '',
          },
        },
      }));
    }
  };

  const handleEvaluationChange = (
    systemName: string,
    field: keyof SystemEvaluationData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      systemEvaluations: {
        ...prev.systemEvaluations,
        [systemName]: {
          ...prev.systemEvaluations[systemName],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Montar o payload conforme esperado pelo backend
    const payload = {
      selectedSystems: formData.selectedSystems,
      otherSystems: formData.otherSystems,
      systemsHelpWork: formData.systemsHelpWork,
      systemsEasyToUse: formData.systemsEasyToUse,
      generalImprovements: formData.generalImprovements,
      attentionToNeeds: formData.attentionToNeeds,
      supportEfficiency: formData.supportEfficiency,
      developmentRating: formData.developmentRating,
      technicalFeedback: formData.technicalFeedback,
      systemsEvaluations: formData.selectedSystems.map((system) => ({
        systemName: system,
        frequency: formData.systemEvaluations[system]?.frequency || '',
        performance: formData.systemEvaluations[system]?.performance || 0,
        likes: formData.systemEvaluations[system]?.likes || '',
        improvements: formData.systemEvaluations[system]?.improvements || '',
        problems: formData.systemEvaluations[system]?.problems || '',
      })),
    };

    // Defina a URL da API de forma flexível
    const API_URL = import.meta.env.VITE_API_URL || 'https://jb-sistema-feedback.onrender.com';

    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('Erro ao enviar feedback. Tente novamente.');
      console.error(error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Feedback Enviado!
          </h2>
          <p className="text-gray-600 mb-4">
            Obrigado por contribuir para a melhoria dos sistemas JB CONSERVADORA.
          </p>
          <p className="text-sm text-gray-500">
            Sua resposta foi registrada de forma anônima e será analisada pela equipe técnica.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Feedback — Sistemas JB CONSERVADORA
          </h1>
          <p className="text-blue-100 leading-relaxed">
            Este formulário tem como objetivo ouvir sua opinião sobre os sistemas utilizados no dia a dia
            (Sistema RS, Sistema OS, Sistema de Senha, Sistema de Roteirização), bem como sobre o trabalho
            de desenvolvimento e suporte técnico.
          </p>
          <div className="mt-4 p-3 bg-blue-800 rounded-md">
            <p className="text-sm text-blue-100">
              <strong>Sua resposta será completamente anônima</strong> — nenhum dado de identificação será
              solicitado. Obrigado por contribuir para a melhoria dos sistemas!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: System Selection */}
          <FormSection title="Quais sistemas você utiliza?" icon="🎯">
            <div className="space-y-3">
              {systems.map((system) => (
                <label key={system} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.selectedSystems.includes(system)}
                    onChange={(e) => handleSystemSelection(system, e.target.checked)}
                    className="mr-3 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="text-gray-700">{system}</span>
                </label>
              ))}
              <div className="mt-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.selectedSystems.includes('outros')}
                    onChange={(e) => handleSystemSelection('outros', e.target.checked)}
                    className="mr-3 text-red-600 focus:ring-red-500 w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700">Outros</span>
                    <input
                      type="text"
                      value={formData.otherSystems}
                      onChange={(e) => setFormData({ ...formData, otherSystems: e.target.value })}
                      placeholder="Especifique outros sistemas..."
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </label>
              </div>
            </div>
          </FormSection>

          {/* Section 2: System Evaluations */}
          {formData.selectedSystems.length > 0 && (
            <FormSection title="Avaliação por sistema utilizado" icon="⚙️">
              <div className="space-y-6">
                {formData.selectedSystems.map((system) => (
                  <SystemEvaluation
                    key={system}
                    systemName={system}
                    evaluation={formData.systemEvaluations[system] || {
                      frequency: '',
                      performance: 0,
                      likes: '',
                      improvements: '',
                      problems: '',
                    }}
                    onEvaluationChange={(field, value) => handleEvaluationChange(system, field, value)}
                  />
                ))}
              </div>
            </FormSection>
          )}

          {/* Section 3: General Evaluation */}
          <FormSection title="Avaliação geral dos sistemas" icon="📊">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Os sistemas ajudam no seu trabalho diário?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sim', label: 'Sim' },
                    { value: 'em-parte', label: 'Em parte' },
                    { value: 'nao', label: 'Não' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="systemsHelpWork"
                        value={option.value}
                        checked={formData.systemsHelpWork === option.value}
                        onChange={(e) => setFormData({ ...formData, systemsHelpWork: e.target.value })}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Você considera os sistemas fáceis de usar?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sim', label: 'Sim' },
                    { value: 'em-parte', label: 'Em parte' },
                    { value: 'nao', label: 'Não' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="systemsEasyToUse"
                        value={option.value}
                        checked={formData.systemsEasyToUse === option.value}
                        onChange={(e) => setFormData({ ...formData, systemsEasyToUse: e.target.value })}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que você gostaria que fosse criado ou melhorado nos sistemas em geral?
                </label>
                <textarea
                  value={formData.generalImprovements}
                  onChange={(e) => setFormData({ ...formData, generalImprovements: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Suas sugestões gerais para melhorias..."
                />
              </div>
            </div>
          </FormSection>

          {/* Section 4: Technical Support */}
          <FormSection title="Sobre o suporte e desenvolvimento técnico" icon="🛠️">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Você sente que há atenção às necessidades reais dos usuários ao desenvolver ou melhorar os sistemas?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sim', label: 'Sim' },
                    { value: 'em-parte', label: 'Em parte' },
                    { value: 'nao-tenho-certeza', label: 'Não tenho certeza' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="attentionToNeeds"
                        value={option.value}
                        checked={formData.attentionToNeeds === option.value}
                        onChange={(e) => setFormData({ ...formData, attentionToNeeds: e.target.value })}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quando você teve problemas ou dúvidas, sentiu que o suporte foi eficiente?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sempre', label: 'Sempre fui atendido com clareza e agilidade' },
                    { value: 'as-vezes', label: 'Às vezes tive dificuldade para resolver' },
                    { value: 'raramente', label: 'Raramente fui atendido de forma satisfatória' },
                    { value: 'nunca-precisei', label: 'Nunca precisei de suporte' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="supportEfficiency"
                        value={option.value}
                        checked={formData.supportEfficiency === option.value}
                        onChange={(e) => setFormData({ ...formData, supportEfficiency: e.target.value })}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <StarRating
                rating={formData.developmentRating}
                onRatingChange={(rating: number) => setFormData({ ...formData, developmentRating: rating })}
                label="Como você avalia o trabalho de desenvolvimento e manutenção dos sistemas?"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gostaria de deixar alguma sugestão, crítica ou elogio ao responsável técnico pelos sistemas?
                </label>
                <textarea
                  value={formData.technicalFeedback}
                  onChange={(e) => setFormData({ ...formData, technicalFeedback: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Seu feedback para a equipe técnica..."
                />
              </div>
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center mx-auto space-x-2 shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Enviar Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;