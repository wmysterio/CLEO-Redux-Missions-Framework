/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleSubMission } from "./ExampleSubMission";
import { ExampleSubMission2 } from "./ExampleSubMission2";

export class ExampleMission extends BaseMission {

	protected onStartEvent(): void {
		this.setSubMission(ExampleSubMission);
		//this.setSubMission(ExampleSubMission2);
	}

}