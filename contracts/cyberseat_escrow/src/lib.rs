#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    InvalidHours = 4,
    BookingNotFound = 5,
    BookingNotLocked = 6,
}

#[contracttype]
#[derive(Clone, Debug)]
pub enum DataKey {
    Admin,
    XlmToken,
    BookingCount,
    Booking(u64),
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Booking {
    pub id: u64,
    pub customer: Address,
    pub cafe: Address,
    pub amount: i128,
    pub seat_code: u32,
    pub hours: u32,
    pub status: u32, // 0: Locked, 1: Completed, 2: Refunded
}

#[contract]
pub struct CyberSeatEscrow;

#[contractimpl]
impl CyberSeatEscrow {
    pub fn init(env: Env, admin: Address, xlm_token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::BookingCount, &0u64);
        Ok(())
    }

    pub fn create_booking(
        env: Env,
        customer: Address,
        cafe: Address,
        amount: i128,
        seat_code: u32,
        hours: u32,
    ) -> Result<u64, Error> {
        customer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if hours == 0 {
            return Err(Error::InvalidHours);
        }

        let xlm_token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::XlmToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &xlm_token_addr);
        
        // Transfer XLM from customer to contract escrow
        token_client.transfer(&customer, &env.current_contract_address(), &amount);

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BookingCount)
            .unwrap_or(0);
        
        count += 1;
        env.storage().instance().set(&DataKey::BookingCount, &count);

        let booking = Booking {
            id: count,
            customer,
            cafe,
            amount,
            seat_code,
            hours,
            status: 0, // Locked
        };

        env.storage()
            .persistent()
            .set(&DataKey::Booking(count), &booking);

        Ok(count)
    }

    pub fn complete_booking(env: Env, booking_id: u64) -> Result<(), Error> {
        let mut booking: Booking = env
            .storage()
            .persistent()
            .get(&DataKey::Booking(booking_id))
            .ok_or(Error::BookingNotFound)?;

        if booking.status != 0 {
            return Err(Error::BookingNotLocked);
        }

        // Only the CAFE wallet can complete the booking and receive funds
        booking.cafe.require_auth();

        let xlm_token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::XlmToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &xlm_token_addr);
        
        // Transfer XLM from contract to cafe
        token_client.transfer(&env.current_contract_address(), &booking.cafe, &booking.amount);

        booking.status = 1; // Completed
        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);
        
        Ok(())
    }

    pub fn cancel_booking(env: Env, booking_id: u64) -> Result<(), Error> {
        let mut booking: Booking = env
            .storage()
            .persistent()
            .get(&DataKey::Booking(booking_id))
            .ok_or(Error::BookingNotFound)?;

        if booking.status != 0 {
            return Err(Error::BookingNotLocked);
        }

        // Only the CUSTOMER wallet can cancel and receive refund
        booking.customer.require_auth();

        let xlm_token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::XlmToken)
            .ok_or(Error::NotInitialized)?;

        let token_client = token::Client::new(&env, &xlm_token_addr);
        
        // Transfer XLM from contract back to customer
        token_client.transfer(&env.current_contract_address(), &booking.customer, &booking.amount);

        booking.status = 2; // Refunded
        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);
        
        Ok(())
    }

    pub fn get_booking(env: Env, booking_id: u64) -> Result<Booking, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Booking(booking_id))
            .ok_or(Error::BookingNotFound)
    }

    pub fn get_booking_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::BookingCount)
            .unwrap_or(0)
    }
}
