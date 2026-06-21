import { BaseMission } from "../BaseMission";

export class MISS000 extends BaseMission {

    public onStartEvent(): void {
        //this.enableProgressSaving = false;
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