import React, { useState } from 'react';
import { Settings, RefreshCw, Eye, EyeOff, Check, AlertCircle, ChevronDown, ChevronRight, Leaf, Globe, Shield } from 'lucide-react';
import FootprintLogo from './FootprintLogo';

export const DEFAULT_SYSTEM_PROMPT = `You are CarbonIQ, a friendly and knowledgeable carbon footprint guide. Your job is to help users understand, track, and reduce their personal carbon footprint through simple questions, real calculations, and personalized actionable advice.

━━━ IDENTITY ━━━
- Name: CarbonIQ
- Tone: encouraging, clear, non-preachy
- Never guilt-trip the user about their footprint
- Celebrate small wins enthusiastically
- Use simple language, real numbers, relatable comparisons

━━━ CORE FLOW (follow this every conversation) ━━━

STEP 1 — CALCULATE
Ask these 8 questions one at a time:
1. Transport: "How do you mainly commute? (car, public transport, bike/walking)"
2. Commute Distance: "How far is your daily commute one way? (under 5 km, 5-15 km, 15-30 km, over 30 km)"
3. Diet: "What best describes your diet? (meat daily, meat sometimes, vegetarian, vegan)"
4. Food Waste: "How much food do you typically waste per week? (a lot, some, very little)"
5. Electricity: "How many hours daily do you use AC or heating?"
6. Shopping: "How often do you buy new clothes or electronics? (weekly, monthly, rarely)"
7. Digital: "How many hours per day do you spend streaming, gaming, or on social media?"
8. Flights: "How many flights did you take last year?"

STEP 2 — SCORE
Calculate their CO2 in kg/year using these values:

Transport (base values, multiplied by distance modifier):
- Car daily = 4,600 kg/year
- Public transport = 1,500 kg/year  
- Bike/walking = 0 kg/year

Commute Distance (modifier on transport):
- Under 5 km = 0.3x
- 5-15 km = 0.7x
- 15-30 km = 1.0x
- Over 30 km = 1.5x

Diet:
- Meat daily = 3,300 kg/year
- Meat sometimes = 2,000 kg/year
- Vegetarian = 1,500 kg/year
- Vegan = 1,000 kg/year

Food Waste:
- A lot = 1,100 kg/year
- Some = 500 kg/year
- Very little = 150 kg/year

Electricity (AC/heating per hour daily):
- Multiply hours × 1.5 × 365 = kg/year

Shopping:
- Weekly = 1,200 kg/year
- Monthly = 600 kg/year
- Rarely = 200 kg/year

Digital (streaming/gaming per hour daily):
- Multiply hours × 25 = kg/year

Flights:
- Each flight = 500 kg

Add all values for total score.

STEP 3 — PRESENT RESULTS
Show results in this exact format:

"Your Carbon Footprint: [X] kg CO2/year

Compared to others:
🌍 Global average: 4,800 kg/year
🇮🇳 India average: 1,900 kg/year
⚡ Your score: [X] kg/year

[If below India average] → 
You're already doing better than most Indians. 
Here's how to go even further:

[If above global average] → 
You're above the global average but small 
changes make a big difference. Here's your 
personal plan:"

STEP 4 — PERSONALIZED ACTION PLAN
Give exactly 3 actions based on their HIGHEST scoring categories only. Not generic advice. Specific to what they told you.

Format each action as:
"Action [N]: [specific change]
Potential saving: [X] kg CO2/year
Difficulty: Easy/Medium/Hard"

━━━ RESPONSE RULES ━━━
- Ask ONE question at a time. Never multiple.
- Always show the running total after each answer
- Use emoji sparingly but effectively 🌱
- Never lecture. Just inform and empower.
- If user skips a question → use average value
- If user asks general questions mid-flow → answer briefly then return to the calculator
- Always end with an encouraging message`;

