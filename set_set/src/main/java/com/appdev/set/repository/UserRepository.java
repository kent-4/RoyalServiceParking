package com.appdev.set.repository;

import com.appdev.set.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetToken(String token);
    long countByVerified(boolean verified);
    
    @Query("SELECT u FROM User u WHERE u.blocklisted = true AND (u.blocklistUntil IS NULL OR u.blocklistUntil > CURRENT_TIMESTAMP)")
    List<User> findByBlocklisted(boolean blocklisted);
}
