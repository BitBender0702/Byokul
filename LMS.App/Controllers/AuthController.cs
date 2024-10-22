﻿using LMS.Common.ViewModels.Account;
using LMS.Data.Entity;
using LMS.Services.Account;
using LMS.Services.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using LMS.Common.ViewModels.Post;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
using LMS.Services.Iyizico;
using LMS.Services.FileStorage;
using LMS.DataAccess.Repository;

namespace LMS.App.Controllers
{
    [Route("auth")]
    public class AuthController : BaseController
    {
        private string Token;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IAuthService _authService;
        private readonly ICommonService _commonService;
        private readonly IIyizicoService _iyzicoService;
        private readonly IGenericRepository<User> _userRepository;
        private IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public AuthController(SignInManager<User> signInManager, UserManager<User> userManager, IAuthService authService, IIyizicoService iyzicoService, IConfiguration config, IGenericRepository<User> userRepository, IWebHostEnvironment webHostEnvironment, ICommonService commonService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _authService = authService;
            _iyzicoService = iyzicoService;
            _config = config;
            _userRepository = userRepository;
            _webHostEnvironment = webHostEnvironment;
            _commonService = commonService;
        }

        [Route("login")]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginViewModel loginViewModel)
        {
            if (!ModelState.IsValid)
            {
                return Ok("Invalid Email");
            }
            var result = await _authService.AuthenticateUser(loginViewModel);
            if(result.ErrorMessage == "Incorrect password.")
            {
                return Ok(result);
            }
            Token = result.Token;
            return Ok(result);
        }


