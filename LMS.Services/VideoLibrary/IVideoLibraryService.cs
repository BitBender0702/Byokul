using LMS.Common.ViewModels.FileStorage;
using LMS.Common.ViewModels.School;
using LMS.Common.ViewModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services
{
    public interface IVideoLibraryService
    {
        Task<List<VideoLibraryViewModel>> GetSchoolLibraryVideos(Guid schoolId);
        Task<bool> DeleteFile(Guid fileId);
        Task<VideoLibraryViewModel> SaveFile(VideoLibraryViewModel model, string createdById);



    }
}
