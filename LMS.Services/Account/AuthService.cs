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
using Newtonsoft.Json;
using AutoMapper;
using LMS.Common.ViewModels.Permission;

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
        private IGenericRepository<UserPermission> _userPermissionRepository;
        private IGenericRepository<User> _userRepository;
        private readonly IMapper _mapper;


        public AuthService(IConfiguration config, IWebHostEnvironment webHostEnvironment, SignInManager<User> signInManager, UserManager<User> userManager, DataContext context, ICommonService commonService, IGenericRepository<UserPermission> userPermissionRepository, IGenericRepository<User> userRepository, IMapper mapper)
        {
            _config = config;
            _webHostEnvironment = webHostEnvironment;
            _signInManager = signInManager;
            _userManager = userManager;
            _context = context;
            _commonService = commonService;
            _userPermissionRepository = userPermissionRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<JwtResponseViewModel> AuthenticateUser(LoginViewModel loginViewModel)
        {
            var jwtResponse = new JwtResponseViewModel();
            var user = await _userManager.FindByNameAsync(loginViewModel.Email);
            if (user != null)
            {
                jwtResponse.UserId = user.Id;
                var permissions = await _userPermissionRepository.GetAll().Include(x => x.Permission).Where(x => x.UserId == user.Id).ToListAsync();
                var userPermissions = _mapper.Map<List<UserPermissionViewModel>>(permissions);
                var result = await _signInManager.PasswordSignInAsync(loginViewModel.Email, loginViewModel.Password, false, false);
                if (result.Succeeded && !result.IsNotAllowed)
                {

                    var token = await GenerateJSONWebToken(user);
                    jwtResponse.Token = token;
                    jwtResponse.UserPermissions = userPermissions;
                    return jwtResponse;
                }
                if (!result.Succeeded && result.IsNotAllowed)
                {
                    jwtResponse.ErrorMessage = Constants.EmailNotConfirmed;
                    return jwtResponse;
                }
                if (!result.Succeeded)
                {
                    jwtResponse.ErrorMessage = Constants.IncorrectPassword;
                    return jwtResponse;
                }
            }
            jwtResponse.ErrorMessage = Constants.UserNotFound;
            return jwtResponse;
        }

        public async Task<string> GenerateJSONWebToken(User userInfo)
        {

            var roles = await _userManager.GetRolesAsync(userInfo);
            var claims = new List<Claim>
            {
            new Claim(JwtRegisteredClaimNames.Sub, userInfo.Email),
            new Claim(JwtRegisteredClaimNames.Jti, userInfo.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, userInfo.UserName),
            new Claim(JwtRegisteredClaimNames.Gender, userInfo.Gender.ToString()),
            new Claim(JwtRegisteredClaimNames.Name,userInfo.FirstName + " " + userInfo.LastName),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            claims.Add(new Claim("isBan", userInfo.IsBan.ToString()));

            var identity = new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Audience"],
              identity.Claims,
              expires: DateTime.Now.AddMinutes(5),
              signingCredentials: credentials);


            var result = new JwtSecurityTokenHandler().WriteToken(token);
            return result;
        }

        public async Task<string> GeneratePasswordResetRequest(ForgetPasswordViewModel forgetPasswordViewModel)
        {
            
            var user = await _userManager.FindByEmailAsync(forgetPasswordViewModel.Email);
            if (user == null)
                return Constants.UserDoesNotExist;

            user.UniqueToken = String.Format("{0}-{1}", Guid.NewGuid(), Guid.NewGuid());
            user.TokenCreatedOn = DateTime.UtcNow;
            user.ResetTokenExirationTime = DateTime.UtcNow.AddHours(1);

            var response = await _userManager.UpdateAsync(user);
            if (response.Succeeded)
                return await TriggerResetPasswordEmail(forgetPasswordViewModel.Email, user.UniqueToken, user);

            return "";
        }

        private async Task<string> TriggerResetPasswordEmail(string email, string token, User user)
        {
            string callBackUrl = string.Format(_config["ForgotPasswordCallback"], token);

            var path = _webHostEnvironment.ContentRootPath;
            var filePath = Path.Combine(path, "Email/forgot-password.html");
            var imagePath = Path.Combine(path, "Email/images/icon_instagram.png");

            var text = System.IO.File.ReadAllText(filePath);
            text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
            text = text.Replace("[ACTIVATIONLINK]", callBackUrl);
            text = text.Replace("*#FirstName#*", email);

            await _commonService.SendEmail(new List<string> { email }, null, null, subject: "Reset Your Password", body: text, null, null);
            return Constants.ForgetEmailSentSuccessfully;
        }


        public async Task<string> ResendEmail(string email, User user)
        {
            var userByEmail = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return Constants.UserDoesNotExist;

            user.UniqueToken = String.Format("{0}-{1}", Guid.NewGuid(), Guid.NewGuid());
            user.TokenCreatedOn = DateTime.UtcNow;
            user.ResetTokenExirationTime = DateTime.UtcNow.AddHours(1);

            var response = await _userManager.UpdateAsync(user);
            if (response.Succeeded)
                return "";

            return "";
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

        public async Task<IdentityResult> UpdatePassword(UpdatePasswordViewModel updatePasswordViewModel, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
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
            try
            {
                if (user.ResetTokenExirationTime < DateTime.UtcNow)
                {
                    return Constants.ResetTokenExpired;
                }
            }
            catch(Exception ex)
            {
                return ex.Message;
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

        public async Task<IdentityResult> SetPassword(SetPasswordViewModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            var result = await _userManager.RemovePasswordAsync(user);
            if (result.Succeeded)
            {
                await _userManager.AddPasswordAsync(user, model.NewPassword);
            }
            user.EmailConfirmed = true;
            _userRepository.Update(user);
            _userRepository.Save();
            return result;

        }
    }
}