        [Route("register")]
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel registerViewModel)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var user = new User
                    {
                        UserName = registerViewModel.Email,
                        Email = registerViewModel.Email,
                        FirstName = registerViewModel.FirstName,
                        LastName = registerViewModel.LastName,
                        Gender = registerViewModel.Gender,
                        CountryName = registerViewModel.CountryName,
                        StateName = registerViewModel.StateName,
                        DOB = registerViewModel.DOB,
                        CreatedOn = DateTime.UtcNow
                    };
                    var result = await _userManager.CreateAsync(user, registerViewModel.Password);

                    if (result.Succeeded)
                    {
                        var path = _webHostEnvironment.ContentRootPath;
                        var filePath = Path.Combine(path, "Email/confirm-email.html");
                        var imagePath = Path.Combine(path, "Email/images/logo.svg");
                        var text = System.IO.File.ReadAllText(filePath);
                        text = text.Replace("[Recipient]", user.FirstName + " " + user.LastName);
                        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        string callBackUrl = $"{_config["AppUrl"]}/user/auth/emailConfirm?token={token}&email={user.Email}";
                        text = text.Replace("[URL]", callBackUrl);
                        await _commonService.SendEmail(new List<string> { user.Email }, null, null, "Verify Your Email Address", body: text, null, null);

                        var iyzicoSubmerchantKey = await _iyzicoService.CreateSubMerchent(user);
                        user.IyzicoSubMerchantKey = iyzicoSubmerchantKey;
                        _userRepository.Update(user);
                        _userRepository.Save();

                        //return Ok(new { result = Constants.Success , userId = user.Id});
                        return Ok(new { Success = true, Message = Constants.RegisteredSuccessfully, userId = user.Id });

                    }

                    //return Ok(new { result = Constants.Success, message = result.Errors.FirstOrDefault()?.Description });
                    return Ok(new { Success = false, Message = result.Errors.FirstOrDefault()?.Description });
                }

                //return Ok(new { result = ModelState.Select(x => x.Value.Errors.FirstOrDefault()?.ErrorMessage).FirstOrDefault()});
                return Ok(new { Success = false, Message = ModelState.Select(x => x.Value.Errors.FirstOrDefault()?.ErrorMessage).FirstOrDefault() });



            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        [Route("confirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            token = token.Replace(" ", "+");
            var user = await _userManager.FindByEmailAsync(email);

            if (user is null) return Ok(new { Success = false, Message = $"User not found for email: {email}" });

            var result = await _userManager.ConfirmEmailAsync(user, token);
            return (result.Succeeded ? Ok(new { Success = true, Message = Constants.EmailConfirmedSuccessfully }) : Ok(new { Success = false, result = Constants.InvalidToken }));
        }


        [Route("forgetPassword")]
        [HttpPost]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordViewModel forgetPasswordViewModel)
        {
            if (!IsValidEmail(forgetPasswordViewModel.Email))
            {
                return Ok("Invalid Email");
            }
            var response = await _authService.GeneratePasswordResetRequest(forgetPasswordViewModel);
            if (response == Constants.UserDoesNotExist)
            {
                return Ok(new { result = Constants.UserDoesNotExist });
            }
            else
            {
                return Ok(new { result = Constants.Success });
            }
        }
        private bool IsValidEmail(string email)
        {
            string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            return Regex.IsMatch(email, emailPattern);
        }

        [Authorize]
        [Route("updatePassword")]
        [HttpPost]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordViewModel updatePasswordViewModel)
        {
            var Email = User.Identity.Name;

            if (updatePasswordViewModel.CurrentPassword == updatePasswordViewModel.Password)
            {
                return Ok(new { result = "Old and new password cannot be same" });
            }

            if (updatePasswordViewModel.Password != updatePasswordViewModel.ConfirmPassword)
            {
                return Ok(new { result = "Password and confirm password did not match" });
            }

            var result = await _authService.UpdatePassword(updatePasswordViewModel, Email);

            if (result.Succeeded)
            {
                return Ok(new { result = "Success" });
            }
            if (result.Errors.FirstOrDefault()?.Description == "Incorrect password.")
            {
                return Ok(new { result = Constants.IncorrectPassword });
            }
            return Ok(new { result = "Incorrect new password" });
        }

        [Route("resetPassword")]
        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel resetPasswordViewModel)
        {
            if (resetPasswordViewModel.NewPassword != resetPasswordViewModel.ConfirmPassword)
            {
                return Ok(new { Success = false, Message = Constants.NewPassAndConfirmPassNotmatch });

                //return Ok(new { result = "New Password and confirm password did not match" });
            }
            var response = await _authService.ResetPassword(resetPasswordViewModel);
            if (response == Constants.ResetTokenExpired)
            {
                return Ok(new { Success = false, Message = Constants.ResetTokenExpired });
                //return Ok(new { result = Constants.ResetTokenExpired });
            }
            return Ok(new { Success = true, Message = Constants.PassResetSuccessfully, Token = response });
            //return Ok(new { result = response });
        }


        // LogOut
        [Route("logout")]
        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _authService.Logout();
            return Ok();
        }

        [Route("setPassword")]
        [HttpPost]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordViewModel model)
        {
            var result = await _authService.SetPassword(model);
            if (result.Succeeded)
            {
                return Ok(new { result = "Success" });
            }
            else
            {
                return Ok(new { result = "" });
            }
        }


        [Route("resendEmail")]
        [HttpPost]
        public async Task<IActionResult> ResendEmail([FromBody] ResendEmailModel user)
        {
            try
            {
                User resendEmailToUser = await _userManager.FindByEmailAsync(user.Email);
                if (resendEmailToUser != null)
                {
                    var path = _webHostEnvironment.ContentRootPath;
                    var filePath = Path.Combine(path, "Email/confirm-email.html");
                    var imagePath = Path.Combine(path, "Email/images/logo.svg");
                    var text = System.IO.File.ReadAllText(filePath);
                    text = text.Replace("[Recipient]", resendEmailToUser.FirstName + " " + resendEmailToUser.LastName);
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(resendEmailToUser);
                    string callBackUrl = $"{_config["AppUrl"]}/user/auth/emailConfirm?token={token}&email={user.Email}";
                    text = text.Replace("[URL]", callBackUrl);
                    await _commonService.SendEmail(new List<string> { user.Email }, null, null, "Verify Your Email Address", body: text, null, null);

                    //return Ok(new { result = "success" });
                    return Ok(new { Success = true, Message = Constants.PassResendSuccessfully });

                }

                //return Ok(new { result = $"User not found for email: {user.Email}" });
                return Ok(new { Success = false, Message = $"User not found for email: {user.Email}" });


            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



    }
}
