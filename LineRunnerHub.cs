using LineRunnerApp.Helpers;
using LineRunnerApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LineRunnerApp
{
    /// <summary>
    /// Хаб обработки команд приложения
    /// </summary>
    public class LineRunnerHub : Hub
    {
        /// <summary>
        /// Добавление маркера
        /// </summary>
        /// <param name="X"></param>
        /// <param name="Y"></param>
        /// <returns></returns>
        [Authorize]
        public async Task AddMarker(double X, double Y)
        {
            // Полученные координаты добавляем в общую коллекцию маркеров
            RunnerCollections.MarkerAxes.Add(new Tuple<double, double>(X, Y));

            // Отправляем команду Добавить маркер для всех клиентов
            await Clients.All.SendAsync("addMarker", X, Y); 
        }

        /// <summary>
        /// Запись события, произведенное пользователем
        /// </summary>
        /// <param name="login"></param>
        /// <param name="eventMessage"></param>
        /// <returns></returns>
        [Authorize]
        public async Task RecordEvent(string eventMessage)
        {
            string username = Context.User.Identity.Name;
            // Получаем инфрмацию о пользователе
            using AccountContext db = new();
            UserModel user = 
                await db.Users.FirstOrDefaultAsync(u => u.Login == username);

            if (user != null)
            {
                // Создаем запись о событии, произведенное пользователем
                db.Events.Add(new UserEventModel
                {
                    UserId = user.Id,
                    Description = eventMessage,
                    EventTime = DateTime.Now
                });
                await db.SaveChangesAsync();
            }
        }

        [Authorize]
        public async Task RemoveMarker(int selectedMarker, double X, double Y)
        {
            if (selectedMarker == 0)
            {
                RunnerCollections.MarkerAxes.RemoveRange(0, RunnerCollections.MarkerAxes.Count);
            }
            else
            {
                RunnerCollections.MarkerAxes.Remove(new Tuple<double, double>(X, Y));
            }
            await Clients.All.SendAsync("removeMarkerFromCanvas", selectedMarker);
        }

        [Authorize]
        public async Task UpdateEvents()
        {
            using AccountContext db = new();
            RunnerCollections.Events = await db.Events
                .OrderByDescending(e => e.EventTime)
                .Take(20)
                .Include(e => e.User)
                .Select(e => new TableEvent
                {
                    UserName = e.User.Login,
                    Description = e.Description,
                    EventTime = e.EventTime.ToString()
                })
                .ToListAsync();
               
            await Clients.All.SendAsync("updateEvents", RunnerCollections.Events);
        }

        public async Task Draw()
        {
            await Clients.All.SendAsync("draw");
        }
    }
}
