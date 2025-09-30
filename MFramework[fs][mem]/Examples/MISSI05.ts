import { ADMIRAL } from "../Models";
import { BaseCircuitRace } from "../Racing";

new class MISSI05 extends BaseCircuitRace {

    public onRacerSetupEvent(): void {
        //this.enableProgressSaving = false;

        this.lapsCount = 3;
        this.addRacer(ADMIRAL, 2461.1069, -1656.5208, 12.9853, 90.8145);
        this.addPlayerRacer(ADMIRAL, 2461.2051, -1662.1044, 12.9146, 89.8674);
        this.addRacer(ADMIRAL, 2447.6106, -1662.5507, 13.0234, 89.867, -1, car => {
            car.changeColor(0, 0);
        });

        this.addRouteNode(2345.4089, -1658.4236, 12.9914, 89.7493, 22.0);
        this.addRouteNode(2227.1375, -1650.1602, 14.9251, 72.677, 22.0);

        this.setTraffic(0.35, 1.0, true, 1.0);
        this.minWantedLevel = 2;

    }

}