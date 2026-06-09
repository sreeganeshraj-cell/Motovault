using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MotoVault.Application.Interfaces;
using MotoVault.Domain.Entities;
using MotoVault.Domain.Enums;
using MotoVault.Domain.ValueObjects;
using MotoVault.Infrastructure.Persistence;

namespace MotoVault.Infrastructure.Services;

public class AdminSeeder
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger<AdminSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var adminExists = await _context.Users.AnyAsync(u => u.Role == Role.Admin);
        if (adminExists) return;

        var name = _configuration["AdminSeed:Name"] ?? "Admin";
        var email = _configuration["AdminSeed:Email"] ?? "admin@motovault.in";
        var password = _configuration["AdminSeed:Password"] ?? "Admin@123";

        var contact = new ContactInfo(null, email);
        var admin = User.Create(name, contact, Role.Admin);
        admin.SetPassword(_passwordHasher.Hash(password));

        _context.Users.Add(admin);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Admin account seeded: {Email}", email);
    }
}
