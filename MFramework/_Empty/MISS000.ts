import { BaseMission } from "../BaseMission";

export class MISS000 extends BaseMission {

    public onStartEvent(): void {
        //this.enableProgressSaving = false;
        //this.addStage(stage0);
    }

    /*
    private stage0(): boolean {
        return false; // continue stage
        return true; //  next stage
    }
    */

    public onUpdateEvent(): void {
        if (Pad.IsKeyPressed(9)) { // Tab
            this.complete();
        } else if (Pad.IsKeyPressed(50)) { // 2
            this.fail();
        }
    }

    //public onCleanupEvent(): void { }

}