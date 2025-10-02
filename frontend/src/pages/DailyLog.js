import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { healthApi } from '../api/healthApi';
import Navbar from '../components/Navbar';
import { Save, Calendar, Heart, Activity, Brain, AlertCircle, CheckCircle } from 'lucide-react';

const DailyLog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dateFromState = location.state?.date;

  const [date, setDate] = useState(dateFromState || new Date().toISOString().split('T')[0]);
  const [mealsCount, setMealsCount] = useState(0);
  const [fruitsServings, setFruitsServings] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [activityType, setActivityType] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (date) {
      fetchLogForDate();
    }
  }, [date]);

  const fetchLogForDate = async () => {
    try {
      const log = await healthApi.getLogByDate(date);
      if (log) {
        setMealsCount(log.meals_count);
        setFruitsServings(log.fruits_servings);
        setExerciseMinutes(log.exercise_minutes);
        setActivityType(log.activity_type);
        setMoodScore(log.mood_score);
        setSleepHours(log.sleep_hours);
        setIsEditing(true);
      } else {
        resetForm();
        setIsEditing(false);
      }
    } catch (error) {
      resetForm();
      setIsEditing(false);
    }
  };

  const resetForm = () => {
    setMealsCount(0);
    setFruitsServings(0);
    setExerciseMinutes(0);
    setActivityType('');
    setMoodScore(5);
    setSleepHours(7);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const logData = {
      date,
      meals_count: mealsCount,
      fruits_servings: fruitsServings,
      exercise_minutes: exerciseMinutes,
      activity_type: activityType,
      mood_score: moodScore,
      sleep_hours: parseFloat(sleepHours)
    };

    try {
      if (isEditing) {
        await healthApi.updateLog(date, logData);
      } else {
        await healthApi.createLog(logData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  const activityTypes = [
    'Correr',
    'Caminar',
    'Ciclismo',
    'Natación',
    'Gimnasio',
    'Yoga',
    'Fútbol',
    'Baile',
    'Otro'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {isEditing ? 'Editar Registro' : 'Nuevo Registro Diario'}
            </h1>
            <p className="text-gray-600">Registra tus hábitos de salud del día</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center" data-testid="success-message">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>¡Registro guardado exitosamente!</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" data-testid="error-message">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Date */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                required
                data-testid="date-input"
              />
            </div>

            {/* Alimentación */}
            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Heart className="w-6 h-6 mr-2 text-green-500" />
                Alimentación
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Comidas Saludables
                  </label>
                  <input
                    type="number"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(parseInt(e.target.value) || 0)}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                    data-testid="meals-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">0-10 comidas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Porciones de Frutas
                  </label>
                  <input
                    type="number"
                    value={fruitsServings}
                    onChange={(e) => setFruitsServings(parseInt(e.target.value) || 0)}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                    data-testid="fruits-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">0-10 porciones</p>
                </div>
              </div>
            </div>

            {/* Ejercicio */}
            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Activity className="w-6 h-6 mr-2 text-orange-500" />
                Ejercicio
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minutos de Ejercicio
                  </label>
                  <input
                    type="number"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(parseInt(e.target.value) || 0)}
                    min="0"
                    max="300"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    required
                    data-testid="exercise-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">0-300 minutos</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Actividad
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    required
                    data-testid="activity-type-input"
                  >
                    <option value="">Selecciona actividad</option>
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bienestar Mental */}
            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Brain className="w-6 h-6 mr-2 text-blue-500" />
                Bienestar Mental
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado de Ánimo (1-10)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      value={moodScore}
                      onChange={(e) => setMoodScore(parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      data-testid="mood-input"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Mal (1)</span>
                      <span className="text-2xl font-bold text-blue-600">{moodScore}</span>
                      <span>Excelente (10)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horas de Sueño
                  </label>
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    required
                    data-testid="sleep-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">0-24 horas</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                data-testid="save-log-btn"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Registro' : 'Guardar Registro')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                data-testid="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
