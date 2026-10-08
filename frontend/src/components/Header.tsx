import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Employee } from '@/lib/types';

export function Header() {
  const { loggedLeaderId, setLoggedLeader } = useAuthStore();
  
  const { data: allEmployees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  });

  const selectedLeader = allEmployees.find((e) => e.id === loggedLeaderId);

  return (
    <header className="max-w-4xl mx-auto flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border mb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Plataforma 360</h1>
        <p className="text-sm text-zinc-500">Avaliação de Liderados</p>
      </div>
      <div className="w-72">
        <Label className="text-xs text-zinc-500 mb-2 block">Quem é você? (Login)</Label>
        <Select 
          value={loggedLeaderId?.toString() || ""} 
          onValueChange={(val: string | null) => { if (val) setLoggedLeader(Number(val)) }}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Selecione um líder...">
              {selectedLeader ? `${selectedLeader.name} (${selectedLeader.position_name})` : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id.toString()}>
                {emp.name} ({emp.position_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}