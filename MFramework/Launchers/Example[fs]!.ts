/// <reference path="../../.config/sa.d.ts" />

import { BaseLauncher } from "../BaseLauncher";
import { Save } from "../Save";
import { ExampleMission } from "./ExampleMission";

new class ExampleLauncher extends BaseLauncher {

    constructor() { super(ExampleMission); }

    protected onStartEvent(): void {
        if (Save.GetInt("TOTAL_MISSION_PASSED", 0) > 4)
            exit();
        this.setPosition(2452.3093, -1649.698, 13.4468);
        //this.setClockHourRange(22, 2);
    }

    protected onMissionLaunchEvent(): boolean {
        return this.playerChar.isStopped() && this.playerChar.isOnFoot();
    }

    protected onMissionEndEvent(hasSuccess: boolean): boolean {
        if (hasSuccess)
            return 5 > Save.IncreaseInt("TOTAL_MISSION_PASSED", 0, true);
        return true;
    }

}