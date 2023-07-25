using AutoMapper;
using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.ServiceType;
using LMS.Data.Entity;
using LMS.DataAccess.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using MimeKit;
using Microsoft.Extensions.Logging;

namespace LMS.Services.Common
{
    public class CommonService : ICommonService
    {
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private IGenericRepository<Language> _languageRepository;
        private IGenericRepository<Discipline> _disciplineRepository;
        private IGenericRepository<ServiceType> _serviceTypeRepository;
        private IGenericRepository<Accessibility> _accessibilityRepository;
        private IConfiguration _config;
        private readonly ILogger<CommonService> _logger;

        public CommonService(IMapper mapper,IWebHostEnvironment webHostEnvironment, IGenericRepository<Language> languageRepository, IGenericRepository<Discipline> disciplineRepository, IGenericRepository<ServiceType> serviceTypeRepository, IGenericRepository<Accessibility> accessibilityRepository, IConfiguration config, ILogger<CommonService> logger)
        {
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _languageRepository = languageRepository;
            _disciplineRepository = disciplineRepository;
            _serviceTypeRepository = serviceTypeRepository;
            _accessibilityRepository = accessibilityRepository;
            _config = config;
            _logger = logger;
        }

        public async Task<MemoryStream> CompressVideo(string fileName, byte[] videoData)
        {
            var path = _webHostEnvironment.ContentRootPath;
            var tempDirectoryPath = Path.Combine(path, "FfmpegVideos/");

            System.IO.File.WriteAllBytes(tempDirectoryPath + fileName, videoData);
            string ffmpegFileName = Path.Combine(path, "Ffmpeg/ffmpeg.exe");
            //string ffmpegFileName = "ffmpeg.exe";

            string compressVid = Path.Combine(tempDirectoryPath + fileName);

            try
            {

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = false;
                psi.FileName = ffmpegFileName;
                psi.WorkingDirectory = Directory.GetCurrentDirectory();
                psi.Arguments = $" -i {tempDirectoryPath}{fileName} -vcodec libx265 -crf 28 -tune fastdecode -preset ultrafast -threads 10 -r 23 -acodec aac {Path.Combine(tempDirectoryPath + Guid.NewGuid().ToString() + fileName)}";

                var process = new Process
                {
                    StartInfo = psi,
                    EnableRaisingEvents = true,

                };
                process.Exited += (sender, args) =>
                {
                    process.Dispose();
                };
                process.Start();
                process.WaitForExit();
            }
            catch (Exception err)
            {
                Console.WriteLine("Exception Error: " + err.ToString());
                throw err;
            }

            var byteArray = System.IO.File.ReadAllBytes(compressVid);
            var stream = new MemoryStream(byteArray);
            return stream;
        }

        //public async Task<MemoryStream> CompressVideo(string meetingID,string fileName, byte[] videoData)
        //{
        //    var path = _webHostEnvironment.ContentRootPath;
        //    var tempDirectoryPath = Path.Combine(path, "wwwroot/tmp/");

        //    System.IO.File.WriteAllBytes(tempDirectoryPath + fileName, videoData);
        //    string ffmpegFileName = "ffmpeg.exe";
        //    string compressVid = Path.Combine(tempDirectoryPath, meetingID + "compress.mp4");

        //    try
        //    {

        //        ProcessStartInfo psi = new ProcessStartInfo();
        //        psi.WindowStyle = ProcessWindowStyle.Hidden;
        //        psi.UseShellExecute = false;
        //        psi.CreateNoWindow = false;
        //        psi.FileName = ffmpegFileName;
        //        psi.WorkingDirectory = Directory.GetCurrentDirectory();
        //        psi.Arguments = $" -i {tempDirectoryPath}{fileName} -vcodec libx265 -crf 28 -acodec aac {compressVid}";

        //        var process = new Process
        //        {
        //            StartInfo = psi,
        //            EnableRaisingEvents = true,

        //        };
        //        process.Exited += (sender, args) =>
        //        {
        //            process.Dispose();
        //        };
        //        process.Start();
        //        process.WaitForExit();
        //    }
        //    catch (Exception err)
        //    {
        //        Console.WriteLine("Exception Error: " + err.ToString());
        //    }

        //    var byteArray = System.IO.File.ReadAllBytes(compressVid);
        //    var stream = new MemoryStream(byteArray);
        //    return stream;
        //}

        public async Task<bool> SendEmail(List<string> to, List<string> cc, List<string> bcc, string subject, string body,string? pdfContent,string? pdfName)
        {
            var emailMessage = new MimeMessage();
            emailMessage.To.AddRange(to.Select(x => new MailboxAddress("email", x)));
            emailMessage.Subject = subject;
            emailMessage.Body = new TextPart("html") { Text = body };
            await SendSGMail(emailMessage, true, pdfContent,pdfName);
            return true;
        }

        public async Task<IEnumerable<LanguageViewModel>> LanguageList()
        {
            var languageList = _languageRepository.GetAll();
            var result = _mapper.Map<IEnumerable<LanguageViewModel>>(languageList);
            return result;
        }

        public async Task<IEnumerable<DisciplineViewModel>> GetDisciplines()
        {
           var disciplineList = await _disciplineRepository.GetAll().Where(x => !x.IsDeleted).ToListAsync();

            var result = _mapper.Map<IEnumerable<DisciplineViewModel>>(disciplineList);

            return result;

        }

        public async Task<IEnumerable<ServiceTypeViewModel>> GetServiceType()
        {
            var serviceTypeList = await _serviceTypeRepository.GetAll().ToListAsync();

            var result = _mapper.Map<IEnumerable<ServiceTypeViewModel>>(serviceTypeList);

            return result;

        }

        public async Task<IEnumerable<AccessibilityViewModel>> GetAccessibility()
        {
            var accessibilityList = await _accessibilityRepository.GetAll().ToListAsync();

            var result = _mapper.Map<IEnumerable<AccessibilityViewModel>>(accessibilityList);

            return result;

        }

        private async Task SendSGMail(MimeMessage emailMessage, bool isHtml,string? pdfContent, string? pdfName)
        {
            try
            {
                _logger.LogInformation("SendSGMail called.");
                var apiKey = _config["SENDGRID_KEY"];
                var client = new SendGridClient(apiKey);
                var from = new EmailAddress("noreply@devcsharp.com", "ByOkul");
                var subject = emailMessage.Subject;
                var to = emailMessage.GetRecipients().FirstOrDefault()?.Address ?? String.Empty;
                if (!String.IsNullOrEmpty(to))
                {
                    var toAddress = new EmailAddress(to);
                    var htmlContent = isHtml ? emailMessage.HtmlBody.ToString() : emailMessage.Body.ToString();
                    var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, "", htmlContent);

                    //var bytes = File.ReadAllBytes("~/Templates/output.pdf");
                    //var file = Convert.ToBase64String(bytes);
                    if (pdfContent != null)
                    {
                        msg.AddAttachment(pdfName, pdfContent);
                    }
                    //msg.AddAttachment(attachmentFileStream,"");
                    var response = await client.SendEmailAsync(msg);
                    _logger.LogInformation("getting response.");

                }
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "MyMethod failed with an exception."); ;
            }
        }
    }

}
