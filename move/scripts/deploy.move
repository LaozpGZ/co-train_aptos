script {
    use std::string;
    use cotrain::training_rewards;

    /// Deploy and initialize the training rewards system
    fun deploy_training_rewards(admin: &signer) {
        // The init_module function will be called automatically when the module is published
        // This script can be used for additional setup if needed
    }

    /// Create a sample training session for testing
    fun create_sample_session(creator: &signer) {
        let session_name = string::utf8(b"AI Model Training Session #1");
        let reward_amount = 1000000; // 0.01 APT (assuming 8 decimals)
        
        training_rewards::create_training_session(
            creator,
            session_name,
            reward_amount
        );
    }

    /// Register for a training session
    fun register_for_session(participant: &signer, session_id: u64) {
        training_rewards::register_participant(participant, session_id);
    }

    /// Submit contribution (admin only)
    fun submit_participant_contribution(
        admin: &signer,
        session_id: u64,
        participant: address,
        score: u64
    ) {
        training_rewards::submit_contribution(admin, session_id, participant, score);
    }

    /// Complete a training session and distribute rewards
    fun complete_session(admin: &signer, session_id: u64) {
        training_rewards::complete_training_session(admin, session_id);
    }
}