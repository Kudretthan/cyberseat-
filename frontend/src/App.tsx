import { useState, useEffect } from 'react';
import { connectWallet, getNetwork } from './lib/freighter';
import { createBookingEscrow, completeBooking, cancelBooking } from './lib/soroban';
import { ENV, isContractIdValid, isCafeWalletValid } from './lib/env';
import { 
  Monitor, Gamepad2, Wallet, Zap, Trophy, Mic2, CheckCircle2 
} from 'lucide-react';

import type { Seat, Booking } from './types';
import Navigation from './components/Navigation';
import BookingPage from './components/BookingPage';
import ReservationsPage from './components/ReservationsPage';

const SEATS: Seat[] = [
  {
    id: 'seat-1',
    name: 'Standart Masa',
    hourlyRateXlm: 1,
    specs: {
      gpu: 'GTX 1660',
      ram: '16 GB RAM',
      hz: '144 Hz Monitor',
      extra: 'Standard Chair'
    },
    tags: ['Casual Gaming', 'Budget'],
    gradient: 'linear-gradient(135deg, #2c3e50, #27ae60)',
    icon: <Monitor size={48} />,
    label: 'Budget Gaming',
    image: '/pcs/standard.jpg'
  },
  {
    id: 'seat-2',
    name: 'Pro Oyuncu Masası',
    hourlyRateXlm: 2,
    specs: {
      gpu: 'RTX 3060',
      ram: '32 GB RAM',
      hz: '240 Hz Monitor',
      extra: 'Mechanical Keyboard'
    },
    tags: ['FPS', 'Competitive'],
    gradient: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    icon: <Gamepad2 size={48} />,
    label: 'Competitive FPS',
    image: '/pcs/pro.jpg'
  },
  {
    id: 'seat-3',
    name: 'VIP Yayıncı Odası',
    hourlyRateXlm: 4,
    specs: {
      gpu: 'RTX 4070',
      ram: '32 GB RAM',
      hz: 'Dual Monitor',
      extra: 'Streaming Mic & Webcam'
    },
    tags: ['Streaming', 'VIP'],
    gradient: 'linear-gradient(135deg, #6a11cb, #2575fc)',
    icon: <Mic2 size={48} />,
    label: 'Streaming Room',
    image: '/pcs/streaming.jpg'
  },
  {
    id: 'seat-4',
    name: 'Turnuva Masası',
    hourlyRateXlm: 3,
    specs: {
      gpu: 'RTX 3070',
      ram: '32 GB RAM',
      hz: '240 Hz Monitor',
      extra: 'Low Latency Network'
    },
    tags: ['Esports', 'Team Play'],
    gradient: 'linear-gradient(135deg, #f12711, #f5af19)',
    icon: <Trophy size={48} />,
    label: 'Esports Setup',
    image: '/pcs/esports.jpg'
  }
];

function App() {
  const [wallet, setWallet] = useState<string>('');
  const [network, setNetwork] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'book' | 'reservations'>('book');
  
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [hours, setHours] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('cyberseat_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const contractValid = isContractIdValid();
  const cafeValid = isCafeWalletValid();

  useEffect(() => {
    localStorage.setItem('cyberseat_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleConnect = async () => {
    const pk = await connectWallet();
    if (pk) {
      setWallet(pk);
      const net = await getNetwork();
      setNetwork(net);
    }
  };

  const handleCreateBooking = async () => {
    if (!wallet) return setErrorMsg("Lütfen önce cüzdanınızı bağlayın.");
    if (!selectedSeat) return;
    if (!contractValid) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const amount = selectedSeat.hourlyRateXlm * hours;
      const res = await createBookingEscrow(wallet, ENV.CAFE_WALLET_ADDRESS!, amount, selectedSeat.id, hours);
      
      const newBooking: Booking = {
        id: Math.random().toString(36).substring(7),
        chainBookingId: res.contractBookingId,
        seatId: selectedSeat.id,
        seatName: selectedSeat.name,
        customerWallet: wallet,
        cafeWallet: ENV.CAFE_WALLET_ADDRESS!,
        hours,
        amountXlm: amount,
        status: 'Locked',
        createTxHash: res.hash,
        createdAt: Date.now()
      };

      setBookings(prev => [newBooking, ...prev]);
      setSelectedSeat(null);
      setHours(1);
      setSuccessMsg("Booking locked. Cafe wallet can complete, customer wallet can refund.");
      setActiveTab('reservations'); // Switch to reservations on success
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Rezervasyon oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (booking: Booking) => {
    if (!wallet) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await completeBooking(wallet, booking.chainBookingId);
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, status: 'Completed', completeTxHash: res.hash }
          : b
      ));
      setSuccessMsg("Payment released to cafe wallet.");
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'İşlem tamamlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (!wallet) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await cancelBooking(wallet, booking.chainBookingId);
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, status: 'Refunded', refundTxHash: res.hash }
          : b
      ));
      setSuccessMsg("Payment refunded to customer wallet.");
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'İşlem iptal edilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header & Wallet Bar */}
      <header className="header">
        <div className="logo" onClick={() => setActiveTab('book')} style={{ cursor: 'pointer' }}>CyberSeat</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            reservationCount={bookings.filter(b => b.status === 'Locked').length} 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {wallet ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {network === 'TESTNET' && (
                  <div className="badge" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
                    <Zap size={12} style={{ marginRight: '4px' }} /> Testnet
                  </div>
                )}
                <div style={{ background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wallet size={16} color="var(--primary-color)" />
                  <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}
                  </span>
                </div>
              </div>
            ) : (
              <button className="btn-primary" onClick={handleConnect}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ minHeight: '80vh' }}>
        {successMsg && (
          <div className="glass-panel" style={{ 
            background: 'rgba(0, 255, 136, 0.1)', 
            border: '1px solid var(--primary-color)', 
            color: 'var(--primary-color)', 
            padding: '1rem', 
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <CheckCircle2 size={20} />
            {successMsg}
          </div>
        )}
        {activeTab === 'book' ? (
          <BookingPage 
            contractValid={contractValid}
            cafeValid={cafeValid}
            wallet={wallet}
            selectedSeat={selectedSeat}
            setSelectedSeat={setSelectedSeat}
            hours={hours}
            setHours={setHours}
            loading={loading}
            errorMsg={errorMsg}
            handleCreateBooking={handleCreateBooking}
            seats={SEATS}
          />
        ) : (
          <ReservationsPage 
            bookings={bookings}
            loading={loading}
            handleComplete={handleComplete}
            handleCancel={handleCancel}
            connectedWallet={wallet}
          />
        )}
      </main>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© 2026 CyberSeat - Escrow-backed Internet Cafe Reservations</p>
      </footer>
    </div>
  );
}

export default App;
