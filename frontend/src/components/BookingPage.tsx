import type { Seat } from '../types';
import { 
  Monitor, Cpu, Gamepad2, Shield, Clock, AlertTriangle, CheckCircle2, 
  Tv, Zap, Info 
} from 'lucide-react';

interface BookingPageProps {
  contractValid: boolean;
  cafeValid: boolean;
  wallet: string;
  selectedSeat: Seat | null;
  setSelectedSeat: (seat: Seat | null) => void;
  hours: number;
  setHours: (hours: number) => void;
  loading: boolean;
  errorMsg: string;
  handleCreateBooking: () => void;
  seats: Seat[];
}

export default function BookingPage({ 
  contractValid, cafeValid, wallet, selectedSeat, setSelectedSeat, 
  hours, setHours, loading, errorMsg, handleCreateBooking, seats 
}: BookingPageProps) {
  return (
    <>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '1rem 0' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }} className="text-gradient">
          CyberSeat Escrow
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Secure gaming seat reservations powered by Stellar Soroban. 
          Your XLM stays in escrow until you finish your session.
        </p>
        {!contractValid && (
           <p style={{ marginTop: '1rem', color: '#ffc107', fontSize: '1rem', fontWeight: '500' }}>
             ⚠️ Demo Mode: Deploy the Soroban contract to enable real bookings.
           </p>
        )}
      </div>

      {!contractValid && (
        <div className="glass-panel" style={{ marginBottom: '3rem', border: '1px solid #ffc107', background: 'rgba(255,193,7,0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffc107', marginBottom: '1rem' }}>
            <Shield size={20} /> Setup Checklist Required
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>1. <code>stellar contract build</code></div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>2. <code>stellar contract deploy</code></div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>3. Initialize contract (admin & token)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>4. Set <code>VITE_CYBERSEAT_CONTRACT_ID</code></div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>5. Restart Frontend Server</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Seat Catalog */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tv size={24} /> Available Gaming PCs
          </h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {seats.map(seat => (
              <div 
                key={seat.id} 
                className="card"
                style={{ 
                  cursor: 'pointer',
                  borderColor: selectedSeat?.id === seat.id ? 'var(--primary-color)' : 'var(--border-color)',
                  boxShadow: selectedSeat?.id === seat.id ? '0 0 20px rgba(0,255,136,0.15)' : 'none',
                  padding: '0',
                  overflow: 'hidden'
                }}
                onClick={() => setSelectedSeat(seat)}
              >
                <div style={{ 
                  height: '180px', 
                  backgroundImage: `url(${seat.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.3)' 
                  }}></div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', position: 'relative', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {seat.icon}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    background: 'rgba(0,0,0,0.6)', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {seat.label}
                  </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{seat.name}</h3>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.2rem' }}>{seat.hourlyRateXlm} XLM</span>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/hour</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {seat.tags.map(tag => <span key={tag} className="badge">{tag}</span>)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={14} /> {seat.specs.gpu}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} /> {seat.specs.ram}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Monitor size={14} /> {seat.specs.hz}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gamepad2 size={14} /> Gaming Kit</div>
                  </div>

                  <button 
                    style={{ width: '100%', background: selectedSeat?.id === seat.id ? 'var(--accent-gradient)' : 'var(--bg-card-hover)', color: selectedSeat?.id === seat.id ? '#000' : '#fff' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedSeat(seat); }}
                  >
                    {selectedSeat?.id === seat.id ? 'Selected' : 'Select This PC'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Panel */}
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Booking Summary</h2>
          
          {selectedSeat ? (
            <>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Selected Setup</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedSeat.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rate</span>
                  <span style={{ color: 'var(--primary-color)' }}>{selectedSeat.hourlyRateXlm} XLM/h</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Clock size={16} /> Select Duration
                </label>
                <select value={hours} onChange={e => setHours(Number(e.target.value))}>
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={5}>5 Hours</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total Due</span>
                  <span className="text-gradient">{selectedSeat.hourlyRateXlm * hours} XLM</span>
                </div>
              </div>

              {/* Status Checks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {!wallet && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4b4b', fontSize: '0.85rem' }}>
                    <AlertTriangle size={14} /> Connect Freighter first
                  </div>
                )}
                {wallet && !contractValid && (
                   <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', color: '#ff4b4b', fontSize: '0.85rem', padding: '0.8rem', background: 'rgba(255,75,75,0.1)', borderRadius: '8px', border: '1px solid rgba(255,75,75,0.2)' }}>
                    <Shield size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Contract ID missing</strong><br/>
                      Deploy the Soroban contract and set <code>VITE_CYBERSEAT_CONTRACT_ID</code> in .env.
                    </div>
                  </div>
                )}
                {wallet && contractValid && !cafeValid && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4b4b', fontSize: '0.85rem' }}>
                    <AlertTriangle size={14} /> Cafe wallet address is missing
                  </div>
                )}
                {wallet && contractValid && cafeValid && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={14} /> Ready for Soroban escrow
                  </div>
                )}
              </div>

              {errorMsg && (
                <div style={{ padding: '0.75rem', background: 'rgba(255, 75, 75, 0.1)', color: '#ff4b4b', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(255,75,75,0.2)' }}>
                  {errorMsg}
                </div>
              )}

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem' }}
                onClick={handleCreateBooking}
                disabled={loading || !wallet || !contractValid || !cafeValid}
              >
                {loading ? 'Processing...' : 'Create Booking with XLM Escrow'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Info size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Choose a gaming PC from the list to see booking details.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
