package com.appdev.set.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.AuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, 
                                                  UserDetailsService userDetailsService) throws Exception {
        
        AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        
        // Configure database authentication for regular users
        authManagerBuilder.userDetailsService(userDetailsService)
                          .passwordEncoder(passwordEncoder());

        // Add fixed admin user with credentials: admin/admin123
        authManagerBuilder.inMemoryAuthentication()
                          .withUser("admin")
                          .password(passwordEncoder().encode("admin123"))
                          .roles("ADMIN");

        // Add fixed cashier user with credentials: cashier/cashier123
        authManagerBuilder.inMemoryAuthentication()
                          .withUser("cashier")
                          .password(passwordEncoder().encode("cashier123"))
                          .roles("CASHIER");

        http
             .csrf(csrf -> csrf.disable())
             .authorizeHttpRequests(authorize -> authorize
                 .requestMatchers("/", "/login", "/register", "/verify", "/forgot-password", "/reset-password", 
                                 "/css/**", "/js/**", "/images/**", "/styles/**", "/scripts/**", "/static/**",
                                 "/login-error", "/reset-success", "/forgot-password-confirmation").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                 .requestMatchers("/login-user").permitAll()
                 .requestMatchers("/login-cashier").permitAll()
                 .requestMatchers("/login-admin").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/cashier/**").hasRole("CASHIER")
                .requestMatchers("/api/profile/**", "/api/user/**").hasRole("USER")
                .requestMatchers("/api/parking-rates/current").hasAnyRole("USER", "CASHIER", "ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/cashier/**").hasRole("CASHIER")
                .requestMatchers("/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> {
                    String role = authentication.getAuthorities().stream()
                            .findFirst()
                            .map(authority -> authority.getAuthority())
                            .orElse("");
                    
                    // Redirect based on role
                    try {
                        if ("ROLE_ADMIN".equals(role)) {
                            response.sendRedirect(request.getContextPath() + "/admin/dashboard");
                        } else if ("ROLE_CASHIER".equals(role)) {
                            response.sendRedirect(request.getContextPath() + "/cashier/dashboard");
                        } else if ("ROLE_USER".equals(role)) {
                            response.sendRedirect(request.getContextPath() + "/user/dashboard");
                        } else {
                            response.sendRedirect(request.getContextPath() + "/");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                })
                .failureHandler((request, response, exception) -> {
                    response.sendRedirect(request.getContextPath() + "/login?error=true");
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendRedirect(request.getContextPath() + "/login");
                })
            );
        
        return http.build();
    }
}
