using LineRunnerApp.Models;
using System;
using System.Collections.Generic;

namespace LineRunnerApp.Helpers
{
    public static class RunnerCollections
    {
        public static List<Tuple<double, double>> MarkerAxes = new();
        public static List<TableEvent> Events = new();
    }
}
