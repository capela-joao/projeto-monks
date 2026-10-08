<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EvaluationController;

Route::get('/employees', [EmployeeController::class, 'index']);
Route::get('/subordinates', [EmployeeController::class, 'getSubordinates']);
Route::post('/evaluations', [EvaluationController::class, 'store']);
Route::get('/evaluations/{evaluated_id}/history', [EvaluationController::class, 'history']);
