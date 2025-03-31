/// <reference path="../../.config/sa.d.ts" />

import { BaseScriptedScene } from "../BaseScriptedScene";
import { playerChar } from "../Utils";

export class ExampleScriptScene extends BaseScriptedScene {

	protected onLoadEvent(): void {
		// loading...

		World.ClearArea(2452.3093, -1649.698, 13.4468, 100.0, true);
		this.refreshArea(2452.3093, -1649.698, 13.4468);
		playerChar.warpFromCarToCoord(2462.7354, -1633.2842, 13.4049);
		Camera.SetFixedPosition(2463.5056, -1659.7773, 16.2698, 0.0, 0.0, 0.0);
		Camera.PointAtPoint(2452.2646, -1649.2939, 13.6653, 2);
	}

	protected onStartEvent(): void {
		wait(1000);
		Text.PrintFormattedNow("Dialog 1", 2000);
		wait(2000);
		Camera.SetVectorMove(2463.5056, -1659.7773, 16.2698, 2441.9321, -1665.7759, 14.4861, 4001, false);
		Camera.SetVectorTrack(2452.2646, -1649.2939, 13.6653, 2452.2646, -1649.2939, 13.6653, 4001, false);
		Text.PrintFormattedNow("Dialog 2", 4000);
		wait(4000);
		Camera.ResetNewScriptables();
		this.setCameraPosition(2441.9321, -1665.7759, 14.4861);
		Camera.PointAtPoint(2452.2646, -1649.2939, 13.6653, 2);
		Text.PrintFormattedNow("Dialog 3", 2000);
		wait(2000);
	}

	protected onUnloadEvent(): void {
		// unloading...

		playerChar.setCoordinates(2443.4963, -1651.0734, 12.402).setHeading(186.0984);
	}

}