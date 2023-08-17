 using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Repository
{
    public interface IGenericRepository<T> where T : class
    {
        T GetById(object id);
        void Insert(T obj);
        void Update(T obj);
        void Delete(object id);
        void Save();
        Task<Object> SaveAsync();
        void DeleteAll(List<T> obj);
        IEnumerable<T> Includes(params Expression<Func<T, Object>>[] includes);
        IQueryable<T> GetAll();
        T GetFirstOrDefaultBy(Expression<Func<T, bool>> condition);
    }
}
