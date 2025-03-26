/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { BlackListSubTestMission } from "./BlackListSubTestMission";



new class BlackList extends BaseMission {

    protected onStart() : void {
		this.setSubMissions( () => { new BlackListSubTestMission(); } );
	}

}
