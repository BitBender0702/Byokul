using LMS.Common.ViewModels.FileStorage;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Services.FileStorage
{
    public interface IFileStorageService
    {
        Task<FolderViewModel> SaveFolder(FolderViewModel model, string createdById);
        Task<List<FolderViewModel>> GetFolders(Guid parentId, string? searchString);
        Task<List<FileViewModel>> SaveFiles(SaveFilesViewModel model, string createdById);
        Task<List<FileViewModel>> GetFiles(Guid parentId, string? searchString);
        Task<NestedFoldersViewModel> GetNestedFolders(Guid folderId, string? searchString);



    }
}
