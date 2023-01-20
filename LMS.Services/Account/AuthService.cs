using LMS.Common.ViewModels;
using LMS.Common.ViewModels.Account;
using LMS.Data;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using LMS.Services.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using LMS.Common.ViewModels.Post;

namespace LMS.Services.Account
{
    public class AuthService : IAuthService
    {
        private IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly DataContext _context;
        private readonly ICommonService _commonService;

        public AuthService(IConfiguration config, IWebHostEnvironment webHostEnvironment, SignInManager<User> signInManager, UserManager<User> userManager, DataContext context, ICommonService commonService)
        {
            _config = config;
            _webHostEnvironment = webHostEnvironment;
            _signInManager = signInManager;
            _userManager = userManager;
            _context = context;
            _commonService = commonService;
        }

        public async Task<string> AuthenticateUser(LoginViewModel loginViewModel)
        {
            var user = await _userManager.FindByNameAsync(loginViewModel.Email);
            if (user != null)
            {
                var result = await _signInManager.PasswordSignInAsync(loginViewModel.Email, loginViewModel.Password, false, false);
                if (result.Succeeded && !result.IsNotAllowed)
                {
                    var token = await GenerateJSONWebToken(user);
                    return token;
                }
                if(!result.Succeeded && result.IsNotAllowed)
                {
                    return Constants.EmailNotConfirmed;
                }
            }
            return Constants.UserNotFound;
        }

        public async Task<string> GenerateJSONWebToken(User userInfo)
        {

            var roles = await _userManager.GetRolesAsync(userInfo);
            var claims = new List<Claim>
            {
            new Claim(JwtRegisteredClaimNames.Sub, userInfo.Email),
            new Claim(JwtRegisteredClaimNames.Jti, userInfo.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, userInfo.UserName),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            claims.Add(new Claim("isBan",userInfo.IsBan.ToString()));

            var identity = new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Audience"],
              identity.Claims,
              expires: DateTime.Now.AddMinutes(120),
              signingCredentials: credentials);


            var result = new JwtSecurityTokenHandler().WriteToken(token);
            return result;
        }

        public async Task<bool> GeneratePasswordResetRequest(ForgetPasswordViewModel forgetPasswordViewModel)
        {
            var user = await _userManager.FindByEmailAsync(forgetPasswordViewModel.Email);
            if (user == null)
                return false;

            user.UniqueToken = String.Format("{0}-{1}", Guid.NewGuid(), Guid.NewGuid());
            user.TokenCreatedOn = DateTime.UtcNow;
            user.ResetTokenExirationTime = DateTime.UtcNow.AddHours(3);

            var response = await _userManager.UpdateAsync(user);
            if (response.Succeeded)
                return await TriggerResetPasswordEmail(forgetPasswordViewModel.Email, user.UniqueToken,user);

            return false;
        }

        private async Task<bool> TriggerResetPasswordEmail(string email, string token,User user)
        {
            string callBackUrl = string.Format(_config["ForgotPasswordCallback"], token);

            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/forgot-password.html");
            var imagePath = Path.Combine(path, "Email/images/icon_instagram.png");

            var text = System.IO.File.ReadAllText(filePath);
            text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
            text = text.Replace("[ACTIVATIONLINK]", callBackUrl);
            text = text.Replace("*#FirstName#*", email);

            await _commonService.SendEmail(new List<string> { email }, null, null, subject: "Reset Your Password", body: text);
            //SendEmail(new List<string> { email }, null, null, subject: "Forgot password", body: text);
            return true;
        }

        public bool SendEmail(List<string> to, List<string> cc, List<string> bcc, string subject, string body)
        {
            using (var smtpClient = new SmtpClient())
            {
                try
                {
                    MailMessage message = new MailMessage();
                    message.From = new MailAddress("shivamsharma5883@gmail.com");
                    foreach (var i in to)
                        message.To.Add(i);

                    message.Subject = subject;
                    message.IsBodyHtml = true;
                    message.Body = body;
                    message.BodyEncoding = Encoding.UTF8;
                    message.IsBodyHtml = true;
                    smtpClient.Port = Convert.ToInt32("587");
                    smtpClient.Host = "smtp.gmail.com";
                    smtpClient.EnableSsl = true;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential("shivamsharma5883@gmail.com", "bwzbhbvmveizytyq");
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtpClient.Send(message);
                }
                catch (Exception ex)
                {
                    throw ex;
                }

            }
            return true;
        }

        public async Task<IdentityResult> UpdatePassword(UpdatePasswordViewModel updatePasswordViewModel)
        {
            var user = await _userManager.FindByEmailAsync(updatePasswordViewModel.Email);
            var result = await _userManager.ChangePasswordAsync(user, updatePasswordViewModel.CurrentPassword, updatePasswordViewModel.Password);
            return result;
        }

        public async Task Logout()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<string> ResetPassword(ResetPasswordViewModel resetPasswordDto)
        {
            if (resetPasswordDto == null ||

                string.IsNullOrEmpty(resetPasswordDto.PasswordResetToken) ||
                string.IsNullOrEmpty(resetPasswordDto.NewPassword) ||
                string.IsNullOrEmpty(resetPasswordDto.ConfirmPassword) ||
                resetPasswordDto.ConfirmPassword != resetPasswordDto.NewPassword
            )
                return null;

            var user = await GetUserByToken(resetPasswordDto.PasswordResetToken);
            if (user.ResetTokenExirationTime < DateTime.UtcNow)
            {
                return null;
            }

            if (user != null)
            {
                try
                {
                    var result = await _userManager.RemovePasswordAsync(user);
                    if (result.Succeeded)
                    {
                        result = await _userManager.AddPasswordAsync(user, resetPasswordDto.NewPassword);
                    }
                    var token = await GenerateJSONWebToken(user);
                    return token;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

            return null;
        }

        public async Task<User> GetUserByToken(string token)
        {
            try
            {
                var user = await _context.Users
               .Where(x => x.UniqueToken.ToLower() == token.ToLower())
               .FirstOrDefaultAsync();

                return user;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
}
