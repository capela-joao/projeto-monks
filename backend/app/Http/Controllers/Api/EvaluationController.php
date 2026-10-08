<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EvaluationController extends Controller
{
    public function store(Request $request)
    {
        $evaluatorId = $request->header('X-User-Id');

        $validated = $request->validate([
            'evaluated_id' => 'required|integer',
            'q1_score' => 'required|integer|between:1,4',
            'q2_score' => 'required|integer|between:1,4',
            'q3_score' => 'required|integer|between:1,4',
            'q4_score' => 'required|integer|between:1,4',
            'q5_score' => 'required|integer|between:1,4',
            'q6_score' => 'required|integer|between:1,4',
        ]);

        if ($evaluatorId == $validated['evaluated_id']) {
            return response()->json(['error' => 'Você não pode avaliar a si mesmo.'], 403);
        }

        // Validação da regra: Máximo 1 avaliação por semana para o mesmo par
        $recentEval = DB::table('evaluations')
            ->where('evaluator_id', $evaluatorId)
            ->where('evaluated_id', $validated['evaluated_id'])
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->exists();

        if ($recentEval) {
            return response()->json(['error' => 'Você já avaliou este funcionário nos últimos 7 dias.'], 422);
        }

        $score = ($validated['q1_score'] * 0.25) + ($validated['q2_score'] * 0.20) +
                 ($validated['q3_score'] * 0.20) + ($validated['q4_score'] * 0.15) +
                 ($validated['q5_score'] * 0.10) + ($validated['q6_score'] * 0.10);

        $finalScore = $score * 25;

        DB::table('evaluations')->insert(array_merge($validated, [
            'evaluator_id' => $evaluatorId,
            'total_score'  => $finalScore,
            'created_at'   => Carbon::now(),
        ]));

        return response()->json(['message' => 'Avaliação salva com sucesso!', 'score' => $finalScore]);
    }

        public function history($evaluated_id)
    {
        $history = DB::table('evaluations')
            ->join('employee', 'evaluations.evaluator_id', '=', 'employee.id')
            ->select('evaluations.*', 'employee.name as evaluator_name')
            ->where('evaluated_id', $evaluated_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
