import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, TrendingUp, Calendar, Award, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-lg animate-bounce">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Tu Salud, Tu Progreso
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Registra tus hábitos diarios de alimentación, ejercicio y bienestar mental.
            <br />
            <span className="font-semibold text-purple-600">Obtén análisis mensuales y mejora tu calidad de vida.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              data-testid="get-started-btn"
            >
              Comenzar Gratis
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-purple-600"
              data-testid="login-btn"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-xl w-fit mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Alimentación</h3>
            <p className="text-gray-600">Registra tus comidas saludables y consumo de frutas diariamente.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-orange-400 to-red-600 p-4 rounded-xl w-fit mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Ejercicio</h3>
            <p className="text-gray-600">Lleva el control de tus actividades físicas y minutos de ejercicio.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-blue-400 to-purple-600 p-4 rounded-xl w-fit mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Bienestar Mental</h3>
            <p className="text-gray-600">Monitorea tu estado de ánimo y calidad del sueño.</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-20 bg-white rounded-3xl p-12 shadow-xl max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Calendar className="w-12 h-12 text-purple-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Análisis Mensual</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-4">
              <Award className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Puntuación de Salud</h4>
                <p className="text-gray-600">Recibe una evaluación completa de tus hábitos mensuales.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <TrendingUp className="w-8 h-8 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Recomendaciones</h4>
                <p className="text-gray-600">Obtén consejos personalizados para mejorar tu bienestar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
