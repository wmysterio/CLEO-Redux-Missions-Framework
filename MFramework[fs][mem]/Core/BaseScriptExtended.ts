/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.config/sa.d.ts" />

import { BaseScript } from "./BaseScript";
import { Dialog } from "./Dialog";

/** A base script class with extended used commands */
export abstract class BaseScriptExtended extends BaseScript {

    private baseScriptExtendedDialog: Dialog;

    constructor() {
        super();
        this.baseScriptExtendedDialog = new Dialog();
    }

    /** Returns a dynamic dialog from the "Dialog" module */
    protected get dialog(): Dialog {
        return this.baseScriptExtendedDialog;
    }

    /** Returns an empty decision maker with no event responses (for chars) */
    protected createEmptyDecisionMakerChar(): DecisionMakerChar {
        let dm = DecisionMakerChar.Load(0);
        for (let i = 0; i < 95; ++i)
            dm.clearEventResponse(i);
        return dm;
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
        Camera.SetZoom(1);
    }

    /** Resets some HUD elements to their default state */
    protected resetHud(): void {
        Hud.DisplayZoneNames(true);
        Hud.DisplayCarNames(true);
        Hud.DisplayRadar(true);
        Hud.Display(true);
        Hud.SwitchWidescreen(false);
    }

    /** Restores some player parameters after a scripted scene */
    protected restorePlayerAfterScriptedScene(): void {
        this.playerChar.hideWeaponForScriptedCutscene(false).shutUp(false).setCanBeKnockedOffBike(false)
            .clearTasks().clearLookAt().stopFacialTalk();
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

    /** Synchronously loads weapon models by weapon type */
    protected loadWeaponModelsNow(...weaponTypes: int[]): void {
        weaponTypes.forEach(weaponType => {
            Streaming.RequestModel(Weapon.GetModel(weaponType));
        });
        Streaming.LoadAllModelsNow();
    }

    /** Releases the specified weapon models by weapon type, freeing game memory */
    protected unloadWeaponModels(...weaponTypes: int[]): void {
        weaponTypes.forEach(weaponType => {
            Streaming.MarkModelAsNoLongerNeeded(Weapon.GetModel(weaponType));
        });
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
                    needContinue = true;
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

    /** Requests loading of new vehicle mod models. Continues if all requested models are available for creation */
    protected loadVehicleMods(...models: int[]): void {
        models.forEach(modelId => { Streaming.RequestVehicleMod(modelId); });
        let needContinue = false;
        do {
            wait(0);
            needContinue = false;
            models.forEach(modelId => {
                if (!Streaming.HasVehicleModLoaded(modelId))
                    needContinue = true;
            });
        } while (needContinue);
    }

    /** Unloads the specified vehicle mod models, freeing up game memory */
    protected unloadVehicleMods(...models: int[]): void {
        models.forEach(modelId => { Streaming.MarkVehicleModAsNoLongerNeeded(modelId); });
    }

    /** Places a character facing another character */
    protected placeCharFacingAnotherChar(char: Char, target: Char, relativeDistance: float = 1.0): void {
        let position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        char.setCoordinates(position.x, position.y, position.z).setHeading(target.getHeading() + 180.0);
    }

}