namespace MotoVault.Domain.ValueObjects;

public record DateRange
{
    public DateOnly Start { get; }
    public DateOnly? End { get; }

    public DateRange(DateOnly start, DateOnly? end = null)
    {
        if (end.HasValue && end.Value <= start)
            throw new ArgumentException("End date must be after start date.");

        Start = start;
        End = end;
    }

    public bool IsActive => End is null || End.Value >= DateOnly.FromDateTime(DateTime.UtcNow);

    public DateRange Close(DateOnly endDate) => new(Start, endDate);
}
