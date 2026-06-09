namespace MotoVault.Application.DTOs.Packages;

public class UpdatePackageRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public bool IsActive { get; set; }
}
