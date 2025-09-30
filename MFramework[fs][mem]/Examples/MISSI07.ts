import { ADMIRAL, TAHOMA, WMYST } from "../Models";
import { BaseSpeedtrapRace } from "../Racing";

new class MISSI07 extends BaseSpeedtrapRace {

    public onRacerSetupEvent(): void {
        //this.enableProgressSaving = false;

        this.addRacer(ADMIRAL, 2482.2942, -2526.0311, 13.1296, 178.3344);
        this.addPlayerRacer(ADMIRAL, 2487.2515, -2524.2615, 13.122, 178.1994);
        this.addRacer(TAHOMA, 2482.2942, -2540.6711, 13.1452, 178.4864, WMYST, car => {
            car.changeColor(1, 3);
        });

        this.addRouteNode(2484.0068, -2646.4326, 13.1043, 351.6405, 28.0);
        this.addRouteNode(2400.7549, -2663.0188, 13.2597, 90.0606, 28.0);
        this.addRouteNode(2247.6582, -2664.1458, 13.1757, 89.7025, 28.0);

    }

    public onStartEvent(): void {
        //this.refreshArea(2487.2515, -2524.2615, 13.122);
    }

}