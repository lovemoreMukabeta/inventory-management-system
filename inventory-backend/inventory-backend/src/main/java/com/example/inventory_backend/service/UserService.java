package com.example.inventory_backend.service;

import com.example.inventory_backend.dto.UserDto;
import com.example.inventory_backend.entity.User;
import com.example.inventory_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<UserDto> getAllUsers() {
        return repo.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserDto createUser(User user) {
        User saved = repo.save(user);
        return convertToDto(saved);
    }

    public UserDto updateUser(Long id, User userDetails) {
        User user = repo.findById(id).orElseThrow();
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());
        user.setRole(userDetails.getRole());
        User updated = repo.save(user);
        return convertToDto(updated);
    }

    public void deleteUser(Long id) {
        repo.deleteById(id);
    }

    private UserDto convertToDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
