#[test_only]
module cotrain::training_rewards_test {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use cotrain::training_rewards;

    #[test(admin = @cotrain, creator = @0x123, participant1 = @0x456, participant2 = @0x789)]
    public fun test_create_training_session(
        admin: &signer,
        creator: &signer,
        participant1: &signer,
        participant2: &signer
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize AptosCoin for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&account::create_signer_for_test(@0x1));
        
        // Setup accounts with initial APT balance
        let creator_addr = signer::address_of(creator);
        account::create_account_for_test(creator_addr);
        coin::register<AptosCoin>(creator);
        
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        coin::register<AptosCoin>(admin);
        
        // Mint some coins for testing
        let coins = coin::mint<AptosCoin>(10000000, &mint_cap); // 0.1 APT
        coin::deposit(creator_addr, coins);
        
        // Initialize the training rewards module
        training_rewards::init_module(admin);
        
        // Create a training session
        let session_name = string::utf8(b"Test Training Session");
        let reward_amount = 1000000; // 0.01 APT
        
        training_rewards::create_training_session(
            creator,
            session_name,
            reward_amount
        );
        
        // Verify session was created
        let (id, name, session_creator, total_pool, remaining, participants, status, created_at) = 
            training_rewards::get_training_session(1);
        
        assert!(id == 1, 1);
        assert!(name == session_name, 2);
        assert!(session_creator == creator_addr, 3);
        assert!(total_pool == reward_amount, 4);
        assert!(remaining == reward_amount, 5);
        assert!(vector::length(&participants) == 0, 6);
        assert!(status == 1, 7); // STATUS_ACTIVE
        assert!(created_at > 0, 8);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @cotrain, creator = @0x123, participant1 = @0x456, participant2 = @0x789)]
    public fun test_participant_registration_and_contribution(
        admin: &signer,
        creator: &signer,
        participant1: &signer,
        participant2: &signer
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize AptosCoin for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&account::create_signer_for_test(@0x1));
        
        // Setup accounts
        let creator_addr = signer::address_of(creator);
        let participant1_addr = signer::address_of(participant1);
        let participant2_addr = signer::address_of(participant2);
        let admin_addr = signer::address_of(admin);
        
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(participant1_addr);
        account::create_account_for_test(participant2_addr);
        account::create_account_for_test(admin_addr);
        
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(participant1);
        coin::register<AptosCoin>(participant2);
        coin::register<AptosCoin>(admin);
        
        // Mint coins for creator
        let coins = coin::mint<AptosCoin>(10000000, &mint_cap);
        coin::deposit(creator_addr, coins);
        
        // Initialize module and create session
        training_rewards::init_module(admin);
        
        let session_name = string::utf8(b"Test Training Session");
        let reward_amount = 1000000;
        
        training_rewards::create_training_session(
            creator,
            session_name,
            reward_amount
        );
        
        // Register participants
        training_rewards::register_participant(participant1, 1);
        training_rewards::register_participant(participant2, 1);
        
        // Verify participants are registered
        let (_, _, _, _, _, participants, _, _) = training_rewards::get_training_session(1);
        assert!(vector::length(&participants) == 2, 1);
        assert!(vector::contains(&participants, &participant1_addr), 2);
        assert!(vector::contains(&participants, &participant2_addr), 3);
        
        // Submit contributions
        training_rewards::submit_contribution(admin, 1, participant1_addr, 100);
        training_rewards::submit_contribution(admin, 1, participant2_addr, 200);
        
        // Verify contribution scores
        let score1 = training_rewards::get_participant_score(1, participant1_addr);
        let score2 = training_rewards::get_participant_score(1, participant2_addr);
        
        assert!(score1 == 100, 4);
        assert!(score2 == 200, 5);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @cotrain, creator = @0x123, participant1 = @0x456, participant2 = @0x789)]
    public fun test_complete_session_and_reward_distribution(
        admin: &signer,
        creator: &signer,
        participant1: &signer,
        participant2: &signer
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize AptosCoin for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&account::create_signer_for_test(@0x1));
        
        // Setup accounts
        let creator_addr = signer::address_of(creator);
        let participant1_addr = signer::address_of(participant1);
        let participant2_addr = signer::address_of(participant2);
        let admin_addr = signer::address_of(admin);
        
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(participant1_addr);
        account::create_account_for_test(participant2_addr);
        account::create_account_for_test(admin_addr);
        
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(participant1);
        coin::register<AptosCoin>(participant2);
        coin::register<AptosCoin>(admin);
        
        // Mint coins for creator
        let coins = coin::mint<AptosCoin>(10000000, &mint_cap);
        coin::deposit(creator_addr, coins);
        
        // Initialize module and create session
        training_rewards::init_module(admin);
        
        let session_name = string::utf8(b"Test Training Session");
        let reward_amount = 300; // Simple amount for easy calculation
        
        training_rewards::create_training_session(
            creator,
            session_name,
            reward_amount
        );
        
        // Register participants and submit contributions
        training_rewards::register_participant(participant1, 1);
        training_rewards::register_participant(participant2, 1);
        
        training_rewards::submit_contribution(admin, 1, participant1_addr, 100); // 1/3 of total
        training_rewards::submit_contribution(admin, 1, participant2_addr, 200); // 2/3 of total
        
        // Get initial balances
        let initial_balance1 = coin::balance<AptosCoin>(participant1_addr);
        let initial_balance2 = coin::balance<AptosCoin>(participant2_addr);
        
        // Complete the session
        training_rewards::complete_training_session(admin, 1);
        
        // Verify rewards were distributed
        let final_balance1 = coin::balance<AptosCoin>(participant1_addr);
        let final_balance2 = coin::balance<AptosCoin>(participant2_addr);
        
        // Participant1 should get 100/300 * 300 = 100 tokens
        // Participant2 should get 200/300 * 300 = 200 tokens
        assert!(final_balance1 - initial_balance1 == 100, 1);
        assert!(final_balance2 - initial_balance2 == 200, 2);
        
        // Verify session status changed to completed
        let (_, _, _, _, _, _, status, _) = training_rewards::get_training_session(1);
        assert!(status == 2, 3); // STATUS_COMPLETED
        
        // Verify total rewards distributed
        let total_distributed = training_rewards::get_total_rewards_distributed();
        assert!(total_distributed == 300, 4);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @cotrain, creator = @0x123)]
    #[expected_failure(abort_code = 2)] // E_TRAINING_SESSION_NOT_FOUND
    public fun test_get_nonexistent_session(
        admin: &signer,
        creator: &signer
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize module
        training_rewards::init_module(admin);
        
        // Try to get a session that doesn't exist
        training_rewards::get_training_session(999);
    }

    #[test(admin = @cotrain, creator = @0x123, participant = @0x456)]
    #[expected_failure(abort_code = 6)] // E_PARTICIPANT_ALREADY_REGISTERED
    public fun test_duplicate_participant_registration(
        admin: &signer,
        creator: &signer,
        participant: &signer
    ) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize AptosCoin for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&account::create_signer_for_test(@0x1));
        
        // Setup accounts
        let creator_addr = signer::address_of(creator);
        let admin_addr = signer::address_of(admin);
        
        account::create_account_for_test(creator_addr);
        account::create_account_for_test(admin_addr);
        
        coin::register<AptosCoin>(creator);
        coin::register<AptosCoin>(admin);
        
        // Mint coins for creator
        let coins = coin::mint<AptosCoin>(10000000, &mint_cap);
        coin::deposit(creator_addr, coins);
        
        // Initialize module and create session
        training_rewards::init_module(admin);
        
        let session_name = string::utf8(b"Test Training Session");
        let reward_amount = 1000000;
        
        training_rewards::create_training_session(
            creator,
            session_name,
            reward_amount
        );
        
        // Register participant twice (should fail on second attempt)
        training_rewards::register_participant(participant, 1);
        training_rewards::register_participant(participant, 1); // This should fail
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}