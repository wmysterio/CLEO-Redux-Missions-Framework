/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleScriptedScene } from "./ExampleScriptedScene";
import { ExampleScriptedScene2 } from "./ExampleScriptedScene2";

export class ExampleSubMission extends BaseMission {

	private stage: int;

	protected onStartEvent(): void {
		//this.setCashReward( 5000 );
		this.setTitle("@CRS@00", true);
		this.setNextRestartPosition(2443.4963, -1651.0734, 12.402, 186.0984);
		this.stage = 0;
	}

	private target: Char;
	private friend: Char;

	protected onUpdateEvent(): void {
		switch (this.stage) {
			case 0:
				this.playScriptedScene(ExampleScriptedScene);
				Camera.DoFade(0, 0);
				this.playScriptedScene(ExampleScriptedScene2);

				World.ClearArea(2435.2422, -1674.4182, 13.6572, 1.0, true);

				this.loadModelsNow(400); // LANDSTAL
				this.loadWeaponModelsNow(22);
				this.addCar(400, 2443.9675, -1668.3519, 13.0863, 65.4277);
				this.addPickupWithAmmo(22, 100, 2422.2898, -1667.1139, 13.5434, true);
				this.unloadModels(400); // LANDSTAL
				this.unloadWeaponModels(22);

				this.friend = this.addFriend(0, 2435.635, -1650.3596, 12.5469, 190.1485);
				this.target = this.addEnemy(0, 2435.2422, -1674.4182, 12.6572, 359.8532);
				this.addBlipForChar(this.target, false);
				this.addBlipForChar(this.friend, true).changeDisplay(1);
				this.playerGroup.setMember(this.friend);

				Text.PrintFormattedNow("~s~Kill the ~r~target~s~!", 6000);
				this.stage = 1;
				return;
			case 1:
				if (Char.IsDead(+this.friend))
					this.fail("~r~Friend is dead!");
				if (Char.IsDead(+this.target))
					this.complete();
				return;
		}
	}

}