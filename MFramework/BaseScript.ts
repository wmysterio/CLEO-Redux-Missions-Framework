/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

/** A base script class with commonly used commands */
export abstract class BaseScript {

    private baseScriptPlayer: Player;
    private baseScriptPlayerChar: Char;

    /** The player */
    protected get player(): Player {
        return this.baseScriptPlayer;
    }

    /** The player character */
    protected get playerChar(): Char {
        return this.baseScriptPlayerChar;
    }

    constructor() {
        this.baseScriptPlayer = new Player(0);
        this.baseScriptPlayerChar = this.baseScriptPlayer.getChar();
    }



    /** Returns true if the player is not found, not playing, dead, or arrested */
    protected isPlayerNotPlaying(): boolean {
        return !this.baseScriptPlayer.isPlaying() || !Char.DoesExist(+this.baseScriptPlayerChar) || Char.IsDead(+this.baseScriptPlayerChar) || this.baseScriptPlayerChar.hasBeenArrested();
    }

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
    protected isCameraVectorMoveOrVectorTrackRunning(): boolean {
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

    /** Places a character facing another character */
    protected placeCharFacingAnotherChar(char: Char, target: Char, relativeDistance: float = 1.0): void {
        let position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        char.setCoordinates(position.x, position.y, position.z).setHeading(target.getHeading() + 180.0);
    }

    /** Returns true if the current hour of the game clock is within the specified range */
    protected isClockHourInRange(left: int, right: int): boolean {
        let hour = Clock.GetTimeOfDay().hours;
        if (right > left)
            return hour >= left && right > hour;
        return hour >= left || right > hour;
    }

}