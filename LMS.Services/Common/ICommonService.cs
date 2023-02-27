using LMS.Common.ViewModels.Accessibility;
using LMS.Common.ViewModels.Common;
using LMS.Common.ViewModels.ServiceType;
using LMS.Data.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.Common
{
    public interface ICommonService
    {
        Task<MemoryStream> CompressVideo(string meetingID,string fileName, byte[] videoData);
        Task<bool> SendEmail(List<string> to, List<string> cc, List<string> bcc, string subject, string body,string? pdfContent,string? pdfName);
        Task<IEnumerable<LanguageViewModel>> LanguageList();
        Task<IEnumerable<DisciplineViewModel>> GetDisciplines();
        Task<IEnumerable<ServiceTypeViewModel>> GetServiceType();
        Task<IEnumerable<AccessibilityViewModel>> GetAccessibility();
    }
}
