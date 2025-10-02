import React, { useState, useEffect } from 'react';
import { healthApi } from '../api/healthApi';
import Navbar from '../components/Navbar';
import { Calendar, TrendingUp, Award, AlertCircle, Heart, Activity, Brain } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyReport = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [year, month]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await healthApi.getMonthlyAnalysis(year, month);
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'No hay datos para este mes');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excelente':
        return 'from-green-400 to-emerald-600';
      case 'Bueno':
        return 'from-blue-400 to-cyan-600';
      case 'Regular':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-orange-400 to-red-600';
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Prepare chart data
  const chartData = analysis?.daily_logs.map(log => ({
    date: new Date(log.date + 'T00:00:00').getDate(),
    score: log.daily_score,
    alimentacion: ((log.meals_count / 4 * 20) + (log.fruits_servings / 3 * 10)).toFixed(1),
    deporte: ((log.exercise_minutes / 30 * 25) + 10).toFixed(1),
    mental: (log.daily_score * 0.35).toFixed(1)
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" data-testid="monthly-report">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Reporte Mensual
          </h1>
          <p className="text-gray-600">Análisis completo de tu salud mensual</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Calendar className="w-6 h-6 text-purple-600" />
            <div className="flex gap-4 flex-1">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                data-testid="month-select"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                data-testid="year-select"
              >
                {[...Array(3)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando análisis...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center" data-testid="no-data-message">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : analysis && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Puntuación Promedio</h3>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <div className={`text-5xl font-bold bg-gradient-to-r ${getStatusColor(analysis.health_status)} bg-clip-text text-transparent mb-2`}>
                  {analysis.average_score.toFixed(1)}
                </div>
                <p className="text-gray-600">{analysis.health_status}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Días Registrados</h3>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {analysis.total_days}
                </div>
                <p className="text-gray-600">días en {months[month - 1]}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Tendencia</h3>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {analysis.health_status}
                </div>
                <p className="text-gray-600">Estado general de salud</p>
              </div>
            </div>

            {/* Category Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Puntuación por Categoría</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <Heart className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Alimentación</h3>
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {analysis.category_scores.alimentacion.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">de 30 puntos</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <Activity className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ejercicio</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-1">
                    {analysis.category_scores.deporte.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">de 35 puntos</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <Brain className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Bienestar Mental</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {analysis.category_scores.mental.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">de 35 puntos</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Evolución Diaria</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    label={{ value: 'Día del mes', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Puntuación', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    name="Puntuación Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparación por Categorías</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="alimentacion" fill="#10b981" name="Alimentación" />
                  <Bar dataKey="deporte" fill="#f97316" name="Ejercicio" />
                  <Bar dataKey="mental" fill="#3b82f6" name="Mental" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3" />
                Recomendaciones
              </h2>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-2xl mr-3">{rec.split(' ')[0]}</span>
                    <span className="text-lg">{rec.substring(rec.indexOf(' ') + 1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
