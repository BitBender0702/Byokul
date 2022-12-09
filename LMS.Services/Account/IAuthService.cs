using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Account;
using LMS.Data.Entity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Account
{
    public interface IAuthService
    {
        Task<string> AuthenticateUser(LoginViewModel loginViewModel);
        Task<string> GenerateJSONWebToken(User userInfo);
        Task<bool> GeneratePasswordResetRequest(ForgetPasswordViewModel resetPasswordRequestViewModel);
        Task<IdentityResult> UpdatePassword(UpdatePasswordViewModel updatePasswordViewModel);
        Task Logout();
        Task<string> ResetPassword(ResetPasswordViewModel resetPasswordDto);
        bool SendEmail(List<string> to, List<string> cc, List<string> bcc, string subject, string body);
    }
}
