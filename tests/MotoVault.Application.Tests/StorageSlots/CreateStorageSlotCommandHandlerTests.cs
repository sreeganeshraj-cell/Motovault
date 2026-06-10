using MotoVault.Application.Commands.StorageSlots;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Enums;
using NSubstitute;

namespace MotoVault.Application.Tests.StorageSlots;

public class CreateStorageSlotCommandHandlerTests
{
    private readonly IStorageSlotRepository _repo = Substitute.For<IStorageSlotRepository>();
    private readonly CreateStorageSlotCommandHandler _handler;

    public CreateStorageSlotCommandHandlerTests()
    {
        _handler = new CreateStorageSlotCommandHandler(_repo);
    }

    [Fact]
    public async Task Handle_WhenBikeCapacityNotReached_CreatesSlot()
    {
        _repo.CountByTypeAsync(VehicleType.Bike).Returns(14);

        var result = await _handler.Handle(new CreateStorageSlotCommand(15, VehicleType.Bike), default);

        await _repo.Received(1).AddAsync(Arg.Any<Domain.Entities.StorageSlot>());
        Assert.Equal(VehicleType.Bike, result.Type);
    }

    [Fact]
    public async Task Handle_WhenCarCapacityNotReached_CreatesSlot()
    {
        _repo.CountByTypeAsync(VehicleType.Car).Returns(0);

        var result = await _handler.Handle(new CreateStorageSlotCommand(1, VehicleType.Car), default);

        await _repo.Received(1).AddAsync(Arg.Any<Domain.Entities.StorageSlot>());
        Assert.Equal(VehicleType.Car, result.Type);
    }

    [Fact]
    public async Task Handle_WhenBikeLimitReached_ThrowsInvalidOperationException()
    {
        _repo.CountByTypeAsync(VehicleType.Bike).Returns(15);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(new CreateStorageSlotCommand(16, VehicleType.Bike), default));

        Assert.Contains("15", ex.Message);
        Assert.Contains("Bike", ex.Message);
        await _repo.DidNotReceive().AddAsync(Arg.Any<Domain.Entities.StorageSlot>());
    }

    [Fact]
    public async Task Handle_WhenCarLimitReached_ThrowsInvalidOperationException()
    {
        _repo.CountByTypeAsync(VehicleType.Car).Returns(15);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(new CreateStorageSlotCommand(16, VehicleType.Car), default));

        Assert.Contains("15", ex.Message);
        Assert.Contains("Car", ex.Message);
        await _repo.DidNotReceive().AddAsync(Arg.Any<Domain.Entities.StorageSlot>());
    }

    [Fact]
    public async Task Handle_WhenExactlyAtLimit_ThrowsInvalidOperationException()
    {
        _repo.CountByTypeAsync(VehicleType.Bike).Returns(15);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(new CreateStorageSlotCommand(16, VehicleType.Bike), default));
    }

    [Fact]
    public async Task Handle_BikeAndCarLimitsAreIndependent()
    {
        // 15 Bikes at limit — but Cars should still be creatable
        _repo.CountByTypeAsync(VehicleType.Bike).Returns(15);
        _repo.CountByTypeAsync(VehicleType.Car).Returns(5);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(new CreateStorageSlotCommand(16, VehicleType.Bike), default));

        var result = await _handler.Handle(new CreateStorageSlotCommand(6, VehicleType.Car), default);
        Assert.Equal(VehicleType.Car, result.Type);
    }
}
