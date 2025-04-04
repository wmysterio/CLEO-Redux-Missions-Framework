/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { playerChar } from "./Utils";

/** A base script class with commonly used commands */
export abstract class BaseScript {

    /** Clear the screen of all text */
    protected clearText(): void {
        Text.ClearThisPrintBigNow(1);
        Text.ClearThisPrintBigNow(2);
        Text.ClearHelp();
        Text.ClearPrints();
        Text.ClearSmallPrints();
    }

    /** Resets camera behavior to default values */
    protected resetCamera(): void {
        Camera.ResetNewScriptables()
        Camera.RestoreJumpcut();
        Camera.SetBehindPlayer();
    }

    /** Sets the camera fixed position */
    protected setCameraPosition(x: float, y: float, z: float): void {
        Camera.SetFixedPosition(x, y, z, 0.0, 0.0, 0.0);
    }

    /** Sets the camera look at position */
    protected setCameraPoint(x: float, y: float, z: float, switchStyle: int = 2): void {
        Camera.PointAtPoint(x, y, z, switchStyle);
    }

    /** Returns true if the camera is moving in position or if the camera is moving in angle */
    protected isCameraVectorsMoveOrTrackRunning(): boolean {
        return Camera.IsVectorMoveRunning() || Camera.IsVectorTrackRunning();
    }

    /** Loads a scene and requests a collision at point */
    protected refreshArea(x: float, y: float, z: float): void {
        Streaming.RequestCollision(x, y);
        Streaming.LoadScene(x, y, z);
    }

    /** Resets some HUD elements to their default state */
    protected resetHud(): void {
        Hud.DisplayZoneNames(true);
        Hud.DisplayCarNames(true);
        Hud.DisplayRadar(true);
        Hud.Display(true);
        Hud.SwitchWidescreen(false);
    }

    /** Requests loading of new models. Continues if all requested models are available for creation */
    protected loadModels(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestModel(modelId); });
        let needContinue = false;
        do {
            wait(0);
            needContinue = false;
            models.forEach(modelId => {
                if (!Streaming.HasModelLoaded(modelId))
                    needContinue = true; // continue;
            });
        } while (needContinue);
    }

    /** Loads requested models synchronously */
    protected loadModelsNow(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestModel(modelId); });
        Streaming.LoadAllModelsNow();
    }

    /** Releases the specified models, freeing game memory */
    protected unloadModels(...models: int[]): void {
        models.forEach(modelId => { Streaming.MarkModelAsNoLongerNeeded(modelId); });
    }

}