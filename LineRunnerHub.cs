using LineRunnerApp.Helpers;
using LineRunnerApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace LineRunnerApp
{
    /// <summary>
    /// Хаб обработки команд приложения
    /// </summary>
    public class LineRunnerHub : Hub
    {
        [Authorize]
        public async Task AddMarker(double X, double Y)
        {
            RunnerCollections.MarkerAxes.Add(new Tuple<double, double>( X, Y ));

            // Отправляем команду Добавить маркер для всех клиентов
            await Clients.All.SendAsync("addMarker", X, Y); 
        }

        public async Task FillMarkers()
        {
            await Clients.All.SendAsync("fillMarkers", RunnerCollections.MarkerAxes);
        }

        public async Task Draw()
        {
            await Clients.All.SendAsync("draw");
        }


        //public async Task GetPointPosition(
        //    double pointX, double pointY, 
        //    double nextPointX, double nextPointY)
        //{
        //    Tuple<double, double> positions = 
        //        RunnerRoutes.PointPosition(pointX, pointY, nextPointX, nextPointY);

        //    await Clients.All.SendAsync("draw");
        //}
    }
}
