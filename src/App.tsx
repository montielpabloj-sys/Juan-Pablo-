import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChefHat, Timer, Users, ChevronRight, ChevronLeft, RotateCcw, Sparkles, Utensils } from 'lucide-react';
import { generateRecipes } from './services/gemini';
import { Recipe } from './types';

export default function App() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(-1); // -1 means viewing ingredients, 0+ means steps
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedRecipe(null);
    setCurrentStep(-1);

    try {
      const results = await generateRecipes(query);
      setRecipes(results);
    } catch (err) {
      setError('No se pudieron encontrar recetas. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCooking = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStep(-1); // Start with ingredients
  };

  const nextStep = () => {
    if (selectedRecipe && currentStep < selectedRecipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setRecipes([]);
    setQuery('');
    setSelectedRecipe(null);
    setCurrentStep(-1);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="bg-olive p-3 rounded-full text-white">
            <ChefHat size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-olive italic">ChefMente</h1>
        </motion.div>
        <p className="text-gray-600 font-serif text-lg italic">Tu asistente para recetas mejoradas y deliciosas</p>
      </header>

      {/* Search Bar */}
      {!selectedRecipe && (
        <motion.form
          layout
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mb-12"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué quieres cocinar hoy? (ej. Lasaña, Tacos, Paella...)"
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-olive/20 rounded-2xl focus:border-olive focus:outline-none transition-all shadow-sm text-lg font-serif italic"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-olive/50" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-olive text-white px-6 py-2 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 font-medium"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </motion.form>
      )}

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mb-4"></div>
            <p className="font-serif italic text-olive text-lg">Inspirándonos para crear algo delicioso...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center font-serif italic"
          >
            {error}
          </motion.div>
        ) : selectedRecipe ? (
          /* Assistant Mode */
          <motion.div
            key="assistant"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-olive/10"
          >
            <div className="bg-olive p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Cocinando</p>
                  <h2 className="text-2xl font-serif italic font-bold leading-tight">{selectedRecipe.name}</h2>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                <motion.div
                  className="bg-white h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / (selectedRecipe.steps.length)) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-8 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                {currentStep === -1 ? (
                  /* Ingredients View */
                  <motion.div
                    key="ingredients"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-6 text-olive">
                      <Utensils size={20} />
                      <h3 className="text-xl font-serif italic font-bold">Ingredientes Necesarios</h3>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-olive/5">
                          <span className="font-bold text-olive min-w-[60px]">{ing.amount}</span>
                          <span className="text-gray-700">{ing.item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  /* Steps View */
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-olive font-serif italic font-bold text-lg">Paso {currentStep + 1} de {selectedRecipe.steps.length}</span>
                      <Sparkles className="text-olive/30" size={24} />
                    </div>
                    <p className="text-2xl md:text-3xl font-serif leading-relaxed text-gray-800 italic">
                      {selectedRecipe.steps[currentStep]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="mt-12 flex justify-between items-center pt-8 border-t border-cream">
                <button
                  onClick={prevStep}
                  disabled={currentStep === -1}
                  className="flex items-center gap-2 text-olive font-medium disabled:opacity-30 hover:translate-x-[-4px] transition-all"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </button>

                {currentStep === selectedRecipe.steps.length - 1 ? (
                  <button
                    onClick={reset}
                    className="bg-olive text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                  >
                    <RotateCcw size={20} />
                    ¡Terminado! Nueva Receta
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="bg-olive text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                  >
                    {currentStep === -1 ? 'Comenzar a Cocinar' : 'Siguiente Paso'}
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : recipes.length > 0 ? (
          /* Recipe Selection List */
          <motion.div
            key="recipe-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl p-6 shadow-md border border-olive/5 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-cream text-olive text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {recipe.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Timer size={14} />
                    {recipe.cookTime}
                  </div>
                </div>
                <h3 className="text-xl font-serif italic font-bold text-olive mb-3 leading-tight">{recipe.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 italic font-serif">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-gray-500 text-xs mb-6">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {recipe.servings} porciones
                  </div>
                </div>

                <button
                  onClick={() => startCooking(recipe)}
                  className="w-full py-3 bg-olive text-white rounded-xl font-medium hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Ver Receta
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State / Welcome */
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="mb-8 opacity-20 flex justify-center">
                <Utensils size={80} className="text-olive" />
              </div>
              <h2 className="text-2xl font-serif italic text-olive mb-4">Descubre el sabor perfecto</h2>
              <p className="text-gray-500 font-serif italic">Escribe el nombre de cualquier plato y te daremos las mejores versiones para que cocines como un profesional.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-400 text-sm font-serif italic">
        <p>© 2026 ChefMente - Tu cocina, mejorada con IA</p>
      </footer>
    </div>
  );
}
