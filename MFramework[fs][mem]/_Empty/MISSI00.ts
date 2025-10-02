import { BaseMission } from "../BaseMission";

new class MISSI00 extends BaseMission {

	//public onCheckStartConditions(): boolean {
	//	return true;
	//}

	public onStartEvent(): void {
		//this.enableProgressSaving = true;
	}

	public onUpdateEvent(): void {
		if (Pad.IsKeyPressed(9)) { // Tab
			this.complete();
		} else if (Pad.IsKeyPressed(50)) { // 2
			this.fail();
		}
	}

	//public onCleanupEvent(): void { }

}