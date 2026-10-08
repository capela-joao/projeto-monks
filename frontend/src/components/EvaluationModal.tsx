import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/toast';
import { AxiosError } from 'axios';
import type { Employee, EvaluationPayload } from '@/lib/types';

interface EvaluationRecord {
  id: number;
  evaluator_name: string;
  created_at: string;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  q5_score: number;
  q6_score: number;
  total_score: number | string;
}

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  subordinate: Employee | null;
  loggedLeaderId: number | null;
}

const QUESTIONS = [
  { id: 'q1_score', label: 'Entrega de Resultados (Peso 25)' },
  { id: 'q2_score', label: 'Execução e Qualidade do Trabalho (Peso 20)' },
  { id: 'q3_score', label: 'Capacidade de Aprendizado e Desenvolvimento (Peso 20)' },
  { id: 'q4_score', label: 'Resolução de Problemas e Pensamento Crítico (Peso 15)' },
  { id: 'q5_score', label: 'Colaboração, Influência e Liderança (Peso 10)' },
  { id: 'q6_score', label: 'Visão Estratégica e Potencial de Crescimento (Peso 10)' },
];

export function EvaluationModal({ isOpen, setIsOpen, subordinate, loggedLeaderId }: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'avaliar' | 'historico'>('avaliar');
  const [formScores, setFormScores] = useState<Record<string, string>>({});

  const { data: evaluationHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['evaluationHistory', subordinate?.id],
    queryFn: async () => (await api.get(`/evaluations/${subordinate?.id}/history`)).data,
    enabled: !!subordinate?.id && activeTab === 'historico',
  });

  const submitEvaluation = useMutation({
    mutationFn: async (payload: EvaluationPayload) => api.post('/evaluations', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subordinates', loggedLeaderId] });
      setIsOpen(false);
      toast.add({ title: 'Sucesso!', description: 'Avaliação registrada com sucesso.' });
    },
    onError: (error: AxiosError<{error: string}>) => {
      toast.add({
        type: 'error',
        title: 'Erro ao avaliar',
        description: error.response?.data?.error || 'Erro desconhecido.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(formScores).length < 6) {
      return toast.add({ type: 'warning', title: 'Responda todas as perguntas!' });
    }
    if (subordinate) {
      submitEvaluation.mutate({
        evaluated_id: subordinate.id,
        ...formScores,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setActiveTab('avaliar');
        setFormScores({});
      }
      setIsOpen(open);
    }}>
      <DialogContent className="w-[90vw] sm:max-w-4xl !max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Avaliando: {subordinate?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 border-b pb-2 mt-2">
          <Button 
            variant={activeTab === 'avaliar' ? "default" : "outline"} 
            onClick={() => setActiveTab('avaliar')}
          >
            Nova Avaliação
          </Button>
          <Button 
            variant={activeTab === 'historico' ? "default" : "outline"} 
            onClick={() => setActiveTab('historico')}
          >
            Ver Histórico e Respostas Antigas
          </Button>
        </div>
        
        {activeTab === 'avaliar' ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border">
                  <Label className="text-sm font-semibold mb-4 block leading-tight">{q.label}</Label>
                  <RadioGroup 
                    className="flex flex-row justify-between items-center" 
                    onValueChange={(val: string) => setFormScores(prev => ({ ...prev, [q.id]: val }))}
                  >
                    {[1, 2, 3, 4].map((note) => (
                      <div key={note} className="flex items-center space-x-2">
                        <RadioGroupItem value={note.toString()} id={`${q.id}-${note}`} />
                        <Label htmlFor={`${q.id}-${note}`} className="text-xs cursor-pointer whitespace-nowrap">
                          Nota {note}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
            
            <Button type="submit" className="w-full h-12 text-md font-bold" disabled={submitEvaluation.isPending}>
              {submitEvaluation.isPending ? 'Salvando...' : 'Enviar Avaliação'}
            </Button>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            {isLoadingHistory ? (
              <p className="text-sm text-zinc-500 animate-pulse">Carregando histórico...</p>
            ) : evaluationHistory.length === 0 ? (
              <p className="text-sm text-zinc-500">Este funcionário ainda não possui avaliações anteriores.</p>
            ) : (
              (evaluationHistory as EvaluationRecord[]).map((evalRecord) => (
                <div key={evalRecord.id} className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <span className="font-semibold text-sm">Avaliador: {evalRecord.evaluator_name}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(evalRecord.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Entrega: <b>{evalRecord.q1_score}</b></p>
                    <p>Execução: <b>{evalRecord.q2_score}</b></p>
                    <p>Aprendizado: <b>{evalRecord.q3_score}</b></p>
                    <p>Resolução: <b>{evalRecord.q4_score}</b></p>
                    <p>Liderança: <b>{evalRecord.q5_score}</b></p>
                    <p>Visão Estratégica: <b>{evalRecord.q6_score}</b></p>
                  </div>
                  <div className="mt-3 pt-2 border-t text-right">
                    Nota Final: <span className="font-bold text-lg">{Number(evalRecord.total_score).toFixed(0)}/100</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}