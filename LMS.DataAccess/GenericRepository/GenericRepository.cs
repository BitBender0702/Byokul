using LMS.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LMS.DataAccess.Repository
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        public DataContext _context;


        private DbSet<T> table = null;
        public GenericRepository(DataContext _context)
        {
            this._context = _context;
            table = _context.Set<T>();
        }
        public T GetById(object id)
        {
            return table.Find(id);
        }
        public void Insert(T obj)
        {
            table.Add(obj);
        }
        public void Update(T obj)
        {
            table.Attach(obj);
            _context.Entry(obj).State = EntityState.Modified;
        }
        public void Delete(object id)
        {
            T existing = table.Find(id);
            table.Remove(existing);
        }
        public void DeleteAll(List<T> obj)
        {
            table.RemoveRange(obj);
        }
        public void Save()
        {
            _context.SaveChanges();
        }

        public IEnumerable<T> Includes(params Expression<Func<T, Object>>[] includes)
        {
            IQueryable<T> query = table.Include(includes[0]);
            foreach (var include in includes.Skip(1))
            {
                query = query.Include(include);
            }
            return query.ToList();
        }

        public IQueryable<T> GetAll()
        {
            IQueryable<T> set = table;
            return set;
        }
    }
}
