
import { BaseMission } from "../BaseMission";

new class MISSI02 extends BaseMission {

    public onCheckStartConditions(): boolean {
        return this.getStorylineProgress(0) > 0;
    }

    public onStartEvent(): void {
        this.enableProgressSaving = false;
        this.printText("INFO000", 5000);
    }

    public onUpdateEvent(): void {
        if (Pad.IsKeyPressed(9)) { // Tab
            this.complete();
        } else if (Pad.IsKeyPressed(50)) { // 2
            this.fail("INFO001");
        }
    }

}