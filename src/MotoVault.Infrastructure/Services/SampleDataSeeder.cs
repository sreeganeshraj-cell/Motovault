using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MotoVault.Application.Commands.Auth;
using MotoVault.Application.Commands.Packages;
using MotoVault.Application.Commands.ServiceLogs;
using MotoVault.Application.Commands.StorageSlots;
using MotoVault.Application.Commands.Subscriptions;
using MotoVault.Application.Commands.Vehicles;
using MotoVault.Domain.Enums;
using MotoVault.Infrastructure.Persistence;

namespace MotoVault.Infrastructure.Services;

public class SampleDataSeeder
{
    private readonly AppDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<SampleDataSeeder> _logger;

    public SampleDataSeeder(AppDbContext context, IMediator mediator, ILogger<SampleDataSeeder> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (await _context.Packages.AnyAsync())
        {
            _logger.LogDebug("Sample data already present — skipping.");
            return;
        }

        _logger.LogInformation("Seeding sample data…");

        try
        {
            await SeedCoreDataAsync();
            _logger.LogInformation("Sample data seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while seeding sample data.");
        }
    }

    private async Task SeedCoreDataAsync()
    {
        // ── packages ────────────────────────────────────────────────────────
        var basicCare = await _mediator.Send(new CreatePackageCommand(
            "Basic Care",
            "Monthly wash, tyre pressure check, battery inspection and visual report",
            2500m));

        var premiumCare = await _mediator.Send(new CreatePackageCommand(
            "Premium Care",
            "Full service: engine oil, air filter, brake check, plus everything in Basic Care",
            4500m));

        var eliteStorage = await _mediator.Send(new CreatePackageCommand(
            "Elite Storage",
            "Climate-controlled bay, 24/7 CCTV security, full premium service + insurance co-ordination",
            7000m));

        // ── storage slots ────────────────────────────────────────────────────
        var bikeSlots = new List<Guid>();
        for (int i = 1; i <= 10; i++)
        {
            var slot = await _mediator.Send(new CreateStorageSlotCommand(i, VehicleType.Bike));
            bikeSlots.Add(slot.Id);
        }

        var carSlots = new List<Guid>();
        for (int i = 1; i <= 5; i++)
        {
            var slot = await _mediator.Send(new CreateStorageSlotCommand(i, VehicleType.Car));
            carSlots.Add(slot.Id);
        }

        // ── owner users ──────────────────────────────────────────────────────
        var rajeshAuth = await _mediator.Send(new RegisterCommand("Rajesh Kumar",  "rajesh@motovault.in", "+91 98765 43210", "Owner@123"));
        var priyaAuth  = await _mediator.Send(new RegisterCommand("Priya Sharma",  "priya@motovault.in",  "+91 87654 32109", "Owner@123"));
        var arjunAuth  = await _mediator.Send(new RegisterCommand("Arjun Menon",   "arjun@motovault.in",  "+91 76543 21098", "Owner@123"));

        var rajeshId = rajeshAuth.UserId;
        var priyaId  = priyaAuth.UserId;
        var arjunId  = arjunAuth.UserId;

        // ── vehicles ─────────────────────────────────────────────────────────
        var honda    = await _mediator.Send(new CreateVehicleCommand(rajeshId, VehicleType.Bike, "Honda",    "CB500F",   "KA 01 AB 1234"));
        var vitz     = await _mediator.Send(new CreateVehicleCommand(rajeshId, VehicleType.Car,  "Toyota",   "Vitz",     "KA 02 CD 5678"));
        var yamaha   = await _mediator.Send(new CreateVehicleCommand(priyaId,  VehicleType.Bike, "Yamaha",   "MT-07",    "KA 03 EF 9012"));
        var subaru   = await _mediator.Send(new CreateVehicleCommand(arjunId,  VehicleType.Car,  "Subaru",   "Forester", "KA 04 GH 3456"));
        var kawasaki = await _mediator.Send(new CreateVehicleCommand(priyaId,  VehicleType.Bike, "Kawasaki", "Z900",     "KA 05 IJ 7890"));

        // ── subscriptions ────────────────────────────────────────────────────
        var today = DateOnly.FromDateTime(DateTime.Today);

        var start1 = today.AddMonths(-2);
        var start2 = today.AddMonths(-1);
        var start3 = today.AddMonths(-3);
        var start4 = today.AddDays(-15);
        var start5 = today.AddMonths(-1);

        var sub1 = await _mediator.Send(new CreateSubscriptionCommand(honda.Id,    basicCare.Id,    bikeSlots[0], start1, start1.AddMonths(1)));
        var sub2 = await _mediator.Send(new CreateSubscriptionCommand(vitz.Id,     premiumCare.Id,  carSlots[0],  start2, start2.AddMonths(1)));
        var sub3 = await _mediator.Send(new CreateSubscriptionCommand(yamaha.Id,   eliteStorage.Id, bikeSlots[1], start3, start3.AddMonths(1)));
        var sub4 = await _mediator.Send(new CreateSubscriptionCommand(subaru.Id,   basicCare.Id,    carSlots[1],  start4, start4.AddMonths(1)));
        var sub5 = await _mediator.Send(new CreateSubscriptionCommand(kawasaki.Id, premiumCare.Id,  bikeSlots[2], start5, start5.AddMonths(1)));

        // ── service logs (performed by admin) ────────────────────────────────
        var admin = await _context.Users.FirstAsync(u => u.Role == Role.Admin);

        await _mediator.Send(new CreateServiceLogCommand(honda.Id,    sub1.Id, today.AddDays(-5), ServiceType.Cleaning, "Full wash, polish and tyre clean",                           admin.Id));
        await _mediator.Send(new CreateServiceLogCommand(yamaha.Id,   sub3.Id, today.AddDays(-3), ServiceType.Service,  "Engine oil replaced, brake fluid topped up",                  admin.Id));
        await _mediator.Send(new CreateServiceLogCommand(vitz.Id,     sub2.Id, today.AddDays(-2), ServiceType.Idling,   "Engine idled 15 min, battery charge level verified",          admin.Id));
        await _mediator.Send(new CreateServiceLogCommand(kawasaki.Id, sub5.Id, today.AddDays(-1), ServiceType.Cleaning, "Pre-pickup quick wash and detail",                           admin.Id));
        await _mediator.Send(new CreateServiceLogCommand(subaru.Id,   sub4.Id, today,             ServiceType.Service,  "Tyre rotation and wiper blade replacement",                  admin.Id));
    }
}
