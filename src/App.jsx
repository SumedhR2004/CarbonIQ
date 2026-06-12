import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptLab, { DEFAULT_SYSTEM_PROMPT } from './components/PromptLab';
import ChatSandbox from './components/ChatSandbox';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { subscribeToAuth, saveCalculationResult, fetchCalculationHistory } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  
  // Prompt states
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [engineMode, setEngineMode] = useState('local'); // 'local' or 'gemini'
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);

  // Carbon states
  const [answers, setAnswers] = useState({
    transport: null,
    commuteDistance: null,
    diet: null,
    foodWaste: null,
    electricity: null,
    digital: null,
    shopping: null,
    flights: null
  });
  const [score, setScore] = useState(0);
  const [actionPlan, setActionPlan] = useState([]);
  const [history, setHistory] = useState([]);

  // Subscribe to Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch history when user logins or logouts
  useEffect(() => {
    const syncHistory = async () => {
      const data = await fetchCalculationHistory(user);
      setHistory(data);
    };
    syncHistory();
  }, [user]);

  // Save calculation run
  const handleSaveResult = async (finalAnswers, finalScore, finalPlan) => {
    try {
      const savedItem = await saveCalculationResult(user, finalAnswers, finalScore, finalPlan);
      // Append to local history list state immediately
      setHistory(prev => [savedItem, ...prev.slice(0, 9)]);
    } catch (e) {
      console.error("Save failure:", e);
    }
  };

  // Load past history items
  const handleLoadHistoryItem = (item) => {
    if (item.answers) {
      setAnswers(item.answers);
      setScore(item.score);
      setActionPlan(item.actionPlan || []);
      alert(`Loaded historical run from ${new Date(item.createdAt).toLocaleDateString()}`);
    }
  };

  // Clear local/mock records
  const handleClearHistory = () => {
    if (confirm("Clear your calculation history?")) {
      const userId = user ? user.uid : 'anonymous';
      localStorage.removeItem(`carboniq_history_${userId}`);
      setHistory([]);
    }
  };

  return (
    <div className="app-container">
      {/* Floating ocean bubbles */}
      <div className="ocean-bubbles" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${5 + (i * 8.3) % 90}%`,
              width: `${6 + (i % 4) * 4}px`,
              height: `${6 + (i % 4) * 4}px`,
              animationDuration: `${8 + (i % 5) * 4}s`,
              animationDelay: `${(i * 1.3) % 7}s`
            }}
          />
        ))}
      </div>

      <Header user={user} onClearHistory={handleClearHistory} />
      
      <main className="main-layout">
        {/* Left Panel: Prompt Settings & Configuration */}
        <PromptLab
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          engineMode={engineMode}
          setEngineMode={setEngineMode}
          apiKey={apiKey}
          setApiKey={setApiKey}
          temperature={temperature}
          setTemperature={setTemperature}
        />

        {/* Center Panel: Sandbox Arena */}
        <ChatSandbox
          systemPrompt={systemPrompt}
          engineMode={engineMode}
          apiKey={apiKey}
          temperature={temperature}
          answers={answers}
          setAnswers={setAnswers}
          score={score}
          setScore={setScore}
          actionPlan={actionPlan}
          setActionPlan={setActionPlan}
          onSaveResult={handleSaveResult}
        />

        {/* Right Panel: Data Visualizer & Interactive Planner */}
        <AnalyticsDashboard
          answers={answers}
          score={score}
          actionPlan={actionPlan}
          history={history}
          onLoadHistoryItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
        />
      </main>
    </div>
  );
}

export default App;
