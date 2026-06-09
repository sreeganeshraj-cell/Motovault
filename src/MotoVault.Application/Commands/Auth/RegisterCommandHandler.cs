using MediatR;
using MotoVault.Application.DTOs.Auth;
using MotoVault.Application.Interfaces;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.Enums;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing is not null)
            throw new InvalidOperationException("An account with this email already exists.");

        var contact = new ContactInfo(request.Phone, request.Email);
        var user = User.Create(request.Name, contact, Role.Owner);
        user.SetPassword(_passwordHasher.Hash(request.Password));

        await _userRepository.AddAsync(user);

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Name = user.Name,
            Role = user.Role.ToString(),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
    }
}
