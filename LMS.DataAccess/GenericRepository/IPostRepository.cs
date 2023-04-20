using LMS.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.GenericRepository
{
    public interface IPostRepository: IAsyncGenericRepository<Post>
    {
        Task<List<Post>> GetPostsByIds(Guid[] ids);
    }
}
