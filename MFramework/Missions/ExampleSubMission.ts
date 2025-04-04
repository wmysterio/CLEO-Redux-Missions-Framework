/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleScriptedScene } from "./ExampleScriptedScene";
import { ExampleScriptedScene2 } from "./ExampleScriptedScene2";

export class ExampleSubMission extends BaseMission {

	private stage: int;

	protected onStartEvent(): void {
		//this.setCashReward( 5000 );
		this.setTitle("@CRS@00", true);
		this.stage = 0;
	}

	protected onUpdateEvent(): void {
		switch (this.stage) {
			case 0:
				this.playScriptedScene(ExampleScriptedScene);
				Camera.DoFade(0, 0);
				this.playScriptedScene(ExampleScriptedScene2);
				Text.PrintFormattedNow("~s~Press ~g~Tab~s~ to succeed or ~r~2~s~ to fail.", 6000);
				this.stage = 1;
				return;
			case 1:
				if (Pad.IsKeyPressed(50)) // 2
					this.fail("~r~Don't press the '2' key!");
				if (Pad.IsKeyPressed(9)) // tab
					this.complete();
				return;
		}
	}

}