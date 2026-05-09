package com.appdev.set.config;

import com.appdev.set.model.User;
import com.appdev.set.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Skip database lookup for the fixed admin user
        if ("admin".equals(username)) {
            // This will be handled by inMemoryAuthentication
            throw new UsernameNotFoundException("Admin user is handled separately");
        }

        // For regular users, look up in the database by email
        Optional<User> userOpt = userRepository.findByEmail(username);

        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        User user = userOpt.get();

        if (!user.isVerified()) {
            throw new UsernameNotFoundException("Please verify your email before logging in");
        }

        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
