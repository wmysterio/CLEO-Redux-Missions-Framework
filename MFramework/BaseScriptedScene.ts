/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseScript } from "./BaseScript";
import { player, playerChar } from "./Utils";

/** Base class for scripted scenes */
export abstract class BaseScriptedScene extends BaseScript {

    /** Reaction to the loading event */
    protected onLoadEvent(): void { }

    /** Reaction to the start of a script scene */
    protected onStartEvent(): void { }

    /** Reaction to the unloading event */
    protected onUnloadEvent(): void { }

    /**
     * Creates a new script object and adds it to the auto-delete list. You must load the model before creating
     * @param modelId Script object model id
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     * @returns Created script object
     */
    protected addCutsceneScriptObject(modelId: int, x: float, y: float, z: float): ScriptObject {
        return this.baseScriptedScenePrepareScriptObject(ScriptObject.Create(modelId, x, y, z,));
    }

    /**
     * Creates a new vehicle and adds it to the auto-delete list. You must load the model before creating
     * @param modelId Vehicle model id
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     * @param heading Z-angle
     * @param color1 Primary color
     * @param color2 Secondary color
     * @returns Created vehicle
     */
    protected addCutsceneCar(modelId: int, x: float, y: float, z: float, heading: float = 0.0, color1: int = 0, color2: int = 0): Car {
        return this.baseScriptedScenePrepareCar(Car.Create(modelId, x, y, z,).setHeading(heading).changeColor(color1, color2));
    }

    /**
     * Creates a new character and adds it to the auto-delete list. You must load the model before creating
     * @param modelId Character model id
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     * @param heading Z-angle
     * @returns Created actor
     */
    protected addCutsceneChar(modelId: int, x: float, y: float, z: float, heading: float = 0.0): Char {
        return this.baseScriptedScenePrepareChar(Char.Create(31, modelId, x, y, z).setHeading(heading));
    }

    /**
     * Creates a new character inside the vehicle and adds it to the auto-delete list. You must load the model before creating. The Vehicle must exist
     * @param modelId Character model id
     * @param car Vehicle
     * @param seat Seat ID. Use -1 to create a character in the driver's seat
     * @returns 
     */
    protected addCutsceneCharInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this.baseScriptedScenePrepareChar(Char.CreateInsideCar(car, 31, modelId));
        return this.baseScriptedScenePrepareChar(Char.CreateAsPassenger(car, 31, modelId, seat));
    }

    /**
     * Creates a new character facing the specified character and adds it to the auto-delete list. Model must be loaded before creation. Target must exist
     * @param modelId Character model id
     * @param target 
     * @param relativeDistance 
     * @returns 
     */
    protected addCutsceneCharInFrontOfChar(modelId: int, target: Char, relativeDistance: float = 1.0): Char {
        let position = target.getOffsetInWorldCoords(0.0, relativeDistance, 0.0);
        let heading = target.getHeading() + 180.0;
        return this.addCutsceneChar(modelId, position.x, position.y, position.z, heading);
    }



    /**
     * @param autoContol Use true if you want automatic control over script scene events, or false for manual control (e.g. for debugging)
     */
    constructor(autoContol: boolean = true) {
        super();
        this.baseScriptedSceneDecisionMakerChar = DecisionMakerChar.Load(0);
        if (autoContol) {
            World.SetPedDensityMultiplier(0.0);
            World.SetCarDensityMultiplier(0.0);
            Game.SetWantedMultiplier(0.0);
            Game.SetPoliceIgnorePlayer(player, true);
            Game.SetEveryoneIgnorePlayer(player, true);
            Hud.DisplayZoneNames(false);
            Hud.DisplayCarNames(false);
            player.setControl(false);
            Camera.DoFade(800, 0);
            while (Camera.GetFadingStatus())
                wait(199);
            playerChar.shutUp(true).hideWeaponForScriptedCutscene(true);
            this.onLoadEvent();
            Hud.DisplayRadar(false);
            Hud.Display(false);
            Hud.SwitchWidescreen(true);
            wait(800);
            this.clearText();
            Camera.DoFade(800, 1);
            this.onStartEvent();
            this.clearText();
            Camera.DoFade(800, 0);
            while (Camera.GetFadingStatus())
                wait(199);
            this.deleteCutsceneEntities();
            this.onUnloadEvent();
            wait(800);
            World.SetPedDensityMultiplier(1.0);
            World.SetCarDensityMultiplier(1.0);
            Game.SetWantedMultiplier(1.0);
            Game.SetPoliceIgnorePlayer(player, false);
            Game.SetEveryoneIgnorePlayer(player, false);
            player.setControl(true);
            playerChar.shutUp(false).hideWeaponForScriptedCutscene(false);
            this.resetHud();
            this.resetCamera();
            this.clearText();
            Camera.DoFade(800, 1);
            return;
        }
        this.onLoadEvent();
        this.onStartEvent();
        this.deleteCutsceneEntities();
        this.onUnloadEvent();
    }

    //----------------------------------------------------------------------------------------------------

    private baseScriptedSceneDecisionMakerChar: DecisionMakerChar = new DecisionMakerChar(-1);
    private baseScriptedSceneCharsArray: Array<Char> = new Array<Char>();
    private baseScriptedSceneCarsArray: Array<Car> = new Array<Car>();
    private baseScriptedSceneScriptObjectsArray: Array<ScriptObject> = new Array<ScriptObject>();

    //----------------------------------------------------------------------------------------------------

    private baseScriptedScenePrepareChar(char: Char): Char {
        this.baseScriptedSceneCharsArray.push(char);
        return char.shutUp(true).setHealth(10000).addArmor(100).setRelationship(0, 0).setRelationship(0, 31)
            .setProofs(true, true, true, true, true)
            .setDecisionMaker(+this.baseScriptedSceneDecisionMakerChar);
    }

    private baseScriptedScenePrepareCar(car: Car): Car {
        this.baseScriptedSceneCarsArray.push(car);
        return car.setHealth(10000).setCanBurstTires(false).lockDoors(1)
            .setProofs(true, true, true, true, true);
    }

    private baseScriptedScenePrepareScriptObject(scriptObject: ScriptObject): ScriptObject {
        this.baseScriptedSceneScriptObjectsArray.push(scriptObject);
        return scriptObject.setHealth(10000).setProofs(true, true, true, true, true);
    }

    private deleteCutsceneEntities(): void {
        this.baseScriptedSceneScriptObjectsArray.forEach(obj => { obj.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneCharsArray.forEach(char => { char.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneCarsArray.forEach(car => { car.markAsNoLongerNeeded().delete(); });
        this.baseScriptedSceneDecisionMakerChar.remove();
    }

}