module cotrain::training_rewards {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::resource_account;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_TRAINING_SESSION_NOT_FOUND: u64 = 2;
    const E_TRAINING_SESSION_ALREADY_EXISTS: u64 = 3;
    const E_INSUFFICIENT_REWARDS: u64 = 4;
    const E_TRAINING_SESSION_NOT_ACTIVE: u64 = 5;
    const E_PARTICIPANT_ALREADY_REGISTERED: u64 = 6;
    const E_PARTICIPANT_NOT_FOUND: u64 = 7;
    const E_INVALID_CONTRIBUTION_SCORE: u64 = 8;

    /// Training session status
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    /// Training session structure
    struct TrainingSession has store, copy, drop {
        id: u64,
        name: String,
        creator: address,
        total_reward_pool: u64,
        remaining_rewards: u64,
        participants: vector<address>,
        participant_scores: Table<address, u64>,
        status: u8,
        created_at: u64,
        completed_at: Option<u64>,
    }

    /// Participant contribution record
    struct ParticipantContribution has store, copy, drop {
        participant: address,
        session_id: u64,
        contribution_score: u64,
        reward_earned: u64,
        timestamp: u64,
    }

    /// Global training rewards state
    struct TrainingRewardsState has key {
        admin: address,
        next_session_id: u64,
        active_sessions: Table<u64, TrainingSession>,
        completed_sessions: Table<u64, TrainingSession>,
        total_rewards_distributed: u64,
        session_created_events: EventHandle<SessionCreatedEvent>,
        reward_distributed_events: EventHandle<RewardDistributedEvent>,
        session_completed_events: EventHandle<SessionCompletedEvent>,
    }

    /// Events
    struct SessionCreatedEvent has drop, store {
        session_id: u64,
        creator: address,
        name: String,
        reward_pool: u64,
        timestamp: u64,
    }

    struct RewardDistributedEvent has drop, store {
        session_id: u64,
        participant: address,
        contribution_score: u64,
        reward_amount: u64,
        timestamp: u64,
    }

    struct SessionCompletedEvent has drop, store {
        session_id: u64,
        total_participants: u64,
        total_rewards_distributed: u64,
        timestamp: u64,
    }

