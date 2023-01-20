using LMS.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.GenericRepository
{
    public class AsyncGenericRepository<T> : IAsyncGenericRepository<T> where T : class
    {
        public DataContext _context;


        private DbSet<T> table = null;
        public AsyncGenericRepository(DataContext context)
        {
            this._context = context;
            table = context.Set<T>();
        }
        public Task Delete(object id)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAll(List<T> obj)
        {
            throw new NotImplementedException();
        }

        public async Task<IQueryable<T>> GetAll()
        {
            return await Task.Run(() =>
            {
                IQueryable<T> set = _context.Set<T>(); ;
                return set;
            });
        }
        public async Task<IQueryable<T>> GetAllBy(Expression<Func<T, bool>> condition)
        {
            return await Task.Run(() =>
            {
                IQueryable<T> set = _context.Set<T>().Where(condition); ;
                return set;
            });
        }
        public async Task<T> GetFirstOrDefaultBy(Expression<Func<T, bool>> condition)
        {
            T res = await _context.Set<T>().Where(condition).FirstOrDefaultAsync(); 
            return res;
        }

        public async Task<T> GetById(object id)
        {
            return await table.FindAsync(id);
        }

        public async Task<IEnumerable<T>> Includes(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = table.Include(includes[0]);
            foreach (var include in includes.Skip(1))
            {
                query = query.Include(include);
            }
            return (IEnumerable<T>)query.ToListAsync();
        }

        public async Task Insert(T obj)
        {
            await table.AddAsync(obj);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
            
        }

        public async Task Update(T obj)
        {
           await Task.Run(() =>
            {
                table.Attach(obj);
                _context.Entry(obj).State = EntityState.Modified;
            });
            
        }
    }
}
