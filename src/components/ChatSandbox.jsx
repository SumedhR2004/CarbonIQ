import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, HelpCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import FootprintLogo from './FootprintLogo';
import { calculateCategoryScore, calculateTotalScore, generateActionPlan } from '../utils/carbonRules';

export default function ChatSandbox({ 
  systemPrompt, 
  engineMode, 
  apiKey, 
  temperature,
  answers,
  setAnswers,
  score,
  setScore,
  actionPlan,
  setActionPlan,
  onSaveResult
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localStep, setLocalStep] = useState(0); // 0 = welcome screen, 1-8 for questions, 9 for done
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Sync state variables when answers change
  useEffect(() => {
    const total = calculateTotalScore(answers);
    setScore(total);
    const plan = generateActionPlan(answers);
    setActionPlan(plan);
  }, [answers, setScore, setActionPlan]);

  // Restart conversation
  const handleResetChat = () => {
    setLocalStep(0);
    setHasStarted(false);
    setAnswers({
      transport: null, commuteDistance: null, diet: null, foodWaste: null,
      electricity: null, digital: null, shopping: null, flights: null
    });
    setMessages([]);
    setIsLoading(false);
  };

  const startConversation = () => {
    setHasStarted(true);
    setLocalStep(1);
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'model',
      text: "Hey there! I'm CarbonIQ 🌊 — your personal carbon footprint analyst.\n\nI'll walk you through 8 targeted questions about your lifestyle and calculate your precise CO₂ impact across 7 categories. Then I'll generate a personalized reduction plan.\n\nLet's dive in! 🐬\n\nQuestion 1 of 8: How do you mainly commute?\n→ Car\n→ Public transport (bus, train, metro)\n→ Bike or walking",
      timestamp: new Date()
    }]);
  };

  // 8-Question Local Simulation Engine
  const processLocalResponse = (userText) => {
    const cleanInput = userText.trim().toLowerCase();
    const updatedAnswers = { ...answers };
    let botReply = '';
    let nextStep = localStep;

    switch (localStep) {
      case 1: { // Transport Mode
        if (cleanInput.includes('car')) {
          updatedAnswers.transport = 'car';
          botReply = `🚗 Got it — car commuter!\n\nDid you know? An average car emits about 4,600 kg of CO₂ per year. That's the weight of a full-grown elephant!\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year`;
        } else if (cleanInput.includes('public') || cleanInput.includes('transport') || cleanInput.includes('bus') || cleanInput.includes('train') || cleanInput.includes('metro')) {
          updatedAnswers.transport = 'public';
          botReply = `🚌 Smart! Public transport cuts emissions by ~67% vs driving.\n\nFun fact: One city bus replacing 40 cars saves 120,000 kg CO₂ annually! 🎉\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year`;
        } else {
          updatedAnswers.transport = 'bike';
          botReply = `🚲 Amazing! Zero transport emissions — you're already a climate hero!\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year`;
        }
        botReply += `\n\nQuestion 2 of 8: How far is your daily commute (one way)?\n→ Under 5 km\n→ 5-15 km\n→ 15-30 km\n→ Over 30 km`;
        nextStep = 2;
        break;
      }

      case 2: { // Commute Distance
        if (cleanInput.includes('under') || cleanInput.includes('< 5') || cleanInput.includes('5 km') && !cleanInput.includes('15') && !cleanInput.includes('30')) {
          updatedAnswers.commuteDistance = 'under 5 km';
          botReply = `📏 Short commute! Distance matters a lot — a 5 km drive emits 70% less than a 30 km one.\n\nAt this distance, you could actually switch to cycling and save 100% of transport emissions!`;
        } else if (cleanInput.includes('5-15') || cleanInput.includes('10') || cleanInput.includes('15')) {
          updatedAnswers.commuteDistance = '5-15 km';
          botReply = `📏 Medium commute — the sweet spot where e-bikes and carpooling become great options!\n\nAn e-bike for 10 km uses just 1% of the energy a car needs. 🔋`;
        } else if (cleanInput.includes('15-30') || cleanInput.includes('20') || cleanInput.includes('25')) {
          updatedAnswers.commuteDistance = '15-30 km';
          botReply = `📏 Longer commute — this significantly amplifies your transport footprint.\n\nRemote work just 2 days per week could cut your commute emissions by 40%! 💻`;
        } else {
          updatedAnswers.commuteDistance = 'over 30 km';
          botReply = `📏 Long commute! Distance is a major multiplier for transport emissions.\n\nDid you know? A 50 km daily car commute produces more CO₂ than a return flight to Goa!`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 3 of 8: What best describes your diet?\n→ Meat daily\n→ Meat sometimes\n→ Vegetarian\n→ Vegan`;
        nextStep = 3;
        break;
      }

      case 3: { // Diet
        if (cleanInput.includes('meat daily') || cleanInput.includes('daily')) {
          updatedAnswers.diet = 'meat daily';
          botReply = `🥩 A meat-heavy diet adds ~3,300 kg CO₂/year.\n\nFor context: producing 1 kg of beef requires 15,000 liters of water — that's 60 bathtubs! 🛁`;
        } else if (cleanInput.includes('meat sometimes') || cleanInput.includes('sometimes')) {
          updatedAnswers.diet = 'meat sometimes';
          botReply = `🍗 Balanced! Moderate meat saves ~1,300 kg CO₂/year vs daily.\n\nThat's like taking 5,000 km of car trips off the road! 🚗💨`;
        } else if (cleanInput.includes('vegetarian') || cleanInput.includes('veg')) {
          updatedAnswers.diet = 'vegetarian';
          botReply = `🥦 Vegetarians save ~1,800 kg CO₂/year vs daily meat-eaters.\n\nEquivalent to planting 82 trees every year! 🌳`;
        } else if (cleanInput.includes('vegan')) {
          updatedAnswers.diet = 'vegan';
          botReply = `🌱 Incredible! Lowest food footprint — just 1,000 kg CO₂/year.\n\nYou're saving the equivalent of charging your phone 460,000 times! 📱⚡`;
        } else {
          updatedAnswers.diet = 'meat sometimes';
          botReply = `Got it — I'll estimate a moderate mixed diet.`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 4 of 8: How much food do you typically waste per week?\n→ A lot (throw away items regularly)\n→ Some (occasional waste)\n→ Very little (meal plan / compost)`;
        nextStep = 4;
        break;
      }

      case 4: { // Food Waste
        if (cleanInput.includes('a lot') || cleanInput.includes('lot') || cleanInput.includes('regularly')) {
          updatedAnswers.foodWaste = 'a lot';
          botReply = `🗑️ High food waste adds ~1,100 kg CO₂/year!\n\nShocking fact: If food waste were a country, it would be the world's 3rd largest greenhouse gas emitter — after China and the USA! 🌍`;
        } else if (cleanInput.includes('some') || cleanInput.includes('occasional')) {
          updatedAnswers.foodWaste = 'some';
          botReply = `🗑️ Some waste — about 500 kg CO₂/year.\n\nDid you know? The average household throws away ₹50,000 worth of food per year. Reducing waste saves money AND the planet! 💰`;
        } else {
          updatedAnswers.foodWaste = 'very little';
          botReply = `🗑️ Minimal waste — only 150 kg CO₂/year. That's excellent!\n\nMeal planning and composting are superpowers. You're preventing methane emissions from landfills! 🦸‍♂️`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 5 of 8: How many hours daily do you use AC or heating?\n(Reply with a number, e.g. 4)`;
        nextStep = 5;
        break;
      }

      case 5: { // Electricity
        const hours = parseFloat(cleanInput.replace(/[^\d.]/g, ''));
        updatedAnswers.electricity = isNaN(hours) ? 4 : hours;
        const elecKg = calculateCategoryScore('electricity', updatedAnswers.electricity);

        if (updatedAnswers.electricity <= 1) {
          botReply = `⚡ Barely any AC — impressive! Only ${Math.round(elecKg)} kg CO₂/year from cooling.`;
        } else if (updatedAnswers.electricity <= 4) {
          botReply = `⚡ Moderate at ${updatedAnswers.electricity} hrs/day — ${Math.round(elecKg).toLocaleString()} kg CO₂/year.\n\nFun fact: Setting AC just 2°C higher saves up to 400 kg CO₂ annually!`;
        } else {
          botReply = `⚡ Heavy usage at ${updatedAnswers.electricity} hrs/day — ${Math.round(elecKg).toLocaleString()} kg CO₂/year!\n\nThat's like burning ${Math.round(elecKg / 2.3)} liters of petrol! ⛽`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 6 of 8: How often do you buy new clothes or electronics?\n→ Weekly\n→ Monthly\n→ Rarely`;
        nextStep = 6;
        break;
      }

      case 6: { // Shopping
        if (cleanInput.includes('weekly')) {
          updatedAnswers.shopping = 'weekly';
          botReply = `🛍️ Weekly shopping = 1,200 kg CO₂/year!\n\nFast fashion alone produces 10% of global emissions — more than international flights and shipping combined! ✈️🚢`;
        } else if (cleanInput.includes('monthly')) {
          updatedAnswers.shopping = 'monthly';
          botReply = `🛍️ Monthly shopping — 600 kg CO₂/year.\n\nTip: Buying secondhand saves up to 82% of the carbon footprint! ♻️`;
        } else {
          updatedAnswers.shopping = 'rarely';
          botReply = `🛍️ Minimalist! Only 200 kg CO₂/year.\n\nEvery item you don't buy is a win for the planet! 🌍✨`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 7 of 8: How many hours per day do you spend streaming, gaming, or on social media?\n(Reply with a number, e.g. 3)`;
        nextStep = 7;
        break;
      }

      case 7: { // Digital Footprint
        const digitalHrs = parseFloat(cleanInput.replace(/[^\d.]/g, ''));
        updatedAnswers.digital = isNaN(digitalHrs) ? 3 : digitalHrs;
        const digitalKg = calculateCategoryScore('digital', updatedAnswers.digital);

        if (updatedAnswers.digital <= 1) {
          botReply = `📱 Light digital usage — only ${Math.round(digitalKg)} kg CO₂/year. Digital minimalist! 🧘`;
        } else if (updatedAnswers.digital <= 4) {
          botReply = `📱 ${updatedAnswers.digital} hrs/day of screen time = ${Math.round(digitalKg)} kg CO₂/year.\n\nSurprising fact: 1 hour of HD streaming emits about 55g of CO₂ — the same as boiling a kettle 3 times! ☕`;
        } else {
          botReply = `📱 Heavy digital at ${updatedAnswers.digital} hrs/day = ${Math.round(digitalKg)} kg CO₂/year.\n\nGlobal data centers now use more electricity than some entire countries! The internet's carbon footprint rivals the aviation industry. 🌐✈️`;
        }
        botReply += `\n\n📊 Running Total: ${calculateTotalScore(updatedAnswers).toLocaleString()} kg CO₂/year\n\nQuestion 8 of 8 (final!): How many flights did you take last year?\n(Reply with a number, e.g. 2)`;
        nextStep = 8;
        break;
      }

      case 8: { // Flights (Final)
        const trips = parseInt(cleanInput.replace(/[^\d]/g, ''), 10);
        updatedAnswers.flights = isNaN(trips) ? 1 : trips;

        const finalScore = calculateTotalScore(updatedAnswers);
        const plan = generateActionPlan(updatedAnswers);

        let flightComment = '';
        if (updatedAnswers.flights === 0) {
          flightComment = '✈️ Zero flights — ground travel champion! 🏆';
        } else if (updatedAnswers.flights <= 2) {
          flightComment = `✈️ ${updatedAnswers.flights} flight(s) = ${(updatedAnswers.flights * 500).toLocaleString()} kg CO₂. Each flight ≈ driving 2,000 km!`;
        } else {
          flightComment = `✈️ ${updatedAnswers.flights} flights = ${(updatedAnswers.flights * 500).toLocaleString()} kg CO₂. A round-trip London→NYC emits more CO₂ than some people produce in an entire year!`;
        }

        let verdict = '';
        if (finalScore < 1900) {
          verdict = "🏆 Incredible! You're below India's average (1,900 kg) — you're an eco-leader!\nHere's how to push even further:";
        } else if (finalScore <= 4800) {
          verdict = "👍 Between India's average and the global average — great foundation!\nSmall tweaks can make a huge difference:";
        } else {
          verdict = "📈 Above the global average (4,800 kg) — but the biggest footprints have the biggest room for improvement!\nHere's your personalized plan:";
        }

        botReply = `${flightComment}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n🌊 YOUR CARBON FOOTPRINT REPORT\n   8 Categories Analyzed\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ Total: ${finalScore.toLocaleString()} kg CO₂/year\n\n🌍 Global avg: 4,800 kg  •  🇮🇳 India avg: 1,900 kg  •  🎯 2050 target: 2,000 kg\n\n${verdict}\n\n`;

        plan.forEach((item, index) => {
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          botReply += `${emoji} ${item.action}\n   💚 Saves ${item.saving.toLocaleString()} kg CO₂/yr  •  ${item.difficulty}\n\n`;
        });

        const treesNeeded = Math.round(finalScore / 22);
        botReply += `🌳 To offset: you'd need ${treesNeeded} trees for a full year.\n\nCheck off actions in the right panel to see your score drop live! 💪🌊`;
        nextStep = 9;
        break;
      }

      default: {
        const currentTotal = calculateTotalScore(updatedAnswers);
        const facts = [
          "A tree absorbs ~22 kg CO₂ per year. Small forests can offset households! 🌳",
          "The ocean absorbs 30% of human CO₂, causing ocean acidification. 🌊",
          "Turning off lights saves ~40 kg CO₂ per year. 💡",
          "A Google search uses ~0.2g CO₂. This chat? Almost nothing! 😄",
          "If food waste were a country, it'd be the 3rd largest emitter. 🍎",
          "Your phone charger left plugged in uses 5-10 watts continuously. 🔌",
          "Recycling one aluminum can saves enough energy to run a TV for 3 hours. 📺"
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        botReply = `Your score: ${currentTotal.toLocaleString()} kg CO₂/year.\n\n💡 ${randomFact}\n\nCheck off actions in the right panel, or click "Restart Calculator" for a new calculation!`;
        break;
      }
    }

    setAnswers(updatedAnswers);
    setLocalStep(nextStep);

    // Add Bot reply with slight delayed writing feel
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'bot-' + Date.now(),
        role: 'model',
        text: botReply,
        timestamp: new Date()
      }]);
      setIsLoading(false);
      
      // Auto save final results if we just finished
      if (nextStep === 9) {
        onSaveResult(updatedAnswers, calculateTotalScore(updatedAnswers), generateActionPlan(updatedAnswers));
      }
    }, 600);
  };

  // Real LLM call using Gemini API
  const callGeminiAPI = async (chatContents) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: chatContents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("Invalid API response format");
      }

      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return `⚠️ Gemini LLM Error: ${error.message}\n\nPlease check your API key in the Prompt Lab or switch to "Local Simulator" in the left panel.`;
    }
  };

  // Parse text output from LLM to dynamically update charts if possible
  const attemptSyncFromLLMResponse = (text) => {
    // Look for patterns like "Your Carbon Footprint: 5,400 kg" or "score: 5400 kg"
    const scoreMatch = text.match(/Your Carbon Footprint:\s*([\d,]+)\s*kg/i) || 
                       text.match(/score:\s*([\d,]+)\s*kg/i);
    
    if (scoreMatch) {
      const parsedScore = parseFloat(scoreMatch[1].replace(/,/g, ''));
      if (!isNaN(parsedScore)) {
        setScore(parsedScore);
      }
    }

    // Try to guess values for dashboard inputs based on text keywords
    const newAnswers = { ...answers };
    let changed = false;

    if (text.includes("Car")) { newAnswers.transport = 'car'; changed = true; }
    if (text.includes("Public transport")) { newAnswers.transport = 'public'; changed = true; }
    if (text.includes("Bike") || text.includes("walking")) { newAnswers.transport = 'bike'; changed = true; }

    if (text.includes("Meat daily")) { newAnswers.diet = 'meat daily'; changed = true; }
    if (text.includes("Meat sometimes")) { newAnswers.diet = 'meat sometimes'; changed = true; }
    if (text.includes("Vegetarian")) { newAnswers.diet = 'vegetarian'; changed = true; }
    if (text.includes("Vegan")) { newAnswers.diet = 'vegan'; changed = true; }

    if (changed) {
      setAnswers(newAnswers);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    if (engineMode === 'local') {
      processLocalResponse(text);
    } else {
      // Real LLM call
      if (!apiKey) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'api-missing-' + Date.now(),
            role: 'model',
            text: "⚠️ Gemini API key is missing. Please enter your API key in the Prompt Lab (left sidebar) or toggle the engine mode to 'Local Simulator'.",
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // Map chat messages to Gemini's format: user -> user, model -> model
      // We take the last 15 messages for context
      const chatContents = messages.concat(userMsg).slice(-15).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const reply = await callGeminiAPI(chatContents);
      
      setMessages(prev => [...prev, {
        id: 'bot-' + Date.now(),
        role: 'model',
        text: reply,
        timestamp: new Date()
      }]);
      setIsLoading(false);

      // Attempt to sync model outputs into our live visual dashboards
      attemptSyncFromLLMResponse(reply);
    }
  };

  // Get current prompt instruction state to display
  const getQuickReplies = () => {
    if (engineMode !== 'local') return null;
    
    switch (localStep) {
      case 1:
        return [
          { text: '🚗 Car', value: 'Car' },
          { text: '🚌 Public Transport', value: 'Public transport' },
          { text: '🚲 Bike / Walking', value: 'Bike or walking' }
        ];
      case 2:
        return [
          { text: '📏 Under 5 km', value: 'Under 5 km' },
          { text: '📏 5-15 km', value: '5-15 km' },
          { text: '📏 15-30 km', value: '15-30 km' },
          { text: '📏 Over 30 km', value: 'Over 30 km' }
        ];
      case 3:
        return [
          { text: '🥩 Meat daily', value: 'Meat daily' },
          { text: '🍗 Meat sometimes', value: 'Meat sometimes' },
          { text: '🥦 Vegetarian', value: 'Vegetarian' },
          { text: '🌱 Vegan', value: 'Vegan' }
        ];
      case 4:
        return [
          { text: '🗑️ A lot', value: 'A lot' },
          { text: '🗑️ Some', value: 'Some' },
          { text: '🗑️ Very little', value: 'Very little' }
        ];
      case 5:
        return [
          { text: '⚡ 0 hours', value: '0' },
          { text: '⚡ 2 hours', value: '2' },
          { text: '⚡ 5 hours', value: '5' },
          { text: '⚡ 8+ hours', value: '8' }
        ];
      case 6:
        return [
          { text: '🛍️ Weekly', value: 'Weekly' },
          { text: '🛍️ Monthly', value: 'Monthly' },
          { text: '🛍️ Rarely', value: 'Rarely' }
        ];
      case 7:
        return [
          { text: '📱 1 hour', value: '1' },
          { text: '📱 3 hours', value: '3' },
          { text: '📱 5 hours', value: '5' },
          { text: '📱 8+ hours', value: '8' }
        ];
      case 8:
        return [
          { text: '✈️ 0 flights', value: '0' },
          { text: '✈️ 1 flight', value: '1' },
          { text: '✈️ 3 flights', value: '3' },
          { text: '✈️ 5+ flights', value: '5' }
        ];
      case 9:
        return [
          { text: '🔄 Restart Calculator', value: 'reset' }
        ];
      default:
        return null;
    }
  };

  const quickReplies = getQuickReplies();

  return (
    <section className="glass" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Sandbox Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid hsla(186, 60%, 50%, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'hsla(205, 55%, 5%, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isLoading ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
            boxShadow: isLoading ? '0 0 12px hsla(186, 94%, 42%, 0.5)' : '0 0 12px hsla(186, 94%, 42%, 0.3)',
            animation: isLoading ? 'pulseGlow 1.5s infinite' : 'none'
          }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
              CarbonIQ Chat Sandbox
            </h3>
            <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
              Running: {engineMode === 'local' ? 'Local System Prompt Simulator' : 'Gemini 2.0 Flash Model'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleResetChat}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={12} />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Step Progress Bar */}
      {engineMode === 'local' && hasStarted && (
        <div style={{
          padding: '10px 20px 8px',
          borderBottom: '1px solid hsla(186, 60%, 50%, 0.08)',
          background: 'hsla(205, 55%, 4%, 0.4)'
        }}>
          <div className="step-progress">
            {['🚗', '📏', '🍽️', '🗑️', '⚡', '🛍️', '📱', '✈️'].map((icon, i) => {
              const stepNum = i + 1;
              const isCompleted = localStep > stepNum;
              const isActive = localStep === stepNum;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div className={`step-line ${isCompleted ? 'completed' : ''}`} />}
                  <div
                    className={`step-dot ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}
                    data-tooltip={['Transport', 'Distance', 'Diet', 'Food Waste', 'Energy', 'Shopping', 'Digital', 'Flights'][i]}
                    style={{ fontSize: '10px' }}
                  >
                    {isCompleted ? '✓' : icon}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10px', color: 'hsl(var(--text-muted))', letterSpacing: '0.04em' }}>
            {localStep <= 8 ? `Step ${localStep} of 8` : '✨ Report Ready'}
          </div>
        </div>
      )}

      {/* Welcome Splash Screen OR Messages */}
      {!hasStarted ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background wave */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(0deg, hsla(186, 94%, 42%, 0.08) 0%, transparent 100%)',
            borderRadius: '50% 50% 0 0'
          }} />

          {/* Animated wave rings */}
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                position: 'absolute',
                inset: `${i * 12}px`,
                border: `2px solid hsla(186, 94%, 42%, ${0.3 - i * 0.08})`,
                borderRadius: '50%',
                animation: `pulseGlow ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }} />
            ))}
            <div style={{
              position: 'absolute',
              inset: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.25), hsla(207, 90%, 55%, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              boxShadow: '0 0 40px hsla(186, 94%, 42%, 0.25)'
            }}>
              <FootprintLogo size={38} glowColor="hsl(186, 94%, 70%)" />
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '700',
              background: 'linear-gradient(90deg, hsl(186, 94%, 75%), hsl(207, 90%, 80%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '10px'
            }}>
              Calculate Your Carbon Footprint
            </h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', maxWidth: '380px', lineHeight: '1.7' }}>
              Answer 8 targeted questions about your lifestyle. Get your CO₂ score across 7 categories with fun comparisons and a personalized reduction plan.
            </p>
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[
              { icon: '⏱️', label: '~3 min', desc: 'to complete' },
              { icon: '📊', label: '7 categories', desc: 'analyzed' },
              { icon: '🎯', label: '3 actions', desc: 'personalized' }
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in" style={{
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'hsla(205, 50%, 10%, 0.5)',
                border: '1px solid hsla(186, 60%, 50%, 0.12)',
                textAlign: 'center',
                animationDelay: `${0.2 + i * 0.15}s`,
                opacity: 0,
                minWidth: '100px'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(186, 94%, 70%)' }}>{stat.label}</div>
                <div style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={startConversation}
            className="btn btn-primary"
            style={{
              padding: '14px 36px',
              fontSize: '16px',
              borderRadius: '16px',
              fontWeight: '700',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 30px hsla(186, 94%, 42%, 0.4), inset 0 1px 0 hsla(186, 80%, 80%, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Play size={18} style={{ marginRight: '6px' }} />
            Start Calculator
          </button>

          <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', opacity: 0.6 }}>
            No data leaves your browser • 100% private
          </p>
        </div>
      ) : (
      <div className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg) => {
          const isBot = msg.role === 'model';
          return (
            <div 
              key={msg.id} 
              className="animate-fade-in"
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isBot ? 'row' : 'row-reverse',
                alignItems: 'flex-start',
                maxWidth: '85%',
                alignSelf: isBot ? 'flex-start' : 'flex-end'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isBot ? 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.15), hsla(207, 90%, 55%, 0.1))' : 'hsla(205, 50%, 20%, 0.3)',
                border: isBot ? '1px solid hsla(186, 94%, 42%, 0.25)' : '1px solid hsla(205, 50%, 30%, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isBot ? <Bot size={16} style={{ color: 'hsl(186, 94%, 62%)' }} /> : <User size={16} />}
              </div>

              {/* Bubble */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  background: isBot ? 'hsla(205, 50%, 10%, 0.6)' : 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.12), hsla(207, 90%, 55%, 0.12))',
                  border: isBot ? '1px solid hsla(186, 60%, 50%, 0.15)' : '1px solid hsla(186, 94%, 42%, 0.2)',
                  borderRadius: isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                  padding: '12px 16px',
                  color: 'hsl(var(--text-primary))',
                  fontSize: '14px',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(4px)'
                }}>
                  {msg.text}
                </div>
                <span style={{ 
                  fontSize: '9px', 
                  color: 'hsl(var(--text-muted))',
                  alignSelf: isBot ? 'flex-start' : 'flex-end'
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.15), hsla(207, 90%, 55%, 0.1))',
              border: '1px solid hsla(186, 94%, 42%, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} style={{ color: 'hsl(186, 94%, 62%)' }} />
            </div>
            <div style={{
              background: 'hsla(205, 50%, 10%, 0.6)',
              border: '1px solid hsla(186, 60%, 50%, 0.15)',
              borderRadius: '0 16px 16px 16px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'hsl(186, 94%, 62%)', borderRadius: '50%', animation: 'pulseGlow 1s infinite alternate' }}></div>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'hsl(186, 94%, 62%)', borderRadius: '50%', animation: 'pulseGlow 1s infinite alternate 0.2s' }}></div>
              <div className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'hsl(186, 94%, 62%)', borderRadius: '50%', animation: 'pulseGlow 1s infinite alternate 0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Input / Quick Replies Footer */}
      {hasStarted && (
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid hsla(186, 60%, 50%, 0.12)',
        background: 'hsla(205, 55%, 5%, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Quick Replies */}
        {quickReplies && quickReplies.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            animation: 'fadeIn 0.3s ease'
          }}>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => {
                  if (reply.value === 'reset') {
                    handleResetChat();
                  } else {
                    handleSendMessage(reply.value);
                  }
                }}
                className="btn btn-secondary glass-interactive"
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  border: '1px solid hsla(186, 94%, 42%, 0.25)',
                  background: 'hsla(186, 94%, 42%, 0.06)',
                  fontWeight: '500'
                }}
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              engineMode === 'local' 
                ? `Enter response for question ${localStep <= 8 ? localStep : 'completed'}...` 
                : "Ask CarbonIQ anything about carbon footprints..."
            }
            className="input-field"
            disabled={isLoading}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: '46px',
              height: '46px',
              padding: '0',
              borderRadius: 'var(--radius-md)',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      )}
    </section>
  );
}
