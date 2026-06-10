using Microsoft.AspNetCore.Hosting;
using MotoVault.Application.Interfaces;

namespace MotoVault.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;

    public FileService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public void DeleteFile(string relativePath)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var physicalPath = Path.Combine(webRoot, relativePath.TrimStart('/'));

        if (File.Exists(physicalPath))
            File.Delete(physicalPath);
    }
}
