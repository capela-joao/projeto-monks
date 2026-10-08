<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function getSubordinates(Request $request)
    {
        $leaderId = $request->header('X-User-Id');
        if (!$leaderId) return response()->json(['error' => 'Leader ID missing'], 401);

        $query = "
            WITH RECURSIVE subordinates AS (
                SELECT lead_id, leader_id, 1 as level
                FROM leader_lead
                WHERE leader_id = ?

                UNION ALL

                SELECT ll.lead_id, ll.leader_id, s.level + 1
                FROM leader_lead ll
                INNER JOIN subordinates s ON ll.leader_id = s.lead_id
            )
            SELECT
                e.id,
                e.name,
                e.email,
                e.position_name,
                s.level as distance_level,
                (
                    SELECT total_score
                    FROM evaluations ev
                    WHERE ev.evaluated_id = e.id
                    ORDER BY ev.created_at DESC LIMIT 1
                ) as latest_evaluation_score
            FROM subordinates s
            JOIN employee e ON s.lead_id = e.id
            ORDER BY s.level, e.name;
        ";

        return response()->json(DB::select($query, [$leaderId]));
    }

    public function index()
    {
        return response()->json(DB::table('employee')->orderBy('name')->get());
    }
}
