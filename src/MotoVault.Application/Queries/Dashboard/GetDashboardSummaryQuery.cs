using MediatR;
using MotoVault.Application.DTOs.Dashboard;

namespace MotoVault.Application.Queries.Dashboard;

public record GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>;
