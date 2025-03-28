/// <reference path="../../.config/sa.d.ts" />

import { BaseLauncher } from "../BaseLauncher";
import { playerChar } from "../Utils";
import { ExampleMission } from "./ExampleMission";

new class ExampleLauncher extends BaseLauncher {

    constructor() { super(ExampleMission); }

    protected onStartEvent(): void {
        if (this.loadIntValue("TOTAL_MISSION_PASSED", 0, true) > 4)
            exit();
        this.setPosition(2452.3093, -1649.698, 13.4468);
    }

    protected onMissionLaunchEvent(): boolean {
        return playerChar.isStopped() && playerChar.isOnFoot();
    }

    protected onMissionDoneEvent(hasSuccess: boolean): boolean {
        if (hasSuccess) {
            let totalMissionPassed = this.saveIntValueIncrease("TOTAL_MISSION_PASSED", 0, true);
            return 5 > totalMissionPassed;
        }
        return true;
    }

}