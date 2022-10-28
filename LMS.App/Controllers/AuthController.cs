using LMS.Common.ViewModels.Account;
using LMS.Data.Entity;
using LMS.Services.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMS.App.Controllers
{
    [Route("auth")]
    public class AuthController : BaseController
    {
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
                return Ok(new { token = result });
            }
            return Unauthorized();
        }


        //Register User
        [Route("register")]
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel registerViewModel)
        {
            IActionResult response = Unauthorized();

            var user = new User {
                UserName = registerViewModel.Email,
                Email = registerViewModel.Email,
                FirstName = registerViewModel.FirstName,
                LastName = registerViewModel.LastName,
                Gender = registerViewModel.Gender,
                DOB = registerViewModel.DOB,
                CreatedOn = DateTime.UtcNow
            };
            var result = await _userManager.CreateAsync(user, registerViewModel.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                var tokenString = await _authService.GenerateJSONWebToken(user);
                response = Ok(new { token = tokenString });
            }
            return response;
        }


        // Forget Password
        [Route("forgetPassword")]
        [HttpPost]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordViewModel forgetPasswordViewModel)
        {
            var response = await _authService.GeneratePasswordResetRequest(forgetPasswordViewModel);
            return Ok();
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

            if (response != null)
            {
                var result = await _authService.UpdatePassword(updatePasswordViewModel);
                if (result.Succeeded)
                {
                    return Ok();
                }
            }
            return Unauthorized();
        }

        [Route("resetPassword")]
        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel resetPasswordViewModel)
        {
            var result = await _authService.ResetPassword(resetPasswordViewModel);
            if (result != null)
            {
                return Ok(new { token = result});
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
