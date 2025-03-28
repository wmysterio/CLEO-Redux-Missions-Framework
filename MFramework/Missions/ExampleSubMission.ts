/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { playerChar } from "../Utils";

export class ExampleSubMission extends BaseMission {

	protected onStartEvent(): void {
		//this.setCashReward( 5000 );
		World.ClearArea(2459.4629, -1660.1523, 13.3047, 300.0, true);
		playerChar.setCoordinates(2459.4629, -1660.1523, 13.3047).setHeading(41.9871);
		Text.PrintHelpFormatted("Start");
	}

	protected onUpdateEvent(): void {
		if (Pad.IsKeyPressed(50)) // 2
			this.fail("Don't press the '2' key");
		if (Pad.IsKeyPressed(9)) // tab
			this.complete();
	}

}