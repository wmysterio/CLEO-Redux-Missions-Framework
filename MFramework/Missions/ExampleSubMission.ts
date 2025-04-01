/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleScriptedScene } from "./ExampleScriptedScene";

export class ExampleSubMission extends BaseMission {

	private stage: int = 0; // By default not equal 0. Set in 'onStartEvent' method. Nice...

	protected onStartEvent(): void {
		//this.setCashReward( 5000 );
		this.setTitle("@CRS@00", true);
		this.stage = 0; // WTF?
	}

	protected onUpdateEvent(): void {
		switch (this.stage) {
			case 0:
				this.playScriptedScene(ExampleScriptedScene);
				Text.PrintFormattedNow("Press 'Tab' key to complete or '2' key to fail.", 6000);
				this.stage = 1;
				return;
			case 1:
				if (Pad.IsKeyPressed(50)) // 2
					this.fail("Don't press the '2' key");
				if (Pad.IsKeyPressed(9)) // tab
					this.complete();
				return;
		}
	}

}