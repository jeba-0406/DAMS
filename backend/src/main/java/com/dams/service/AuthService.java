package com.dams.service;

import com.dams.dto.AuthDto;
import com.dams.entity.User;
import com.dams.exception.DuplicateResourceException;
import com.dams.repository.UserRepository;
import com.dams.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.EMPLOYEE)
                .department(request.getDepartment())
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved);
        log.info("User registered: {}", saved.getEmail());

        return buildAuthResponse(saved, token);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);
        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user, token);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user, String token) {
        return AuthDto.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "EMPLOYEE")
                .department(user.getDepartment())
                .build();
    }
}
