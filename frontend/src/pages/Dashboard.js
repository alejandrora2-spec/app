import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthApi } from '../api/healthApi';
import Navbar from '../components/Navbar';
import { Calendar, Plus, TrendingUp, Heart, Activity, Brain } from 'lucide-react';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await healthApi.getLogs(7);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-blue-400 to-cyan-600';
    if (score >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-600';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita Mejorar';
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(log => log.date === today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" data-testid="dashboard">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">Bienvenido a tu panel de salud diaria</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/daily-log')}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
            data-testid="add-log-btn"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl w-fit mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {todayLog ? 'Editar Registro de Hoy' : 'Nuevo Registro Diario'}
                </h3>
                <p className="text-gray-600">
                  {todayLog 
                    ? `Puntuación actual: ${todayLog.daily_score.toFixed(1)}/100`
                    : 'Registra tu día para seguir tu progreso'
                  }
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-600" />
            </div>
          </button>

          <button
            onClick={() => navigate('/monthly-report')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left text-white"
            data-testid="view-reports-btn"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-white/20 p-3 rounded-xl w-fit mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ver Reportes Mensuales</h3>
                <p className="text-white/90">Análisis completo de tu progreso</p>
              </div>
              <Activity className="w-12 h-12" />
            </div>
          </button>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Últimos 7 Días</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay registros todavía</p>
              <p className="text-gray-400">Comienza registrando tu primer día</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border-2 border-gray-100 rounded-xl p-5 hover:border-purple-300 transition-all cursor-pointer"
                  onClick={() => navigate('/daily-log', { state: { date: log.date } })}
                  data-testid={`log-card-${log.date}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {new Date(log.date + 'T00:00:00').toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(log.daily_score)} bg-clip-text text-transparent`}>
                        {log.daily_score.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{getScoreStatus(log.daily_score)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Heart className="w-4 h-4 mr-2 text-green-500" />
                      <span>{log.meals_count} comidas, {log.fruits_servings} frutas</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Activity className="w-4 h-4 mr-2 text-orange-500" />
                      <span>{log.exercise_minutes} min - {log.activity_type}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Brain className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{log.sleep_hours}h sueño, ánimo {log.mood_score}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
