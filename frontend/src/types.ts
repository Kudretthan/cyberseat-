export interface Seat {
  id: string;
  name: string;
  hourlyRateXlm: number;
  specs: {
    gpu: string;
    ram: string;
    hz: string;
    extra: string;
  };
  tags: string[];
  gradient: string;
  icon: React.ReactNode;
  label: string;
  image: string;
}

export interface Booking {
  id: string;
  chainBookingId: string;
  seatId: string;
  seatName: string;
  customerWallet: string;
  cafeWallet: string;
  hours: number;
  amountXlm: number;
  status: 'Locked' | 'Completed' | 'Refunded';
  createTxHash: string;
  completeTxHash?: string;
  refundTxHash?: string;
  createdAt: number;
}
