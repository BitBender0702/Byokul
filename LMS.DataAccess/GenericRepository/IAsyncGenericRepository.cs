using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.GenericRepository
{
    public interface IAsyncGenericRepository<T> where T : class
    {
        Task<T> GetById(object id);
        Task Insert(T obj);
        Task Update(T obj);
        Task Delete(object id);
        Task Save();
        Task DeleteAll(List<T> obj);
        Task<IEnumerable<T>> Includes(params Expression<Func<T, Object>>[] includes);
        Task<IQueryable<T>> GetAll();
        Task<IQueryable<T>> GetAllBy(Expression<Func<T, bool>> condition);
        Task<T> GetFirstOrDefaultBy(Expression<Func<T, bool>> condition);
    }
}
