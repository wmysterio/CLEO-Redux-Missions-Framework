/// <reference path="../../.config/sa.d.ts" />

import { BaseLauncher } from "../BaseLauncher";

new class ExampleLauncher extends BaseLauncher {

    protected onStartEvent(): void {
        this.setPosition(2452.3093, -1649.698, 13.4468);
    }

    protected onBlipCreationEvent(): boolean {
        if (this.loadIntValue("TOTAL_MISSION_PASSED", 0, true) > 4)
            exit();
        return true;
    }

}