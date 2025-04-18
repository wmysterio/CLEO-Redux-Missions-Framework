/// <reference path="../../.config/sa.d.ts" />

import { BaseScriptedScene } from "../BaseScriptedScene";
import { ScriptedClips } from "../ScriptedClips";

let sceneCar: Car;
let sceneChar: Char;

export class ExampleScriptedScene2 extends BaseScriptedScene {

	protected onLoadEvent(): void {
		this.setCameraPosition(2447.998, -1656.2468, 13.3047);
		this.setCameraPoint(2434.3547, -1645.7083, 13.5132);
		this.loadModelsNow(400, 101); // LANDSTAL WMYST
		sceneCar = this.addCar(400, 2420.3801, -1660.4674, 12.9916, 271.7204);
		sceneChar = this.addCharInsideCar(101, sceneCar);
	}

	protected onSetClipsEvent(clips: ScriptedClips): void {
		clips
			.wait(2900)
			.action(function () {
				Task.CarDriveToCoord(sceneChar, sceneCar, 2471.1074, -1662.801, 12.3246, 5.0, 0, 0, 0);
			})
			.wait(100)
			.action(() => {
				this.setCameraPoint(2433.967, -1657.6388, 13.3828, 1);
			})
			.wait(6000);
	}

	protected onUnloadEvent(): void {
		this.unloadModels(400, 101); // LANDSTAL WMYST
		this.playerChar.setCoordinates(2443.4963, -1651.0734, 12.402).setHeading(186.0984);
	}

}