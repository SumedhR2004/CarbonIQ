import { useState } from 'react';
import { BarChart3, Calendar, CheckSquare, Compass, Trash2, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCategoryBreakdown } from '../utils/carbonRules';

export default function AnalyticsDashboard({ 
  answers, 
  score, 
  actionPlan, 
  history, 
  onLoadHistoryItem,
  onClearHistory
}) {
  const [completedActions, setCompletedActions] = useState(new Set());
  const [simulatedSaving, setSimulatedSaving] = useState(0);
  const [prevActionPlan, setPrevActionPlan] = useState(actionPlan);

  if (actionPlan !== prevActionPlan) {
    setPrevActionPlan(actionPlan);
    setCompletedActions(new Set());
    setSimulatedSaving(0);
  }

  const handleActionToggle = (action) => {
    const newCompleted = new Set(completedActions);
    let newSaving = simulatedSaving;

    if (newCompleted.has(action.action)) {
      newCompleted.delete(action.action);
      newSaving -= action.saving;
    } else {
      newCompleted.add(action.action);
      newSaving += action.saving;
      
      // Celebrate with confetti when they commit to a carbon saving action!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.85, y: 0.8 }, // Bottom right side of screen
        colors: ['#06c8d8', '#3ab4f2', '#1ad4a3']
      });
    }

    setCompletedActions(newCompleted);
    setSimulatedSaving(newSaving);
  };

  const finalScore = Math.max(0, score - simulatedSaving);
  const percentOfGlobal = Math.min(150, Math.round((finalScore / 4800) * 100));

  // Determine color for the gauge and status text
  const getStatusDetails = () => {
    if (finalScore === 0 && score === 0) {
      return { text: "No Data", color: 'hsl(var(--text-muted))', badge: 'badge-teal' };
    }
    if (finalScore < 1900) {
      return { text: "Eco Leader", color: 'hsl(var(--primary))', badge: 'badge-emerald' };
    }
    if (finalScore <= 4800) {
      return { text: "Moderate Footprint", color: 'hsl(var(--secondary))', badge: 'badge-teal' };
    }
    return { text: "High Impact", color: 'hsl(var(--danger))', badge: 'badge-warning' };
  };

  const status = getStatusDetails();

  return (
    <aside className="glass" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      overflowY: 'auto',
      borderLeft: '1px solid hsla(186, 60%, 50%, 0.12)'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid hsla(186, 60%, 50%, 0.12)', paddingBottom: '12px' }}>
        <BarChart3 size={18} style={{ color: 'hsl(186, 94%, 62%)' }} />
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Live Carbon Analytics</h2>
      </div>

      {/* Empty State */}
      {score === 0 && (
        <div style={{
          padding: '30px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          flex: 1,
          justifyContent: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'hsla(186, 94%, 42%, 0.08)',
            border: '1px solid hsla(186, 94%, 42%, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            📊
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>No Data Yet</h3>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', lineHeight: '1.6', maxWidth: '280px' }}>
              Start the calculator in the center panel to see your live carbon footprint analytics, category breakdown, and personalized action plan here.
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '6px'
          }}>
            {['Gauge', 'Benchmarks', 'Breakdown', 'Actions'].map((item, i) => (
              <div key={i} style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'hsla(205, 50%, 10%, 0.4)',
                border: '1px solid hsla(186, 60%, 50%, 0.1)',
                fontSize: '10px',
                color: 'hsl(var(--text-muted))'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Gauge Widget */}
      {score > 0 && (
      <>
      <div className="glass animate-fade-in" style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'hsla(205, 50%, 6%, 0.5)',
        border: '1px solid hsla(186, 60%, 50%, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow behind */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${status.color}28 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        <span className={`badge ${status.badge}`} style={{ marginBottom: '12px' }}>
          {status.text}
        </span>

        {/* Circular Dial (SVG representation) */}
        <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '12px' }}>
          <svg 
            width="130" 
            height="130" 
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Carbon footprint dial displaying ${finalScore} kilograms of CO2 per year, which is ${percentOfGlobal}% of the global average.`}
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="hsla(186, 60%, 50%, 0.15)"
              strokeWidth="6"
            />
            {/* Foreground circle with stroke-dasharray */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke={`url(#gaugeGrad)`}
              strokeWidth="7"
              strokeDasharray={`${Math.min(264, (percentOfGlobal / 100) * 264)} 264`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(186, 94%, 52%)" />
                <stop offset="50%" stopColor="hsl(200, 90%, 60%)" />
                <stop offset="100%" stopColor="hsl(170, 80%, 55%)" />
              </linearGradient>
            </defs>
          </svg>
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {finalScore.toLocaleString()}
            </span>
            <span style={{ fontSize: '9px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              kg CO₂/yr
            </span>
          </div>
        </div>

        {simulatedSaving > 0 && (
          <div style={{ 
            fontSize: '11px', 
            color: 'hsl(var(--primary))', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '8px'
          }}>
            <TrendingDown size={12} />
            <span>Saving {simulatedSaving.toLocaleString()} kg from checked actions!</span>
          </div>
        )}
      </div>

      {/* Comparative Bar Chart */}
      <div className="glass" style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'hsla(220, 40%, 8%, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={14} style={{ color: 'hsl(207, 90%, 65%)' }} />
          <span>Regional Benchmarks</span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* India Average */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>🇮🇳 India Average</span>
              <span>1,900 kg</span>
            </div>
            <div style={{ height: '6px', background: 'hsla(186, 60%, 50%, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(1900 / 8000) * 100}%`, height: '100%', background: 'hsla(207, 90%, 61%, 0.5)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* User Score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px', fontWeight: '600' }}>
              <span style={{ color: status.color }}>⚡ Your Footprint</span>
              <span style={{ color: status.color }}>{finalScore.toLocaleString()} kg</span>
            </div>
            <div style={{ height: '8px', background: 'hsla(186, 60%, 50%, 0.12)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (finalScore / 8000) * 100)}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, hsl(var(--primary)), ${status.color})`, 
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>

          {/* Global Average */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>🌍 Global Average</span>
              <span>4,800 kg</span>
            </div>
            <div style={{ height: '6px', background: 'hsla(186, 60%, 50%, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(4800 / 8000) * 100}%`, height: '100%', background: 'hsla(15, 90%, 58%, 0.5)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* 2050 Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>🌱 2050 Climate Target</span>
              <span>2,000 kg</span>
            </div>
            <div style={{ height: '6px', background: 'hsla(186, 60%, 50%, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(2000 / 8000) * 100}%`, height: '100%', background: 'hsla(170, 80%, 50%, 0.5)', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Input Variable Inspector */}
      {score > 0 && (
        <div className="glass" style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'hsla(220, 40%, 8%, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>Active Model Inputs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px' }}>
            {[
              { icon: '🚗', label: 'Transport', val: answers.transport },
              { icon: '📏', label: 'Distance', val: answers.commuteDistance },
              { icon: '🍽️', label: 'Diet', val: answers.diet },
              { icon: '🗑️', label: 'Food Waste', val: answers.foodWaste },
              { icon: '⚡', label: 'Energy', val: answers.electricity ? `${answers.electricity} hrs` : null },
              { icon: '📱', label: 'Digital', val: answers.digital ? `${answers.digital} hrs` : null },
              { icon: '🛍️', label: 'Shopping', val: answers.shopping },
              { icon: '✈️', label: 'Flights', val: answers.flights !== null ? `${answers.flights}/yr` : null }
            ].map((item, i) => (
              <div key={i} style={{ padding: '5px 8px', background: 'hsla(220, 20%, 15%, 0.3)', borderRadius: '4px' }}>
                {item.icon} {item.label}: <strong style={{ color: 'hsl(var(--text-primary))' }}>{item.val || 'N/A'}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {score > 0 && (() => {
        const categories = getCategoryBreakdown(answers);
        const maxCatScore = Math.max(...categories.map(c => c.score), 1);

        return (
          <div className="glass" style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'hsla(205, 50%, 6%, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={14} style={{ color: 'hsl(186, 94%, 62%)' }} />
              <span>Category Breakdown</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{categories.length} active</span>
            </h3>
            {categories.map((cat) => {
              const pct = Math.min(100, (cat.score / maxCatScore) * 100);
              return (
                <div key={cat.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {cat.icon} {cat.label}
                    </span>
                    <span style={{ color: cat.color, fontWeight: '600' }}>{Math.round(cat.score).toLocaleString()} kg</span>
                  </div>
                  <div style={{ height: '6px', background: 'hsla(186, 60%, 50%, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`,
                      borderRadius: '3px',
                      transition: 'width 0.6s ease',
                      boxShadow: `0 0 8px ${cat.color}44`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Action Plan Simulator */}
      {actionPlan && actionPlan.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span>Interactive Action Plan</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actionPlan.map((action, idx) => {
              const isChecked = completedActions.has(action.action);
              return (
                 <div 
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleActionToggle(action)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleActionToggle(action);
                    }
                  }}
                  className="glass glass-interactive"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    border: isChecked ? '1px solid hsla(186, 94%, 42%, 0.4)' : '1px solid hsla(186, 60%, 50%, 0.12)',
                    background: isChecked ? 'hsla(186, 94%, 42%, 0.06)' : 'hsla(205, 50%, 10%, 0.3)',
                  }}
                >
                  <input
                    type="checkbox"
                    id={`action-checkbox-${idx}`}
                    aria-label={`Complete action: ${action.action}`}
                    checked={isChecked}
                    onChange={() => {}} // Handled by div click
                    style={{
                      marginTop: '3px',
                      accentColor: 'hsl(var(--primary))',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '12px', 
                      fontWeight: '500',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      color: isChecked ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))',
                      lineHeight: '1.4'
                    }}>
                      {action.action}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 4px' }}>
                        -{action.saving} kg CO₂
                      </span>
                      <span className="badge badge-teal" style={{ fontSize: '9px', padding: '1px 4px' }}>
                        {action.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History panel */}
      {history && history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid hsla(186, 60%, 50%, 0.12)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: 'hsl(var(--secondary))' }} />
              <span>Saved Runs History</span>
            </h3>
            <button 
              onClick={onClearHistory} 
              aria-label="Clear History"
              style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
            {history.map((item) => (
              <div 
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onLoadHistoryItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onLoadHistoryItem(item);
                  }
                }}
                className="glass-interactive"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid hsla(186, 60%, 50%, 0.12)',
                  background: 'hsla(205, 50%, 8%, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>Score: {item.score.toLocaleString()} kg CO₂</div>
                  <div style={{ color: 'hsl(var(--text-muted))', fontSize: '9px' }}>
                    {new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="badge badge-teal" style={{ fontSize: '9px' }}>Load</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
