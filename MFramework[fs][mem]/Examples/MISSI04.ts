import { ADMIRAL } from "../Models";
import { BaseSprintRace } from "../Racing";

new class MISSI04 extends BaseSprintRace {

    public onRacerSetupEvent(): void {
        //this.enableProgressSaving = false;

        this.addRacer(ADMIRAL, 1195.6671, -1381.7217, 12.9108, 1.9518);
        this.addPlayerRacer(ADMIRAL, 1205.1241, -1381.9952, 12.8572, 3.9422);

        this.addRouteNode(1210.7045, -1283.2121, 12.9899, 332.1622, 12.0);
        this.addRouteNode(1216.6337, -1148.3384, 23.0433, 357.3754, 12.0);
    }

}