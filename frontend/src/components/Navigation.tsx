import { Gamepad2, List } from 'lucide-react';

interface NavigationProps {
  activeTab: 'book' | 'reservations';
  setActiveTab: (tab: 'book' | 'reservations') => void;
  reservationCount: number;
}

export default function Navigation({ activeTab, setActiveTab, reservationCount }: NavigationProps) {
  return (
    <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      <button 
        className={activeTab === 'book' ? 'btn-primary' : ''} 
        style={{ 
          background: activeTab === 'book' ? 'var(--accent-gradient)' : 'var(--bg-card)',
          color: activeTab === 'book' ? '#000' : 'var(--text-main)',
          padding: '0.8rem 1.5rem',
          border: activeTab === 'book' ? 'none' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        onClick={() => setActiveTab('book')}
      >
        <Gamepad2 size={18} /> Book a Seat
      </button>
      <button 
        className={activeTab === 'reservations' ? 'btn-primary' : ''} 
        style={{ 
          background: activeTab === 'reservations' ? 'var(--accent-gradient)' : 'var(--bg-card)',
          color: activeTab === 'reservations' ? '#000' : 'var(--text-main)',
          padding: '0.8rem 1.5rem',
          border: activeTab === 'reservations' ? 'none' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative'
        }}
        onClick={() => setActiveTab('reservations')}
      >
        <List size={18} /> Reservations
        {reservationCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-8px', 
            right: '-8px', 
            background: 'var(--primary-color)', 
            color: '#000', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,255,136,0.5)'
          }}>
            {reservationCount}
          </span>
        )}
      </button>
    </nav>
  );
}
