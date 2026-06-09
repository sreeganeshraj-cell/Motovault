using MediatR;
using MotoVault.Application.DTOs.Users;
using MotoVault.Application.Interfaces;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Entities;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Users;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public CreateUserCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserResponse> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var contact = new ContactInfo(request.Phone, request.Email);
        var user = User.Create(request.Name, contact, request.Role);
        user.SetPassword(_passwordHasher.Hash(request.Password));

        await _userRepository.AddAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Contact.Phone,
            Email = user.Contact.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}
