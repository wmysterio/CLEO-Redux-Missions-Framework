/// <reference path="../../.config/sa.d.ts" />

//import { BaseCheckpointRace } from "../Modules/Racing/BaseCheckpointRace";
//import { BaseCopsRace } from "../Modules/Racing/BaseCopsRace";
//import { BaseRadarRace } from "../Modules/Racing/BaseRadarRace";
//import { BaseCircuitRace } from "../Modules/Racing/BaseCircuitRace";
//import { BaseLapKnockoutRace } from "../Modules/Racing/BaseLapKnockoutRace";
//import { BaseSpeedTrapRace } from "../Modules/Racing/BaseSpeedTrapRace";
import { BaseSprintRace } from "../Modules/Racing/BaseSprintRace";


export class ExampleSubMission2 extends BaseSprintRace {

	protected onStartEvent(): void {
		this.setTitle("@CRS@00", true);
		super.onStartEvent();
	}

	protected onRaceBeforeStartEvent(): void {

		Camera.DoFade(1000, 0);
		wait(1000);

		this.setNextRestartPosition(2443.4963, -1651.0734, 12.402, 186.0984);

		//this.setBossPath(906, 0.92);

		this.addStreetRacer(400, 11.7631, -2665.104, 39.899, 3.7039, 0);
		this.addStreetRacer(400, 6.4237, -2666.1279, 39.9072, 3.9453);
		this.addStreetRacer(400, 12.1201, -2675.7891, 40.2367, 3.774);

		this.addRouteNodeAsCheckpoint(-14.9842, -2567.2539, 38.0168, 22.1499, 10.0, 6000);
		this.addRouteNodeAsCheckpoint(-54.9172, -2497.5383, 34.6945, 40.6622, 10.0, 6000);

	}

	protected onRaceBefore321GOEvent(): void {
		wait(1000);
		Camera.DoFade(1000, 1);
	}

	protected onRaceEndEvent(isFailed: boolean): void {
		Camera.DoFade(750, 0);
		wait(750);
		this.refreshArea(2443.4963, -1651.0734, 12.402);
		this.playerChar.warpFromCarToCoord(2443.4963, -1651.0734, 12.402).setHeading(186.0984);
		Camera.DoFade(1000, 0);
		wait(750);
	}


}