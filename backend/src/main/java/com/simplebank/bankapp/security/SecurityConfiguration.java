package com.simplebank.bankapp.security;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import tools.jackson.databind.json.JsonMapper;
import com.simplebank.bankapp.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                     AuthenticationProvider authenticationProvider,
                                                     JwtAuthenticationFilter jwtAuthFilter,
                                                     CorsConfigurationSource corsConfigurationSource,
                                                     JsonMapper objectMapper) throws Exception {
        http
            // CORS must be configured here, not just via @CrossOrigin on controllers -
            // Spring Security's filter chain runs before controller code, so without
            // this the frontend's cross-origin requests (including preflight OPTIONS
            // requests) would get rejected before they ever reach a controller.
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Stateless JWTs do not need CSRF protection.
            .csrf(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth -> auth
                // Preflight requests never carry an Authorization header - always allow them.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public: registering and logging in don't require a token yet.
                .requestMatchers("/api/auth/**").permitAll()
                // Admin-only: requires a valid JWT AND the ADMIN role.
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Everything else under /api/** requires a valid JWT (any role).
                .anyRequest().authenticated()
            )

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authenticationProvider(authenticationProvider)

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // Without this, a rejected request gets Spring Security's default blank
            // 403 page. This returns the same ErrorResponse shape ({timestamp, message})
            // used everywhere else in the API, for both "no/invalid token" and
            // "valid token but wrong role" cases.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                        writeForbidden(response, objectMapper))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                        writeForbidden(response, objectMapper))
            );

        return http.build();
    }

    private static void writeForbidden(HttpServletResponse response, JsonMapper objectMapper) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(new ErrorResponse("Access Forbidden")));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
