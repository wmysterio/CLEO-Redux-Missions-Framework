import { BaseMission } from "../BaseMission";
import { ScriptedSceneExample1 } from "./ScriptedSceneExample1";
import { ScriptedSceneExample2 } from "./ScriptedSceneExample2";

new class MISSI02 extends BaseMission {

    public onStartEvent(): void {
        //this.enableProgressSaving = false;
        this.playScriptedScene(ScriptedSceneExample1);
        this.playScriptedScene(ScriptedSceneExample2);
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