import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toast';
import type { Employee } from '@/lib/types';
import { Header } from '@/components/Header';
import { EvaluationModal } from '@/components/EvaluationModal';

export default function App() {
  const { loggedLeaderId } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] = useState<Employee | null>(null);

  const { data: subordinates = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['subordinates', loggedLeaderId],
    queryFn: async () => (await api.get('/subordinates')).data,
    enabled: !!loggedLeaderId,
  });

  const handleOpenModal = (subordinate: Employee) => {
    setSelectedSubordinate(subordinate);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <Toaster />
      <Header />

      <main className="max-w-4xl mx-auto">
        {!loggedLeaderId ? (
          <div className="text-center py-20 text-zinc-400">Selecione quem você é no menu acima.</div>
        ) : isLoading ? (
          <div className="text-center py-20 text-zinc-500 animate-pulse">Carregando...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subordinates.map((sub) => (
              <Card key={sub.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg">{sub.name}</CardTitle>
                  <p className="text-sm text-zinc-500">{sub.position_name}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase">Última Nota</p>
                    <p className="text-2xl font-bold">
                      {sub.latest_evaluation_score ? `${Number(sub.latest_evaluation_score).toFixed(0)}/100` : '—'}
                    </p>
                  </div>
                  <Button onClick={() => handleOpenModal(sub)}>Avaliar</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <EvaluationModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        subordinate={selectedSubordinate} 
        loggedLeaderId={loggedLeaderId} 
      />
    </div>
  );
}