/// <reference path="../../.config/sa.d.ts" />

import { BaseLauncher } from "../BaseLauncher";
import { Save } from "../Save";
import { ExampleMission } from "./ExampleMission";

new class ExampleLauncher extends BaseLauncher {

    constructor() { super(ExampleMission); }

    protected onStartEvent(): void {
        let totalMissionPassed = Save.GetInt("TOTAL_MISSION_PASSED", 0);
        if (totalMissionPassed > 4)
            exit();
        if (totalMissionPassed === 0) {

            this.callThePlayersPhone((dialog) => {
                dialog.addAReplica(true, "Hi 1", 2000)
                    .addAReplica(false, "Hi 2", 2000)
                    .addAReplica(true, "Hi 3", 2000)
                    .addAReplica(false, "Hi 4", 2000);
            });
            totalMissionPassed = Save.IncreaseInt("TOTAL_MISSION_PASSED");
        }

        this.setPosition(2452.3093, -1649.698, 13.4468);


    }

    protected onMissionLaunchEvent(): boolean {
        if (this.playerChar.isStopped() && this.playerChar.isOnFoot()) {
            //if (!this.isClockHourInRange(22, 2)) {
            //    if (!Text.IsMessageBeingDisplayed())
            //        Text.PrintFormattedNow("You can start this mission between %.2d:00 and %.2d:00.", 5000, 22, 2);
            //    return false;
            //}
            return true;
        }
        return false;
    }

    protected onMissionEndEvent(hasSuccess: boolean): boolean {
        if (hasSuccess)
            return 5 > Save.IncreaseInt("TOTAL_MISSION_PASSED", 0, true);
        return true;
    }

}