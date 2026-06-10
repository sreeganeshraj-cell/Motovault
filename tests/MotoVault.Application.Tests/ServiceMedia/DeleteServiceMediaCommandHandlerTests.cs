using MotoVault.Application.Commands.ServiceMedia;
using MotoVault.Application.Interfaces;
using MotoVault.Application.Interfaces.Repositories;
using MotoVault.Domain.Enums;
using ServiceMedia = MotoVault.Domain.Entities.ServiceMedia;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace MotoVault.Application.Tests.ServiceMediaTests;

public class DeleteServiceMediaCommandHandlerTests
{
    private readonly IServiceMediaRepository _repo = Substitute.For<IServiceMediaRepository>();
    private readonly IFileService _fileService = Substitute.For<IFileService>();
    private readonly DeleteServiceMediaCommandHandler _handler;

    public DeleteServiceMediaCommandHandlerTests()
    {
        _handler = new DeleteServiceMediaCommandHandler(_repo, _fileService);
    }

    private static ServiceMedia BuildMedia() =>
        ServiceMedia.Create(Guid.NewGuid(), "/uploads/media/test.jpg", MediaType.Image);

    [Fact]
    public async Task Handle_WhenMediaExists_DeletesFileAndDbRecord()
    {
        var media = BuildMedia();
        _repo.GetByIdAsync(media.Id).Returns(media);

        await _handler.Handle(new DeleteServiceMediaCommand(media.Id), default);

        _fileService.Received(1).DeleteFile(media.FileUrl);
        await _repo.Received(1).DeleteAsync(media.Id);
    }

    [Fact]
    public async Task Handle_WhenFileDeletionThrows_StillDeletesDbRecord()
    {
        var media = BuildMedia();
        _repo.GetByIdAsync(media.Id).Returns(media);
        _fileService.When(f => f.DeleteFile(Arg.Any<string>())).Throw<IOException>();

        await _handler.Handle(new DeleteServiceMediaCommand(media.Id), default);

        await _repo.Received(1).DeleteAsync(media.Id);
    }

    [Fact]
    public async Task Handle_WhenMediaNotFound_ThrowsKeyNotFoundException()
    {
        _repo.GetByIdAsync(Arg.Any<Guid>()).Returns((ServiceMedia?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _handler.Handle(new DeleteServiceMediaCommand(Guid.NewGuid()), default));

        _fileService.DidNotReceive().DeleteFile(Arg.Any<string>());
        await _repo.DidNotReceive().DeleteAsync(Arg.Any<Guid>());
    }
}
