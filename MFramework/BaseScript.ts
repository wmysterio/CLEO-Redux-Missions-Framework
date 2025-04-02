/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

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

    /**
     * Sets the camera fixed position
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected setCameraPosition(x: float, y: float, z: float): void { Camera.SetFixedPosition(x, y, z, 0.0, 0.0, 0.0); }

    /**
     * Sets the camera look at position
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     * @param switchStyle Style of the switch
     */
    protected setCameraPoint(x: float, y: float, z: float, switchStyle: int = 2): void {
        Camera.PointAtPoint(x, y, z, switchStyle);
    }

    /**
     * Loads a scene and requests a collision at point
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
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

    /**
     * Requests loading of new models. Continues if all requested models are available for creation
     * @param models List of model identifiers
     */
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

    /**
     * Loads requested models synchronously
     * @param models List of model identifiers
     */
    protected loadModelsNow(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestModel(modelId); });
        Streaming.LoadAllModelsNow();
    }

    /**
     * Releases the specified models, freeing game memory
     * @param models List of model identifiers
     */
    protected unloadModels(...models: int[]): void {
        models.forEach(modelId => { Streaming.MarkModelAsNoLongerNeeded(modelId); });
    }

}