    /// Initialize the training rewards system
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, TrainingRewardsState {
            admin: admin_addr,
            next_session_id: 1,
            active_sessions: table::new(),
            completed_sessions: table::new(),
            total_rewards_distributed: 0,
            session_created_events: account::new_event_handle<SessionCreatedEvent>(admin),
            reward_distributed_events: account::new_event_handle<RewardDistributedEvent>(admin),
            session_completed_events: account::new_event_handle<SessionCompletedEvent>(admin),
        });
    }

    /// Create a new training session
    public entry fun create_training_session(
        creator: &signer,
        name: String,
        reward_amount: u64,
    ) acquires TrainingRewardsState {
        let creator_addr = signer::address_of(creator);
        let state = borrow_global_mut<TrainingRewardsState>(@cotrain);
        
        // Transfer reward tokens to the contract
        let reward_coins = coin::withdraw<AptosCoin>(creator, reward_amount);
        coin::deposit(@cotrain, reward_coins);
        
        let session_id = state.next_session_id;
        let session = TrainingSession {
            id: session_id,
            name,
            creator: creator_addr,
            total_reward_pool: reward_amount,
            remaining_rewards: reward_amount,
            participants: vector::empty(),
            participant_scores: table::new(),
            status: STATUS_ACTIVE,
            created_at: timestamp::now_seconds(),
            completed_at: option::none(),
        };
        
        table::add(&mut state.active_sessions, session_id, session);
        state.next_session_id = session_id + 1;
        
        // Emit event
        event::emit_event(&mut state.session_created_events, SessionCreatedEvent {
            session_id,
            creator: creator_addr,
            name,
            reward_pool: reward_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Register a participant for a training session
    public entry fun register_participant(
        participant: &signer,
        session_id: u64,
    ) acquires TrainingRewardsState {
        let participant_addr = signer::address_of(participant);
        let state = borrow_global_mut<TrainingRewardsState>(@cotrain);
        
        assert!(table::contains(&state.active_sessions, session_id), E_TRAINING_SESSION_NOT_FOUND);
        
        let session = table::borrow_mut(&mut state.active_sessions, session_id);
        assert!(session.status == STATUS_ACTIVE, E_TRAINING_SESSION_NOT_ACTIVE);
        assert!(!vector::contains(&session.participants, &participant_addr), E_PARTICIPANT_ALREADY_REGISTERED);
        
        vector::push_back(&mut session.participants, participant_addr);
        table::add(&mut session.participant_scores, participant_addr, 0);
    }

    /// Submit contribution score for a participant
    public entry fun submit_contribution(
        admin: &signer,
        session_id: u64,
        participant: address,
        contribution_score: u64,
    ) acquires TrainingRewardsState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<TrainingRewardsState>(@cotrain);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(table::contains(&state.active_sessions, session_id), E_TRAINING_SESSION_NOT_FOUND);
        assert!(contribution_score > 0, E_INVALID_CONTRIBUTION_SCORE);
        
        let session = table::borrow_mut(&mut state.active_sessions, session_id);
        assert!(session.status == STATUS_ACTIVE, E_TRAINING_SESSION_NOT_ACTIVE);
        assert!(vector::contains(&session.participants, &participant), E_PARTICIPANT_NOT_FOUND);
        
        // Update participant's contribution score
        let current_score = table::borrow_mut(&mut session.participant_scores, participant);
        *current_score = *current_score + contribution_score;
    }

    /// Complete training session and distribute rewards
    public entry fun complete_training_session(
        admin: &signer,
        session_id: u64,
    ) acquires TrainingRewardsState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<TrainingRewardsState>(@cotrain);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(table::contains(&state.active_sessions, session_id), E_TRAINING_SESSION_NOT_FOUND);
        
        let session = table::remove(&mut state.active_sessions, session_id);
        assert!(session.status == STATUS_ACTIVE, E_TRAINING_SESSION_NOT_ACTIVE);
        
        // Calculate total contribution scores
        let total_score = 0u64;
        let i = 0;
        let participants_len = vector::length(&session.participants);
        
        while (i < participants_len) {
            let participant = *vector::borrow(&session.participants, i);
            let score = *table::borrow(&session.participant_scores, participant);
            total_score = total_score + score;
            i = i + 1;
        };
        
        // Distribute rewards proportionally
        if (total_score > 0) {
            i = 0;
            while (i < participants_len) {
                let participant = *vector::borrow(&session.participants, i);
                let score = *table::borrow(&session.participant_scores, participant);
                
                if (score > 0) {
                    let reward_amount = (session.total_reward_pool * score) / total_score;
                    
                    // Transfer reward to participant
                    let reward_coins = coin::withdraw<AptosCoin>(&resource_account::retrieve_resource_account_cap(@cotrain, b"cotrain"), reward_amount);
                    coin::deposit(participant, reward_coins);
                    
                    state.total_rewards_distributed = state.total_rewards_distributed + reward_amount;
                    
                    // Emit reward distributed event
                    event::emit_event(&mut state.reward_distributed_events, RewardDistributedEvent {
                        session_id,
                        participant,
                        contribution_score: score,
                        reward_amount,
                        timestamp: timestamp::now_seconds(),
                    });
                };
                
                i = i + 1;
            };
        };
        
        // Update session status and move to completed sessions
        let mut completed_session = session;
        completed_session.status = STATUS_COMPLETED;
        completed_session.completed_at = option::some(timestamp::now_seconds());
        
        table::add(&mut state.completed_sessions, session_id, completed_session);
        
        // Emit session completed event
        event::emit_event(&mut state.session_completed_events, SessionCompletedEvent {
            session_id,
            total_participants: participants_len,
            total_rewards_distributed: session.total_reward_pool,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get training session details
    #[view]
    public fun get_training_session(session_id: u64): (u64, String, address, u64, u64, vector<address>, u8, u64) acquires TrainingRewardsState {
        let state = borrow_global<TrainingRewardsState>(@cotrain);
        
        if (table::contains(&state.active_sessions, session_id)) {
            let session = table::borrow(&state.active_sessions, session_id);
            (session.id, session.name, session.creator, session.total_reward_pool, 
             session.remaining_rewards, session.participants, session.status, session.created_at)
        } else if (table::contains(&state.completed_sessions, session_id)) {
            let session = table::borrow(&state.completed_sessions, session_id);
            (session.id, session.name, session.creator, session.total_reward_pool, 
             session.remaining_rewards, session.participants, session.status, session.created_at)
        } else {
            abort E_TRAINING_SESSION_NOT_FOUND
        }
    }

    /// Get participant's contribution score
    #[view]
    public fun get_participant_score(session_id: u64, participant: address): u64 acquires TrainingRewardsState {
        let state = borrow_global<TrainingRewardsState>(@cotrain);
        
        if (table::contains(&state.active_sessions, session_id)) {
            let session = table::borrow(&state.active_sessions, session_id);
            if (table::contains(&session.participant_scores, participant)) {
                *table::borrow(&session.participant_scores, participant)
            } else {
                0
            }
        } else {
            abort E_TRAINING_SESSION_NOT_FOUND
        }
    }

    /// Get total rewards distributed
    #[view]
    public fun get_total_rewards_distributed(): u64 acquires TrainingRewardsState {
        let state = borrow_global<TrainingRewardsState>(@cotrain);
        state.total_rewards_distributed
    }
}