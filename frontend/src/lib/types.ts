export interface Employee {
  id: number;
  name: string;
  email: string;
  position_name: string;
  distance_level?: number;
  latest_evaluation_score?: string | number | null;
}

export interface EvaluationPayload {
  evaluated_id: number;
  [key: string]: string | number;
}