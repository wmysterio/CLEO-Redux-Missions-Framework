import { BaseScriptedScene } from "../BaseScriptedScene";
import { WMYST } from "../Models";

export class ScriptedSceneExample1 extends BaseScriptedScene {

    private actorA: Char;
    private actorB: Char;

    public onStartEvent(): void {
        this.refreshArea(2452.3093, -1649.698, 13.4468, 100.0);
        this.voiceAudio.load(3);
        this.playerChar.warpFromCarToCoord(2462.7354, -1633.2842, 13.4049);
        this.setCameraPosition(2463.5056, -1659.7773, 16.2698);
        this.lookCameraAt(2452.2646, -1649.2939, 13.6653);
        this.loadModelsNow(WMYST, 3065);
        this.addScriptObject(3065, 2448.4094, -1652.7698, 12.3482);
        this.actorA = this.addChar(WMYST, 2450.2615, -1650.9594, 12.4039, 272.5792);
        this.actorB = this.addCharFacingChar(0, this.actorA);
        this.unloadModels(WMYST, 3065);
        Task.ChatWithChar(this.actorA, this.actorB, true, 1);
        Task.ChatWithChar(this.actorB, this.actorA, false, 1);
        this.preventFadeToTransparentAtEnd = true;
    }

    public onRunEvent(): void {
        this.wait(1000)
            .action(() => {
                this.voiceAudio.playNextWithMessage(2000, "SCENE01");
            })
            .wait(this.voiceAudio.getTrackDuration(0, 2000))
            .action(() => {
                Camera.SetVectorMove(2463.5056, -1659.7773, 16.2698, 2441.9321, -1665.7759, 14.4861, 4000, false);
                Camera.SetVectorTrack(2452.2646, -1649.2939, 13.6653, 2452.2646, -1649.2939, 13.6653, 4000, false);
                this.voiceAudio.playNextWithMessage(4000, "SCENE02");
            })
            .waitUntil(this.isCameraMoving)
            .action(() => {
                Camera.ResetNewScriptables();
                this.setCameraPosition(2441.9321, -1665.7759, 14.4861);
                this.lookCameraAt(2452.2646, -1649.2939, 13.6653);
                this.voiceAudio.playNextWithMessage(2000, "SCENE03");
            })
            .wait(this.voiceAudio.getTrackDuration(2, 2000));
    }

}