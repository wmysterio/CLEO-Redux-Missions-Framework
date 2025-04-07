/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseScript } from "./BaseScript";
import { ScriptedClips } from "./ScriptedClips";

/** Base class for scripted scenes */
export abstract class BaseScriptedScene extends BaseScript {

    private baseScriptedSceneDecisionMakerChar: DecisionMakerChar;
    private baseScriptedSceneCharsArray: Char[];
    private baseScriptedSceneCarsArray: Car[];
    private baseScriptedSceneScriptObjectsArray: ScriptObject[];

    /** @param debugMode Use true for manual control (e.g. for debugging) */
    constructor(debugMode: boolean = false) {
        super();
        this.baseScriptedSceneCharsArray = new Array<Char>();
        this.baseScriptedSceneCarsArray = new Array<Car>();
        this.baseScriptedSceneScriptObjectsArray = new Array<ScriptObject>();
        this.baseScriptedSceneDecisionMakerChar = this.createEmptyDecisionMakerChar();
        let clips = new ScriptedClips();
        if (debugMode) {
            this.onLoadEvent();
            this.onSetClipsEvent(clips);
            if (clips !== undefined) {
                Game.AllowPauseInWidescreen(true);
                ScriptedClips.Play(clips);
                Game.AllowPauseInWidescreen(false);
            }
            this.baseScriptedSceneDeleteEntities();
            this.onUnloadEvent();
            return;
        }
        World.SetPedDensityMultiplier(0.0);
        World.SetCarDensityMultiplier(0.0);
        Game.SetWantedMultiplier(0.0);
        Game.SetPoliceIgnorePlayer(this.player, true);
        Game.SetEveryoneIgnorePlayer(this.player, true);
        Hud.DisplayZoneNames(false);
        Hud.DisplayCarNames(false);
        this.player.setControl(false);
        Camera.DoFade(800, 0);
        while (Camera.GetFadingStatus())
            wait(199);
        this.playerChar.shutUp(true).hideWeaponForScriptedCutscene(true).stopFacialTalk()
            .clearTasksImmediately().clearLookAt();
        this.onLoadEvent();
        Hud.DisplayRadar(false);
        Hud.Display(false);
        Hud.SwitchWidescreen(true);
        wait(800);
        this.clearText();
        Camera.DoFade(800, 1);
        this.onSetClipsEvent(clips);
        if (clips !== undefined) {
            Game.AllowPauseInWidescreen(true);
            ScriptedClips.Play(clips);
            Game.AllowPauseInWidescreen(false);
        }
        this.clearText();
        Camera.DoFade(800, 0);
        while (Camera.GetFadingStatus())
            wait(199);
        this.baseScriptedSceneDeleteEntities();
        this.onUnloadEvent();
        wait(800);
        World.SetPedDensityMultiplier(1.0);
        World.SetCarDensityMultiplier(1.0);
        Game.SetWantedMultiplier(1.0);
        Game.SetPoliceIgnorePlayer(this.player, false);
        Game.SetEveryoneIgnorePlayer(this.player, false);
        this.player.setControl(true);
        this.restorePlayerAfterScriptedScene();
        this.playerChar.clearTasksImmediately();
        this.resetHud();
        this.resetCamera();
        this.clearText();
        Camera.DoFade(800, 1);
    }

    /** Reaction to the loading event */
    protected onLoadEvent(): void { }

    /** Reaction to the unloading event */
    protected onUnloadEvent(): void { }

    /**
     * Reaction to the creation of scripted clips
     * @param clips Playlist for adding clips
     */
    protected onSetClipsEvent(clips: ScriptedClips): void { }



    /** Creates a new script object and adds it to the auto-delete list. You must load the model before creating */
    protected addScriptObject(scriptObjectModelId: int, x: float, y: float, z: float): ScriptObject {
        return this.baseScriptedScenePrepareScriptObject(ScriptObject.Create(scriptObjectModelId, x, y, z));
    }

    /** Creates a new vehicle and adds it to the auto-delete list. You must load the model before creating */
    protected addCar(carModelId: int, x: float, y: float, z: float, heading: float = 0.0, color1: int = 0, color2: int = 0): Car {
        return this.baseScriptedScenePrepareCar(Car.Create(carModelId, x, y, z).setHeading(heading).changeColor(color1, color2));
    }

    /** Creates a new character and adds it to the auto-delete list. You must load the model before creating */
    protected addChar(charModelId: int, x: float, y: float, z: float, heading: float = 0.0): Char {
        return this.baseScriptedScenePrepareChar(Char.Create(31, charModelId, x, y, z).setHeading(heading));
    }

    /** Creates a new character inside the vehicle and adds it to the auto-delete list. You must load the model before creating. The Vehicle must exist */
    protected addCharInsideCar(charModelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this.baseScriptedScenePrepareChar(Char.CreateInsideCar(car, 31, charModelId));
        return this.baseScriptedScenePrepareChar(Char.CreateAsPassenger(car, 31, charModelId, seat));
    }

    /** Creates a new character facing the specified character and adds it to the auto-delete list. Model must be loaded before creation. Target must exist */
    protected addCharInFrontOfChar(charModelId: int, target: Char, relativeDistance: float = 1.0): Char {
        let position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        return this.addChar(charModelId, position.x, position.y, position.z, target.getHeading() + 180.0);
    }



    private baseScriptedScenePrepareChar(char: Char): Char {
        this.baseScriptedSceneCharsArray.push(char);
        return char.shutUp(true).setHealth(10000).addArmor(100).setRelationship(0, 0).setRelationship(0, 31)
            .setProofs(true, true, true, true, true).setMoney(0).setDropsWeaponsWhenDead(false)
            .setDecisionMaker(+this.baseScriptedSceneDecisionMakerChar);
    }

    private baseScriptedScenePrepareCar(car: Car): Car {
        this.baseScriptedSceneCarsArray.push(car);
        return car.setHealth(10000).setCanBurstTires(false).lockDoors(1).setProofs(true, true, true, true, true);
    }

    private baseScriptedScenePrepareScriptObject(scriptObject: ScriptObject): ScriptObject {
        this.baseScriptedSceneScriptObjectsArray.push(scriptObject);
        return scriptObject.setHealth(10000).setProofs(true, true, true, true, true);
    }

    private baseScriptedSceneDeleteEntities(): void {
        this.baseScriptedSceneScriptObjectsArray.forEach(obj => { obj.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneCharsArray.forEach(char => { char.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneCarsArray.forEach(car => { car.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneDecisionMakerChar.remove();
    }

}