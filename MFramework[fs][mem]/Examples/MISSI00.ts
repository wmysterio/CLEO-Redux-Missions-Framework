import { BaseMission } from "../BaseMission";
import { BALLAS1, FAM1, WMYST } from "../Models";

new class MISSI00 extends BaseMission {

	private friend: Char;
	private enemy: Char;

	public onStartEvent(): void {
		//this.enableProgressSaving = false;

		this.refreshArea(2152.2673, -2383.8313, 13.5469, 30.0);
		this.putPlayerAt(2152.2673, -2383.8313, 13.5469, 322.0863);
		this.resetCamera();

		this.loadModelsNow(FAM1, BALLAS1, WMYST);
		this.friend = this.addFriendChar(FAM1, 2166.6123, -2371.3142, 13.5469, 111.5243);
		this.enemy = this.addEnemyChar(BALLAS1, 2163.1133, -2367.5481, 13.5469, 144.1113);
		this.addNeutralChar(WMYST, 2155.5918, -2363.8733, 13.5469, 164.7914);
		this.unloadModels(FAM1, BALLAS1, WMYST);

		this.printText("INFO002", 5000);
	}

	public onUpdateEvent(): void {
		if (this.isCharDead(this.friend))
			this.fail("INFO003");
		if (this.isCharDead(this.enemy))
			this.complete();
	}

}