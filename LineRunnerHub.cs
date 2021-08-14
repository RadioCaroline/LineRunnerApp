using LineRunnerApp.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace LineRunnerApp
{
    /// <summary>
    /// Хаб обработки команд приложения
    /// </summary>
    public class LineRunnerHub : Hub
    {
        /// <summary>
        /// Добавление точки на пространство
        /// </summary>
        /// <param name="X">Координата на абциссе</param>
        /// <param name="Y">Координата на ординате</param>
        /// <returns></returns>
        public async Task AddPoint(double X, double Y)
        {
            // Отправляем команду Добавить точку для всех клиентов
            await Clients.All.SendAsync("addPoint", X, Y);
        }
    }
}