export default function PromptLab({ 
  systemPrompt, 
  setSystemPrompt, 
  engineMode, 
  setEngineMode, 
  apiKey, 
  setApiKey,
  temperature,
  setTemperature
}) {
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleReset = () => {
    if (confirm("Reset prompt to the default CarbonIQ system prompt?")) {
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <aside className="glass" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      height: '100%',
      overflowY: 'auto',
      borderRight: '1px solid hsla(186, 60%, 50%, 0.12)'
    }}>

      {/* About Card */}
      <div style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.1), hsla(207, 90%, 55%, 0.08))',
        border: '1px solid hsla(186, 94%, 42%, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle glow */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(186, 94%, 42%, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.3), hsla(207, 90%, 55%, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid hsla(186, 94%, 42%, 0.3)'
          }}>
            <FootprintLogo size={20} glowColor="hsl(186, 94%, 65%)" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>CarbonIQ</h3>
            <p style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>AI Carbon Footprint Calculator</p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', lineHeight: '1.6', marginBottom: '14px' }}>
          An intelligent guide that calculates your personal carbon footprint through conversational AI and provides data-driven, personalized action plans to reduce your environmental impact.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { icon: <Leaf size={10} />, text: 'CO₂ Tracking' },
            { icon: <Globe size={10} />, text: 'Global Benchmarks' },
            { icon: <Shield size={10} />, text: 'Privacy-First' }
          ].map((tag, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '500',
              background: 'hsla(186, 94%, 42%, 0.08)',
              border: '1px solid hsla(186, 94%, 42%, 0.15)',
              color: 'hsl(186, 94%, 65%)'
            }}>
              {tag.icon} {tag.text}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'hsla(205, 50%, 6%, 0.4)',
        border: '1px solid hsla(186, 60%, 50%, 0.1)',
      }}>
        <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: 'hsl(186, 94%, 70%)' }}>How It Works</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { step: '1', text: 'Answer 8 targeted lifestyle questions' },
            { step: '2', text: 'Get your CO₂ score with global comparisons' },
            { step: '3', text: 'Receive 3 personalized actions to reduce it' },
            { step: '4', text: 'Check off actions to simulate impact live' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.2), hsla(207, 90%, 55%, 0.15))',
                border: '1px solid hsla(186, 94%, 42%, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '700',
                color: 'hsl(186, 94%, 65%)',
                flexShrink: 0
              }}>
                {item.step}
              </div>
              <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: '1.5', paddingTop: '2px' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="ocean-divider" />

      {/* Settings Section */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={15} style={{ color: 'hsl(186, 94%, 62%)' }} />
          <h3 style={{ fontSize: '13px', fontWeight: '600' }}>Engine Settings</h3>
        </div>

        {/* Engine Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>Simulation Engine</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'hsla(205, 60%, 6%, 0.7)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid hsla(186, 60%, 50%, 0.15)'
          }}>
            <button
              type="button"
              onClick={() => setEngineMode('local')}
              style={{
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: engineMode === 'local' ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' : 'transparent',
                color: engineMode === 'local' ? 'hsl(var(--bg-main))' : 'hsl(var(--text-muted))',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🖥️ Local Sim
            </button>
            <button
              type="button"
              onClick={() => setEngineMode('gemini')}
              style={{
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: engineMode === 'gemini' ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' : 'transparent',
                color: engineMode === 'gemini' ? 'hsl(var(--bg-main))' : 'hsl(var(--text-muted))',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🤖 Gemini LLM
            </button>
          </div>
          <p style={{ fontSize: '10px', color: 'hsl(var(--text-muted))', opacity: 0.7 }}>
            {engineMode === 'local' 
              ? 'Runs locally in your browser — instant, offline, no API key needed.' 
              : 'Uses Google Gemini 2.0 Flash — bring your own API key.'}
          </p>
        </div>

        {/* Gemini API Key */}
        {engineMode === 'gemini' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>Gemini API Key</label>
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)} 
                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}
              >
                {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                <span>{showKey ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="input-field"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            />
            <span style={{ fontSize: '9px', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={9} style={{ color: 'hsl(var(--warning))' }} />
              Key stays in browser memory only. Never sent to our servers.
            </span>
          </div>
        )}

        {/* Temperature */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Temperature</span>
            <span style={{ fontWeight: '600', color: 'hsl(186, 94%, 70%)' }}>{temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ accentColor: 'hsl(186, 94%, 42%)', cursor: 'pointer' }}
          />
        </div>

        {/* Divider */}
        <div className="ocean-divider" />

        {/* Advanced: System Prompt (Collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-muted))',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '600',
              padding: 0,
              width: '100%'
            }}
          >
            {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Advanced: System Prompt
          </button>

          {showAdvanced && (
            <div className="animate-fade-in" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>
                  Used when Gemini LLM mode is active
                </span>
                <button 
                  type="button" 
                  onClick={handleReset} 
                  style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}
                >
                  <RefreshCw size={9} />
                  <span>Reset</span>
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="input-field"
                style={{
                  height: '200px',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  lineHeight: '1.4',
                  background: 'hsla(205, 60%, 6%, 0.7)',
                  padding: '10px',
                  border: '1px solid hsla(186, 60%, 50%, 0.15)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px' }}
        >
          {isSaved ? <Check size={14} style={{ color: 'hsl(var(--primary))' }} /> : null}
          <span>{isSaved ? 'Settings Synced' : 'Apply Settings'}</span>
        </button>

      </form>
    </aside>
  );
}
