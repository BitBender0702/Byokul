using LMS.Data;
using LMS.Data.Entity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.GenericRepository
{
    public class PostRepository : AsyncGenericRepository<Post>, IPostRepository
    {
        private readonly DataContext _context;
        public PostRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Post>> GetPostsByIds(Guid[] postIds)
        {
            var postList = new List<Post>();
            foreach (var postId in postIds)
            {
                var post = await _context.Posts.Where(x => x.Id == postId).FirstAsync();
                postList.Add(post);
            }
            return postList;
        }
    }
}
