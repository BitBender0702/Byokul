using Abp.Net.Mail;
using LMS.Common.ViewModels.Account;
using LMS.Common.ViewModels.Chat;
using LMS.Data.Entity;
using LMS.Services.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Configuration;

namespace LMS.App.Controllers
{
    [Route("auth")]
    public class AuthController : BaseController
    {
        private string Token;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IAuthService _authService;
        public AuthController(SignInManager<User> signInManager, UserManager<User> userManager, IAuthService authService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _authService = authService;
        }

        // Login Method
        [Route("login")]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginViewModel loginViewModel)
        {
            var result = await _authService.AuthenticateUser(loginViewModel);
            if (result != null)
            {
                Token = result;
                return Ok(new { token = result });
            }
            return Ok(new { token = "" });
        }


        //Register User
        [Route("register")]
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel registerViewModel)
        {
            var user = new User
            {
                UserName = registerViewModel.Email,
                Email = registerViewModel.Email,
                FirstName = registerViewModel.FirstName,
                LastName = registerViewModel.LastName,
                Gender = registerViewModel.Gender,
                CityId = registerViewModel.CityId,
                DOB = registerViewModel.DOB,
                CreatedOn = DateTime.UtcNow
            };
            var result = await _userManager.CreateAsync(user, registerViewModel.Password);

            if (result.Succeeded)
            {
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var confirmationLink = Url.Action("confirm-email", "auth", new { token, email = user.Email }, "http");
                _authService.SendEmail(new List<string> { user.Email}, null, null, "Confirmation email link", confirmationLink);

                return Ok(new { result = "success" });
            }
            return Ok(new { token = "" });
        }

        //Confirm Email
        [HttpGet]
        [Route("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null) return BadRequest($"User not found for email: {email}");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            return (result.Succeeded  ? Ok( new { result = "success" } ) : BadRequest("Invalid token"));
        }

        // Forget Password
        [Route("forgetPassword")]
        [HttpPost]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordViewModel forgetPasswordViewModel)
        {
            var response = await _authService.GeneratePasswordResetRequest(forgetPasswordViewModel);
            if (response)
            {
                return Ok(new { result = "success" });
            }
            else
            {
                return Ok(new { result = "" });
            }
        }


        // Change password
        [Route("updatePassword")]
        [HttpPost]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordViewModel updatePasswordViewModel)
        {
            updatePasswordViewModel.Email = User.Identity.Name;
            var response = await Login(new LoginViewModel
            {
                Email = updatePasswordViewModel.Email,
                Password = updatePasswordViewModel.CurrentPassword
            });
            var token = Token;
            if (token != null)
            {
                var result = await _authService.UpdatePassword(updatePasswordViewModel);
                if (result.Succeeded)
                {
                    return Ok(new { result = "Success" });
                }
            }
            return Ok(new { result = "" });
        }

        [Route("resetPassword")]
        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel resetPasswordViewModel)
        {
            var result = await _authService.ResetPassword(resetPasswordViewModel);
            if (result != null)
            {
                return Ok(new { token = result });
            }
            return BadRequest("Some error occurred");
        }


        // LogOut
        [Route("logout")]
        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _authService.Logout();
            return Ok();
        }

        
    }
}
