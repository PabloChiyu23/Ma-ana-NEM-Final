
import React, { useState, useEffect, useCallback } from 'react';
import { LessonParams, SavedLesson } from './types';
import Header from './components/Header';
import LessonForm from './components/LessonForm';
import LessonResult from './components/LessonResult';
import FavoriteLessons from './components/FavoriteLessons';
import LandingPage from './components/LandingPage';
import ProPanel from './components/ProPanel';
import PaymentModal from './components/PaymentModal';
import CancellationModal from './components/CancellationModal';
import EmailModal from './components/EmailModal';
import { generateLessonContent, generatePlanBContent } from './services/ai';

const FREE_WITHOUT_EMAIL_LIMIT = 1;
const FREE_WITH_EMAIL_LIMIT = 10;
const MAX_FREE_FAVORITES = 3;

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'generator' | 'pro'>('landing');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isPendingGeneration, setIsPendingGeneration] = useState<boolean>(false);
  const [totalGenerations, setTotalGenerations] = useState<number>(0);
  
  const [params, setParams] = useState<LessonParams>({
    grade: '1° Primaria',
    topic: '',
    duration: '60',
    status: 'Mixto',
    tone: 'Divertido',
    groupSize: '16-30'
  });

  const [result, setResult] = useState<string | null>(null);
  const [planBResult, setPlanBResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanBLoading, setIsPlanBLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedLesson[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('manana_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    const savedEmail = localStorage.getItem('manana_user_email');
    if (savedEmail) setUserEmail(savedEmail);
    const savedPro = localStorage.getItem('manana_pro_status');
    if (savedPro === 'true') setIsPro(true);
    const savedGens = localStorage.getItem('manana_total_generations');
    if (savedGens) setTotalGenerations(parseInt(savedGens, 10));
  }, []);

  const handleUpgradeClick = () => setIsPaymentModalOpen(true);

  const executeGeneration = useCallback(async (currentParams: LessonParams) => {
    if (!currentParams.topic.trim()) {
      setError("Por favor ingresa un tema.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPlanBResult(null);

    try {
      const content = await generateLessonContent(currentParams);
      setResult(content);
      
      const newTotal = totalGenerations + 1;
      setTotalGenerations(newTotal);
      localStorage.setItem('manana_total_generations', newTotal.toString());

      setTimeout(() => {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [totalGenerations]);

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('manana_user_email', email);
    setIsEmailModalOpen(false);
    
    if (isPendingGeneration) {
      executeGeneration(params);
      setIsPendingGeneration(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!isPro && totalGenerations >= FREE_WITHOUT_EMAIL_LIMIT && !userEmail) {
      setIsPendingGeneration(true);
      setIsEmailModalOpen(true);
      return;
    }

    if (!isPro && totalGenerations >= FREE_WITH_EMAIL_LIMIT) {
      setError("Has llegado al límite de 10 planeaciones gratuitas.");
      handleUpgradeClick();
      return;
    }

    executeGeneration(params);
  };

  const handleGeneratePlanB = async () => {
    if (isPlanBLoading) return;
    setIsPlanBLoading(true);
    try {
      const planB = await generatePlanBContent(params);
      setPlanBResult(planB);
    } catch (err) {
      alert("No se pudo generar el Plan B.");
    } finally {
      setIsPlanBLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;

    if (!userEmail && !isPro) {
      setIsPendingGeneration(false);
      setIsEmailModalOpen(true);
      return;
    }

    if (!isPro && favorites.length >= MAX_FREE_FAVORITES) {
      alert(`Has llegado al límite de guardado gratuito (${MAX_FREE_FAVORITES} clases). Sube a PRO para biblioteca ilimitada.`);
      handleUpgradeClick();
      return;
    }

    const newFavorite: SavedLesson = {
      ...params,
      id: Date.now().toString(),
      content: result,
      createdAt: Date.now()
    };
    const updated = [newFavorite, ...favorites];
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
    alert("¡Clase guardada en tu biblioteca!");
  };

  const handlePaymentSuccess = () => {
    setIsPro(true);
    localStorage.setItem('manana_pro_status', 'true');
    setIsPaymentModalOpen(false);
    alert("¡Bienvenido a MAÑANA PRO! 👑");
    setView('pro');
  };

  const handleCancelClick = () => setIsCancelModalOpen(true);

  const handleFinalCancel = (reason: string, feedback: string) => {
    setIsPro(false);
    localStorage.setItem('manana_pro_status', 'false');
    setIsCancelModalOpen(false);
    alert("Suscripción cancelada.");
    setView('generator');
  };

  const handleSelectLesson = (l: SavedLesson) => {
    setParams({ 
      grade: l.grade, 
      topic: l.topic, 
      duration: l.duration, 
      status: l.status,
      tone: l.tone || 'Divertido',
      groupSize: l.groupSize || '16-30'
    });
    setResult(l.content);
    setPlanBResult(null);
    setView('generator');
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteLesson = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
  };

  const handleRenameLesson = (id: string, newTitle: string) => {
    const updated = favorites.map(f => f.id === id ? { ...f, topic: newTitle } : f);
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('generator')} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans">
      <Header 
        isPro={isPro} 
        onOpenPanel={() => setView('pro')} 
        onHome={() => setView('landing')} 
      />
      
      {view === 'pro' ? (
        <ProPanel 
          isPro={isPro} 
          favorites={favorites} 
          onBack={() => setView('generator')}
          onUpgrade={handleUpgradeClick}
          onCancelSubscription={handleCancelClick}
          onSelectLesson={handleSelectLesson}
          onDeleteLesson={handleDeleteLesson}
          onRenameLesson={handleRenameLesson}
        />
      ) : (
        <main className="container mx-auto px-4 max-w-4xl py-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="order-1">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">MAÑANA</h2>
                <p className="text-gray-500 font-medium">Planeaciones rápidas alineadas a la NEM.</p>
                
                {!isPro && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {userEmail ? 'Clases Gratuitas:' : 'Tu primera clase es libre:'}
                    </span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${totalGenerations >= 8 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${(totalGenerations / FREE_WITH_EMAIL_LIMIT) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">{totalGenerations}/{FREE_WITH_EMAIL_LIMIT}</span>
                  </div>
                )}
              </div>
              
              <LessonForm 
                params={params} 
                setParams={setParams} 
                onSubmit={handleGenerate}
                onUpgrade={handleUpgradeClick}
                isLoading={isLoading}
                isPro={isPro}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-center font-bold animate-shake">
                  {error}
                  <button 
                    onClick={handleUpgradeClick}
                    className="block mx-auto mt-2 text-sm underline text-red-800"
                  >
                    Sube a PRO para planeaciones ilimitadas
                  </button>
                </div>
              )}
            </div>

            <div className="order-2">
              {isLoading && (
                <div className="text-center py-16 animate-in fade-in duration-300">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-900 font-black text-xl animate-pulse tracking-tight uppercase">GENERANDO PLANEACIÓN NEM...</p>
                  <p className="text-sm text-gray-400 mt-2 italic font-medium">Buscando el mejor enfoque docente en 60 segundos...</p>
                </div>
              )}

              {result && !isLoading && (
                <LessonResult 
                  content={result}
                  planBContent={planBResult}
                  params={params}
                  isPro={isPro}
                  onSave={handleSave} 
                  onRegenerate={() => executeGeneration(params)}
                  onUpgrade={handleUpgradeClick}
                  onGeneratePlanB={handleGeneratePlanB}
                  isLoading={isLoading}
                  isPlanBLoading={isPlanBLoading}
                />
              )}
            </div>

            <div className="order-3">
              <FavoriteLessons 
                favorites={favorites}
                isPro={isPro}
                onSelect={handleSelectLesson}
                onDelete={handleDeleteLesson}
                onRename={handleRenameLesson}
                onUpgrade={handleUpgradeClick}
              />
            </div>
          </div>
        </main>
      )}

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleFinalCancel}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailSubmit}
      />

      <footer className="mt-20 py-12 text-center text-gray-400 text-sm border-t border-gray-100">
        <div className="mb-4 font-black text-green-600/50 uppercase tracking-widest text-lg">MAÑANA</div>
        <p>© {new Date().getFullYear()} MAÑANA - Hecho con ❤️ para maestros de México 🇲🇽</p>
      </footer>
    </div>
  );
};

export default App;
