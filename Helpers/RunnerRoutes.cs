using System;

namespace LineRunnerApp.Helpers
{
    public static class RunnerRoutes
    {
        public static Tuple<double, double> PointPosition(
            double pointX, double pointY,
            double nextPointX, double nextPointY)
        {
            double dX = nextPointX - pointX;
            double dY = nextPointY - pointY;

            double D = Math.Sqrt(Math.Pow(dX, 2) + Math.Pow(dY, 2));

            pointX += dX / D;
            pointY += dY / D;

            return new Tuple<double, double>(pointX, pointY);
        }
    }
}
