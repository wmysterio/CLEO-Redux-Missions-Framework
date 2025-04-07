/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { ExampleSubMission } from "./ExampleSubMission";

export class ExampleMission extends BaseMission {

	protected onStartEvent(): void {
		this.setSubMission(ExampleSubMission);
	}

}