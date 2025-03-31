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
     * Loads a scene and requests a collision at point
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected refreshArea(x: float, y: float, z: float): void {
        Streaming.RequestCollision(x, y);
        Streaming.LoadScene(x, y, z);
    }

}