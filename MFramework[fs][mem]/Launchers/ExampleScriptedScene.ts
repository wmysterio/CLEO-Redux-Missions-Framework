/// <reference path="../../.config/sa.d.ts" />

import { BaseScriptedScene } from "../BaseScriptedScene";
import { WMYST } from "../Models";
import { ScriptedClips } from "../ScriptedClips";

export class ExampleScriptedScene extends BaseScriptedScene {

	private actorA: Char;
	private actorB: Char;

	protected onLoadEvent(): void {
		World.ClearArea(2452.3093, -1649.698, 13.4468, 100.0, true);
		this.refreshArea(2452.3093, -1649.698, 13.4468);
		this.audioVoices.load(3);
		this.playerChar.warpFromCarToCoord(2462.7354, -1633.2842, 13.4049);
		this.setCameraPosition(2463.5056, -1659.7773, 16.2698);
		this.setCameraPoint(2452.2646, -1649.2939, 13.6653);
		this.loadModelsNow(WMYST, 3065); // BALL
		this.addScriptObject(3065, 2448.4094, -1652.7698, 12.3482);
		this.actorA = this.addChar(101, 2450.2615, -1650.9594, 12.4039, 272.5792);
		this.actorB = this.addCharInFrontOfChar(0, this.actorA);
		Task.ChatWithChar(this.actorA, this.actorB, true, 1);
		Task.ChatWithChar(this.actorB, this.actorA, false, 1);
	}

	protected onSetClipsEvent(clips: ScriptedClips): void {
		clips
			.wait(1000)
			.action(() => {
				this.audioVoices.playNextWithMessage(2000, "@CRS@01", true);
			})
			.wait(this.audioVoices.getDurationByNumber(0, 2000))
			.action(() => {
				Camera.SetVectorMove(2463.5056, -1659.7773, 16.2698, 2441.9321, -1665.7759, 14.4861, 4000, false);
				Camera.SetVectorTrack(2452.2646, -1649.2939, 13.6653, 2452.2646, -1649.2939, 13.6653, 4000, false);
				this.audioVoices.playNextWithMessage(4000, "@CRS@02", true);
			})
			.waitUntil(this.isCameraVectorMoveOrVectorTrackRunning)
			.action(() => {
				Camera.ResetNewScriptables();
				this.setCameraPosition(2441.9321, -1665.7759, 14.4861);
				this.setCameraPoint(2452.2646, -1649.2939, 13.6653);
				this.audioVoices.playNextWithMessage(2000, "@CRS@03", true);
			})
			.wait(this.audioVoices.getDurationByNumber(2, 2000));
	}

	protected onUnloadEvent(): void {
		this.unloadModels(WMYST, 3065); // BALL
		this.audioVoices.unload();
	}

}