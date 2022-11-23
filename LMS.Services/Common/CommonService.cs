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
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

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

        public CommonService(IMapper mapper,IWebHostEnvironment webHostEnvironment, IGenericRepository<Language> languageRepository, IGenericRepository<Discipline> disciplineRepository, IGenericRepository<ServiceType> serviceTypeRepository, IGenericRepository<Accessibility> accessibilityRepository)
        {
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _languageRepository = languageRepository;
            _disciplineRepository = disciplineRepository;
            _serviceTypeRepository = serviceTypeRepository;
            _accessibilityRepository = accessibilityRepository;
        }

        public async Task<MemoryStream> CompressVideo(string meetingID,string fileName, byte[] videoData)
        {
            var path = _webHostEnvironment.ContentRootPath;
            var tempDirectoryPath = Path.Combine(path, "wwwroot/tmp/");

            System.IO.File.WriteAllBytes(tempDirectoryPath + fileName, videoData);
            string ffmpegFileName = "ffmpeg.exe";
            string compressVid = Path.Combine(tempDirectoryPath, meetingID + "compress.mp4");

            try
            {

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = false;
                psi.FileName = ffmpegFileName;
                psi.WorkingDirectory = Directory.GetCurrentDirectory();
                psi.Arguments = $" -i {tempDirectoryPath}{fileName} -vcodec libx265 -crf 28 -acodec aac {compressVid}";

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
            }

            var byteArray = System.IO.File.ReadAllBytes(compressVid);
            var stream = new MemoryStream(byteArray);
            return stream;
        }

        public async Task<bool> SendEmail(List<string> to, List<string> cc, List<string> bcc, string subject, string body)
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


    }

}
