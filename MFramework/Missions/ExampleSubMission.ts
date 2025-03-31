/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { player } from "../Utils";
import { ExampleScriptScene } from "./ExampleScriptScene";

export class ExampleSubMission extends BaseMission {

	protected onStartEvent(): void {
		//this.setCashReward( 5000 );
		this.setTitle("Example Sub Mission");
		this.stage = 0; // WHF?
	}

	protected onUpdateEvent(): void {
		switch (this.stage) {
			case 0:
				this.playScriptedScene(ExampleScriptScene);
				player.setControl(true);
				Text.PrintFormattedNow("Press 'Tab' key to cimplete or '2' key to fail.", 6000)
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

	private stage: int = 0; // By default not equal 0. Set in 'onStartEvent' method. Nice...

}