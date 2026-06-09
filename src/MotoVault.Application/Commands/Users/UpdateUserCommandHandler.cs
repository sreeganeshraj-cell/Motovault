using MediatR;
using MotoVault.Application.DTOs.Users;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.ValueObjects;

namespace MotoVault.Application.Commands.Users;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserResponse>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponse> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"User {request.Id} not found.");

        var contact = new ContactInfo(request.Phone, request.Email);
        user.UpdateProfile(request.Name, contact);

        await _userRepository.UpdateAsync(user);

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
