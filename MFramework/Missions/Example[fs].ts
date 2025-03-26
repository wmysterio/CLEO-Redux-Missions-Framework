/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleSubMission } from "./ExampleSubMission";

new class ExampleMission extends BaseMission {

	protected onStartEvent(): void {
		this.setSubMissions(() => { new ExampleSubMission(); });
	}

}