using LMS.Common.ViewModels.UserDashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.UserDashboard
{
    public interface IUserDashboardService
    {
        Task<UserDashboardViewModel> UserDashboard(string userId);
    }
}
