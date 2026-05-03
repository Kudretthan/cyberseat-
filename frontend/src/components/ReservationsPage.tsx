import type { Booking } from '../types';
import { Shield, Zap, ExternalLink, CheckCircle2, User, Coffee } from 'lucide-react';

interface ReservationsPageProps {
  bookings: Booking[];
  loading: boolean;
  handleComplete: (booking: Booking) => void;
  handleCancel: (booking: Booking) => void;
  connectedWallet: string;
}

export default function ReservationsPage({ bookings, loading, handleComplete, handleCancel, connectedWallet }: ReservationsPageProps) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={24} /> Active Reservations
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Track your locked, completed and refunded gaming seat bookings.
      </p>
      
      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Shield size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
          <h3>No reservations yet.</h3>
          <p>Create your first escrow-backed gaming seat booking.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {bookings.map(booking => {
            const isCustomer = connectedWallet === booking.customerWallet;
            const isCafe = connectedWallet === booking.cafeWallet;

            return (
              <div key={booking.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${booking.status === 'Locked' ? '#ffc107' : booking.status === 'Completed' ? 'var(--primary-color)' : '#ff4b4b'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: booking.status === 'Locked' ? '#ffc107' : 'var(--primary-color)'
                  }}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ margin: 0 }}>{booking.seatName}</h3>
                      <span className={`badge badge-status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {booking.customerWallet.slice(0, 4)}...{booking.customerWallet.slice(-4)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Coffee size={12} /> {booking.cafeWallet.slice(0, 4)}...{booking.cafeWallet.slice(-4)}</span>
                      <span><strong>Duration:</strong> {booking.hours}h</span>
                      <span><strong>Total:</strong> <span style={{color: 'var(--primary-color)'}}>{booking.amountXlm} XLM</span></span>
                      <span>
                        <strong>ID:</strong> #{booking.chainBookingId} 
                        <a href={`https://stellar.expert/explorer/testnet/tx/${booking.createTxHash}`} target="_blank" rel="noreferrer" style={{ marginLeft: '6px' }}>
                          <ExternalLink size={12} />
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                {booking.status === 'Locked' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        className="btn-success" 
                        onClick={() => handleComplete(booking)} 
                        disabled={loading || !isCafe} 
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', opacity: isCafe ? 1 : 0.5 }}
                      >
                        Complete Session & Pay
                      </button>
                      <button 
                        className="btn-danger" 
                        onClick={() => handleCancel(booking)} 
                        disabled={loading || !isCustomer} 
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', opacity: isCustomer ? 1 : 0.5 }}
                      >
                        Cancel & Refund
                      </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      {isCafe && "Cafe wallet signs this action and receives the escrowed payment."}
                      {isCustomer && "Customer wallet signs this action and receives a refund."}
                      {!isCafe && !isCustomer && "Switch to either Customer or Cafe wallet to manage."}
                    </div>
                  </div>
                )}
                {(booking.status === 'Completed' || booking.status === 'Refunded') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} color={booking.status === 'Completed' ? 'var(--primary-color)' : '#ff4b4b'} />
                    <span>
                      {booking.status === 'Completed' ? 'Payment released to Cafe' : 'XLM refunded to your wallet'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
