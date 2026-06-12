import React from 'react';
import { LogIn, LogOut, ShieldAlert, Radio } from 'lucide-react';
import FootprintLogo from './FootprintLogo';
import { loginWithGoogle, logoutUser, isFirebaseAvailable } from '../firebase';

export default function Header({ user }) {
  const handleAuth = async () => {
    if (user) {
      await logoutUser();
    } else {
      try {
        await loginWithGoogle();
      } catch (err) {
        alert("Authentication failed. Running in local cache mode.");
      }
    }
  };

  return (
    <header style={{
      height: '72px',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'hsla(205, 55%, 6%, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid hsla(186, 60%, 50%, 0.12)',
      boxShadow: '0 1px 0 hsla(186, 80%, 70%, 0.05), 0 4px 24px rgba(0,0,0,0.3)',
      zIndex: 10,
      position: 'relative'
    }}>
      {/* Left: Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Animated logo blob */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, hsla(186, 94%, 42%, 0.25), hsla(207, 90%, 55%, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid hsla(186, 94%, 42%, 0.3)',
          boxShadow: '0 0 20px hsla(186, 94%, 42%, 0.2), inset 0 1px 0 hsla(186, 80%, 80%, 0.1)',
          animation: 'pulseGlow 3s ease-in-out infinite'
        }}>
          <FootprintLogo size={24} glowColor="hsl(186, 94%, 62%)" />
        </div>

        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(90deg, hsl(186, 94%, 75%), hsl(207, 90%, 75%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            CarbonIQ
            <span style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '5px',
              background: 'hsla(186, 94%, 42%, 0.12)',
              color: 'hsl(186, 94%, 62%)',
              border: '1px solid hsla(186, 94%, 42%, 0.25)',
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              WebkitTextFillColor: 'hsl(186, 94%, 62%)'
            }}>v1.2.0</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'hsl(200, 30%, 55%)', fontFamily: 'var(--font-body)' }}>
            AI-Powered Carbon Footprint Guide
          </p>
        </div>
      </div>

      {/* Center: subtle wave decoration */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        opacity: 0.3
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: '3px',
            height: `${8 + Math.sin(i) * 5}px`,
            borderRadius: '2px',
            background: 'hsl(186, 94%, 62%)',
            animation: `pulseGlow ${1 + i * 0.2}s ease-in-out infinite alternate`
          }} />
        ))}
      </div>

      {/* Right: Status + Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isFirebaseAvailable ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: '6px',
            background: 'hsla(186, 94%, 42%, 0.1)',
            color: 'hsl(186, 94%, 62%)',
            border: '1px solid hsla(186, 94%, 42%, 0.22)'
          }}>
            <Radio size={10} /> Live Sync
          </span>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: '6px',
            background: 'hsla(38, 95%, 55%, 0.1)',
            color: 'hsl(38, 95%, 65%)',
            border: '1px solid hsla(38, 95%, 55%, 0.22)'
          }} data-tooltip="Using localStorage for calculation persistence.">
            <ShieldAlert size={10} /> Cache Mode
          </span>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
              alt={user.displayName}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                border: '2px solid hsla(186, 94%, 42%, 0.4)',
                boxShadow: '0 0 10px hsla(186, 94%, 42%, 0.2)'
              }}
            />
            <button onClick={handleAuth} className="btn btn-secondary"
              style={{ padding: '7px 13px', fontSize: '12px' }}>
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button onClick={handleAuth} className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}>
            <LogIn size={14} />
            <span>Sign In with Google</span>
          </button>
        )}
      </div>
    </header>
  );
}
