using System;

namespace LineRunnerApp.Helpers
{
    /// <summary>
    /// Класс для отображения событий в таблице 
    /// </summary>
    public class TableEvent
    {
        // Имя пользователя 
        public string UserName { get; set; }
        // Описание события 
        public string Description { get; set; }
        // Время события
        public string EventTime { get; set; }
    }
}
