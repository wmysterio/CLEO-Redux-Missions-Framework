/// Created by wmysterio, 27.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseScriptedScene } from "./BaseScriptedScene";
import { BaseScriptExtended } from "./BaseScriptExtended";
import { AudioPlayer } from "./Modules/AudioPlayer";

/** Base class for missions and sub-missions */
export abstract class BaseMission extends BaseScriptExtended {

    private baseMissionState: int;
    private baseMissionControllableErrorToForceMissionTermination: Error;
    private baseMissionSubMissionsFunction: Function;
    private baseMissionHasSubMissionsFunction: boolean;
    private baseMissionCashReward: int;
    private baseMissionRespectReward: int;
    private baseMissionTitleText: string;
    private baseMissionIsTitleTextAGxt: boolean;
    private baseMissionDefaultMissionFailureBigMessage: string;
    private baseMissionIsDefaultMissionFailureBigMessageAGxt: boolean;
    private baseMissionEnableMissionFailureBigMessage: boolean;
    private baseMissionDefaultMissionSuccessBigMessage: string;
    private baseMissionIsDefaultMissionSuccessBigMessageAGxt: boolean;
    private baseMissionEnableMissionSuccessBigMessage: boolean;
    private baseMissionMissionFailureReasonMessage: string;
    private baseMissionEnableMissionSuccessTune: boolean;
    private baseMissionEnableMissionFailureTime: int;
    private baseMissionIsMissionFailureReasonMessageAGxt: boolean;
    private baseMissionMissionPassedGxtKey: string;
    private baseMissionHasMissionSuccess: boolean;
    private baseMissionIsScriptedSceneActive: boolean;
    private baseMissionPlayerGroup: Group;
    private baseMissionDecisionsMakersChar: DecisionMakerChar[];
    private baseMissionCharsArray: Char[];
    private baseMissionCarsArray: Car[];
    private baseMissionScriptObjectsArray: ScriptObject[];
    private baseMissionBlipsArray: Blip[];
    private baseMissionPickupsArray: Pickup[];
    private baseMissionIsSavedPlayerWeapon: boolean;
    private baseMissionPlayerAmmo: int[];
    private baseMissionAudioBackground: AudioPlayer;

    /** The player group */
    protected get playerGroup(): Group {
        return this.baseMissionPlayerGroup;
    }
    /** The audio player for background music */
    protected get audioBackground(): AudioPlayer {
        return this.baseMissionAudioBackground;
    }



    constructor() {
        super();
        this.baseMissionPlayerGroup = this.player.getGroup();
        this.onInitEvent();
        ONMISSION = true;
        do {
            wait(0);
            if (this.isPlayerNotPlaying())
                this.baseMissionState = 3;
            switch (this.baseMissionState) {
                case 0:
                    this.baseMissionProcessStart();
                    continue;
                case 1:
                    this.baseMissionProcessUpdate();
                    continue;
                case 2:
                    this.baseMissionProcessSuccess();
                    continue;
                case 3:
                    this.baseMissionProcessFailure();
                    continue;
                case 4:
                    this.baseMissionProcessEnd();
                    continue;
            }
        } while (this.baseMissionState !== 5);
    }


    /** Saves the player's weapons and restores them after the mission is completed. After saving the weapons, all weapons are removed */
    protected savePlayerWeapon(): void {
        if (this.baseMissionIsSavedPlayerWeapon)
            return;
        this.baseMissionIsSavedPlayerWeapon = true;
        for (let i = 0; i < 47; ++i)
            this.baseMissionPlayerAmmo.push(this.playerChar.hasGotWeapon(i) ? this.playerChar.getAmmoInWeapon(i) : 0);
        this.playerChar.removeAllWeapons();
    }

    /** Reaction to the initialization event. Used for internal work of the framework  */
    protected onInitEvent(): void {
        this.baseMissionPlayerAmmo = new Array<int>();
        this.baseMissionIsSavedPlayerWeapon = false;
        this.baseMissionDecisionsMakersChar = new Array<DecisionMakerChar>();
        this.baseMissionCharsArray = new Array<Char>();
        this.baseMissionCarsArray = new Array<Car>();
        this.baseMissionScriptObjectsArray = new Array<ScriptObject>();
        this.baseMissionBlipsArray = new Array<Blip>();
        this.baseMissionPickupsArray = new Array<Pickup>();
        this.baseMissionSetupDecisionMakers();
        this.baseMissionState = 0;
        this.baseMissionControllableErrorToForceMissionTermination = new Error(); // thanks Seemann!
        this.baseMissionSubMissionsFunction = () => { };
        this.baseMissionHasSubMissionsFunction = false;
        this.baseMissionCashReward = 0;
        this.baseMissionRespectReward = 0;
        this.baseMissionTitleText = "DUMMY";
        this.baseMissionIsTitleTextAGxt = true;
        this.baseMissionDefaultMissionFailureBigMessage = "M_FAIL";
        this.baseMissionIsDefaultMissionFailureBigMessageAGxt = true;
        this.baseMissionEnableMissionFailureBigMessage = true;
        this.baseMissionDefaultMissionSuccessBigMessage = "M_PASSD";
        this.baseMissionIsDefaultMissionSuccessBigMessageAGxt = true;
        this.baseMissionEnableMissionSuccessBigMessage = true;
        this.baseMissionMissionFailureReasonMessage = "";
        this.baseMissionEnableMissionSuccessTune = true;
        this.baseMissionEnableMissionFailureTime = 0;
        this.baseMissionIsMissionFailureReasonMessageAGxt = false;
        this.baseMissionMissionPassedGxtKey = "";
        this.baseMissionHasMissionSuccess = false;
        this.baseMissionIsScriptedSceneActive = false;
        this.baseMissionAudioBackground = new AudioPlayer();
    }

    /** Reaction to the mission start event */
    protected onStartEvent(): void { }

    /** Reaction to the mission update event */
    protected onUpdateEvent(): void { }

    /** Reaction to mission success */
    protected onSuccessEvent(): void { }

    /** Reaction to mission failure */
    protected onFailureEvent(): void { }

    /** Reaction to mission cleanup */
    protected onCleanupEvent(): void { }


    /** Creates a new blip above the pickup and adds it to the auto-delete list. The car must exist */
    protected addBlipForPickup(pickup: Pickup, asFriendly: boolean = true, blipDisplay: int = 3): Blip {
        return this.baseMissionPrepareBlip(Blip.AddForPickup(pickup), asFriendly, blipDisplay);
    }

    /** Creates a new blip above the char and adds it to the auto-delete list. The car must exist */
    protected addBlipForChar(char: Char, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this.baseMissionPrepareBlip(Blip.AddForChar(char), asFriendly, blipDisplay);
    }

    /** Creates a new blip above the car and adds it to the auto-delete list. The car must exist */
    protected addBlipForCar(car: Car, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this.baseMissionPrepareBlip(Blip.AddForCar(car), asFriendly, blipDisplay);
    }

    /** Creates a new blip above the script object and adds it to the auto-delete list. The car must exist */
    protected addBlipForScriptObject(scriptObject: ScriptObject, asFriendly: boolean = false, blipDisplay: int = 3): Blip {
        return this.baseMissionPrepareBlip(Blip.AddForObject(scriptObject), asFriendly, blipDisplay);
    }

    /** Creates a new pickup and adds it to the auto-delete list. You must load the model before creating */
    protected addPickup(modelId: int, x: float, y: float, z: float): Pickup {
        let pickup = Pickup.Create(modelId, 3, x, y, z);
        this.baseMissionPickupsArray.push(pickup);
        return pickup;
    }

    /**
     * Creates a new weapon pickup and adds it to the auto-delete list. You must load the model before creating
     * @param playerAmmoLimit The player's total ammo will not exceed the specified value after pickup. If the player has more ammo, the pickup will be created in an inaccessible location
     */
    protected addPickupWithAmmo(weaponType: int, ammo: int, x: float, y: float, z: float, playerAmmoLimit: boolean = false): Pickup {
        if (playerAmmoLimit && this.playerChar.hasGotWeapon(weaponType)) {
            let weaponAmmo = this.playerChar.getAmmoInWeapon(weaponType);
            if (ammo > weaponAmmo) {
                ammo -= weaponAmmo;
            } else {
                z = -1000.0;
            }
        }
        let pickup = Pickup.CreateWithAmmo(Weapon.GetModel(weaponType), 3, ammo, x, y, z);
        this.baseMissionPickupsArray.push(pickup);
        return pickup;
    }

    /** Creates a new vehicle and adds it to the auto-delete list. You must load the model before creating */
    protected addCar(carModelId: int, x: float, y: float, z: float, heading: float = 0.0, color1: int = -1, color2: int = -1): Car {
        let car = Car.Create(carModelId, x, y, z).setHeading(heading).changeColor(color1, color2).lockDoors(1);
        this.baseMissionCarsArray.push(car);
        return car;
    }

    /** Creates a new script object and adds it to the auto-delete list. You must load the model before creating */
    protected addScriptObject(scriptObjectModelId: int, x: float, y: float, z: float): ScriptObject {
        let object = ScriptObject.Create(scriptObjectModelId, x, y, z);
        this.baseMissionScriptObjectsArray.push(object);
        return object;
    }

    /** Creates a new character with friendly AI and adds it to the auto-delete list. You must load the model before creating */
    protected addFriend(modelId, x: float, y: float, z: float, heading: float): Char {
        return this.baseMissionPrepareChar(Char.Create(24, modelId, x, y, z).setHeading(heading), 24, 25);
    }

    /** Creates a new character with enemy AI and adds it to the auto-delete list. You must load the model before creating */
    protected addEnemy(modelId, x: float, y: float, z: float, heading: float): Char {
        return this.baseMissionPrepareChar(Char.Create(25, modelId, x, y, z).setHeading(heading), 25, 24);
    }

    /** Creates a new character with friendly AI inside the vehicle and adds it to the auto-delete list. You must load the model before creating. The Vehicle must exist */
    protected addFriendInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this.baseMissionPrepareChar(Char.CreateInsideCar(car, 24, modelId), 24, 25)
        return this.baseMissionPrepareChar(Char.CreateAsPassenger(car, 24, modelId, seat), 24, 25);
    }

    /** Creates a new character with enemy AI inside the vehicle and adds it to the auto-delete list. You must load the model before creating. The Vehicle must exist */
    protected addEnemyInsideCar(modelId: int, car: Car, seat: int = -1): Char {
        if (seat === -1)
            return this.baseMissionPrepareChar(Char.CreateInsideCar(car, 25, modelId), 25, 24)
        return this.baseMissionPrepareChar(Char.CreateAsPassenger(car, 25, modelId, seat), 25, 24);
    }

    /** Removes all entities from the auto-delete list. If necessary, you can put the player in a safe place so that the player's potential car does not delete along with the player */
    protected deleteAllAddedEntities(elegantly: boolean = true, warpPlayerToSavePlace: boolean = false, xSavePlace: float = 0.0, ySavePlace: float = 0.0, zSavePlace: float = 0.0): void {
        if (warpPlayerToSavePlace)
            this.playerChar.warpFromCarToCoord(xSavePlace, ySavePlace, zSavePlace);
        this.baseMissionBlipsArray.forEach(blip => {
            if (Blip.DoesExist(+blip))
                blip.remove();
        });
        this.baseMissionPickupsArray.forEach(pickup => {
            if (Pickup.DoesExist(+pickup))
                pickup.remove();
        });
        if (elegantly) {
            this.baseMissionScriptObjectsArray.forEach(obj => {
                if (ScriptObject.DoesExist(+obj))
                    obj.markAsNoLongerNeeded().removeElegantly();
            });
            this.baseMissionCharsArray.forEach(char => {
                if (Char.DoesExist(+char)) {
                    if (char.isHealthGreater(100))
                        char.setHealth(100);
                    char.setProofs(false, false, false, false, false).setCanBeKnockedOffBike(false)
                        .setCantBeDraggedOut(false).setGetOutUpsideDownCar(true).setSuffersCriticalHits(false)
                        .setCanBeShotInVehicle(true).markAsNoLongerNeeded().removeElegantly();
                }
            });
        } else {
            this.baseMissionScriptObjectsArray.forEach(obj => {
                if (ScriptObject.DoesExist(+obj))
                    obj.markAsNoLongerNeeded().delete();
            });
            this.baseMissionCharsArray.forEach(char => {
                if (Char.DoesExist(+char))
                    char.markAsNoLongerNeeded().delete();
            });
        }
        if (warpPlayerToSavePlace) {
            this.baseMissionCarsArray.forEach(car => {
                car.markAsNoLongerNeeded().delete();
            });
        } else {
            this.baseMissionCarsArray.forEach(car => {
                this.baseMissionDeleteTheCarCarefully(car);
            });
        }
        this.baseMissionCharsArray = new Array<Char>();
        this.baseMissionCarsArray = new Array<Car>();
        this.baseMissionScriptObjectsArray = new Array<ScriptObject>();
        this.baseMissionBlipsArray = new Array<Blip>();
        this.baseMissionPickupsArray = new Array<Pickup>();
    }

    /** Begins a scripted scene */
    protected playScriptedScene<TScriptedScene extends BaseScriptedScene>(baseScriptedSceneType: new (bool) => TScriptedScene, debugMode: boolean = false): void {
        if (this.baseMissionIsScriptedSceneActive || this.baseMissionState !== 1)
            return;
        this.baseMissionIsScriptedSceneActive = true;
        new baseScriptedSceneType(debugMode);
        this.baseMissionIsScriptedSceneActive = false;
    }

    /** The current mission will execute the code of the specified mission */
    protected setSubMission<TMission extends BaseMission>(baseMissionType: new () => TMission): void {
        if (this.baseMissionHasSubMissionsFunction || this.baseMissionState !== 0)
            return;
        this.baseMissionHasSubMissionsFunction = true;
        this.baseMissionSubMissionsFunction = () => { return new baseMissionType().HasSuccess(); };
    }

    /** Sets a cash reward on success */
    protected setCashReward(money: int): void {
        this.baseMissionCashReward = money;
    }

    /** Increases respect on success */
    protected setRespectReward(respect: int): void {
        this.baseMissionRespectReward = respect;
    }

    /** Sets the mission title */
    protected setTitle(title: string, gxtKey: boolean = false): void {
        this.baseMissionTitleText = title;
        this.baseMissionIsTitleTextAGxt = gxtKey;
    }

    /** Disables text notification about mission failure */
    protected disableFailureBigMessage(): void {
        this.baseMissionEnableMissionFailureBigMessage = false;
    }

    /** Sets the default text notification for failure mission completion */
    protected setDefaultMissionFailureBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionFailureBigMessage = message;
        this.baseMissionIsDefaultMissionFailureBigMessageAGxt = gxtKey;
    }

    /** Turns off the sound notification about successful mission completion */
    protected disableMissionSuccessTune(): void {
        this.baseMissionEnableMissionSuccessTune = false;
    }

    /** Disables text notification about successful mission completion */
    protected disableMissionSuccessBigMessage(): void {
        this.baseMissionEnableMissionSuccessBigMessage = false;
    }

    /** Sets the default text notification for successful mission completion */
    protected setDefaultMissionSuccessBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionSuccessBigMessage = message;
        this.baseMissionIsDefaultMissionSuccessBigMessageAGxt = gxtKey;
    }

    /** Aborts the mission with a success notification */
    protected complete(missionNameGxt: string = ""): void {
        if (this.baseMissionState === 1) {
            Restart.CancelOverride();
            if (8 > missionNameGxt.length)
                this.baseMissionMissionPassedGxtKey = missionNameGxt;
            this.baseMissionState = 2;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

    /** Aborts the mission with a failure notification */
    protected fail(reasonMessage: string = "", failedMessageTime: int = 5000, gxtKey: boolean = false): void {
        if (this.baseMissionState === 1) {
            Restart.CancelOverride();
            if (gxtKey && reasonMessage.length > 7)
                gxtKey = false;
            this.baseMissionIsMissionFailureReasonMessageAGxt = gxtKey;
            this.baseMissionMissionFailureReasonMessage = reasonMessage;
            this.baseMissionEnableMissionFailureTime = failedMessageTime;
            this.baseMissionState = 3;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

    /** Sets the restart position in case of player death or arrest */
    protected setNextRestartPosition(x: float, y: float, z: float, heading: float = 0.0): void {
        if (this.baseMissionState === 0)
            Restart.OverrideNext(x, y, z, heading);
    }

    /** Checks whether the mission was successful */
    public HasSuccess(): boolean {
        return this.baseMissionHasMissionSuccess;
    }



    private baseMissionProcessStart(): void {
        this.clearText();
        this.onStartEvent();
        if (this.baseMissionHasSubMissionsFunction) {
            this.baseMissionHasMissionSuccess = this.baseMissionSubMissionsFunction();
            this.baseMissionState = 5;
            return;
        }
        Stat.RegisterMissionGiven();
        this.player.setGroupRecruitment(false);
        Stat.ShowUpdateStats(false);
        this.baseMissionPlayerGroup.remove();
        this.baseMissionMakeWorldComfortable();
        this.baseMissionAudioBackground.setVolume(0.1);
        this.baseMissionAudioBackground.play(0, true);
        if (this.baseMissionIsTitleTextAGxt) {
            Text.PrintBig(this.baseMissionTitleText, 1000, 2);
        } else {
            Text.PrintBigFormatted(this.baseMissionTitleText, 1000, 2);
        }
        this.baseMissionState = 1;
    }

    private baseMissionProcessUpdate(): void {
        if (!ONMISSION) {
            this.baseMissionState = 3;
            return;
        }
        try {
            this.onUpdateEvent();
        } catch (e) {
            if (e === this.baseMissionControllableErrorToForceMissionTermination)
                return;
            log(e.toString());
            this.baseMissionState = 3;
        }
    }

    private baseMissionProcessSuccess(): void {
        this.baseMissionProcessCleanup();
        if (this.baseMissionMissionPassedGxtKey.length > 1) {
            Stat.RegisterMissionPassed(this.baseMissionMissionPassedGxtKey);
        } else {
            Stat.IncrementIntNoMessage(147, 1);
        }
        if (this.baseMissionEnableMissionSuccessTune)
            Audio.PlayMissionPassedTune(1);
        this.baseMissionDisplaySuccessMessage();
        this.baseMissionState = 4;
        this.baseMissionHasMissionSuccess = true;
        this.onSuccessEvent();
    }
    private baseMissionDisplaySuccessMessage(): void {
        let flag = 0;
        //Stat.PlayerMadeProgress( 1 );
        if (this.baseMissionRespectReward > 0) {
            flag += 1;
            Stat.AwardPlayerMissionRespect(this.baseMissionRespectReward);
        }
        if (this.baseMissionCashReward > 0) {
            flag += 2;
            this.player.addScore(this.baseMissionCashReward);
        }
        if (!this.baseMissionEnableMissionSuccessBigMessage)
            return;
        switch (flag) {
            case 3:
                Text.PrintWithNumberBig("M_PASSS", this.baseMissionCashReward, 5000, 1); // Mission passed +$ +Respect
                return;
            case 2:
                Text.PrintWithNumberBig("M_PASS", this.baseMissionCashReward, 5000, 1); // Mission passed +$
                return;
            case 1:
                Text.PrintBig("M_PASSR", 5000, 1); // Mission passed +Respect
                return;
            default:
                if (this.baseMissionDefaultMissionSuccessBigMessage.length === 0)
                    return;
                if (this.baseMissionIsDefaultMissionSuccessBigMessageAGxt) {
                    Text.PrintBig(this.baseMissionDefaultMissionSuccessBigMessage, 5000, 1);
                    return;
                }
                Text.PrintBigFormatted(this.baseMissionDefaultMissionSuccessBigMessage, 5000, 1);
                return;
        }
    }

    private baseMissionProcessFailure(): void {
        this.baseMissionProcessCleanup();
        this.baseMissionDisplayFailedMessage();
        this.baseMissionState = 4;
        this.onFailureEvent();
    }

    private baseMissionDisplayFailedMessage(): void {
        this.baseMissionDisplayFailureBigMessage();
        if (1 > this.baseMissionEnableMissionFailureTime)
            return;
        if (this.baseMissionIsMissionFailureReasonMessageAGxt && this.baseMissionMissionFailureReasonMessage.length > 0) {
            Text.PrintNow(this.baseMissionMissionFailureReasonMessage, this.baseMissionEnableMissionFailureTime, 1);
            return;
        }
        Text.PrintFormattedNow(this.baseMissionMissionFailureReasonMessage, this.baseMissionEnableMissionFailureTime);
    }

    private baseMissionDisplayFailureBigMessage(): void {
        if (this.baseMissionDefaultMissionFailureBigMessage.length === 0)
            return;
        if (this.baseMissionEnableMissionFailureBigMessage) {
            if (this.baseMissionIsDefaultMissionFailureBigMessageAGxt) {
                Text.PrintBig(this.baseMissionDefaultMissionFailureBigMessage, 5000, 1);
                return;
            }
            Text.PrintBigFormatted(this.baseMissionDefaultMissionFailureBigMessage, 5000, 1);
        }
    }

    private baseMissionProcessCleanup(): void {
        this.clearText();
        this.deleteAllAddedEntities();
        this.baseMissionAudioBackground.unload();
        this.dialog.unload();
        this.baseMissionDecisionsMakersChar.forEach(dm => {
            dm.remove();
        });
        this.onCleanupEvent();
    }

    private baseMissionProcessEnd(): void {
        //this.resetCamera();
        this.restorePlayerWeapon();
        this.restorePlayerAfterScriptedScene();
        this.baseMissionRestoreWorld();
        World.SetPedDensityMultiplier(1.0);
        World.SetCarDensityMultiplier(1.0);
        Game.SetWantedMultiplier(1.0);
        Hud.DisplayZoneNames(true);
        Hud.DisplayCarNames(true);
        Game.SetPoliceIgnorePlayer(this.player, false);
        Game.SetEveryoneIgnorePlayer(this.player, false);
        Weather.Release();
        this.player.alterWantedLevelNoDrop(0);
        this.player.setGroupRecruitment(true).setControl(true);
        this.baseMissionPlayerGroup.remove();
        Stat.ShowUpdateStats(true);
        Mission.Finish();
        ONMISSION = false;
        this.baseMissionState = 5;
    }

    private baseMissionMakeWorldComfortable(): void {
        Game.SetCreateRandomGangMembers(false);
        Game.SetCreateRandomCops(false);
        Game.EnableAmbientCrime(false);
        Game.SwitchPoliceHelis(false);
        Game.SwitchCopsOnBikes(false);
        Game.SwitchRandomTrains(false);
        Game.SwitchAmbientPlanes(false);
        Game.SwitchEmergencyServices(false);
    }

    private baseMissionRestoreWorld(): void {
        Game.SetCreateRandomGangMembers(true);
        Game.SetCreateRandomCops(true);
        Game.EnableAmbientCrime(true);
        Game.SwitchPoliceHelis(true);
        Game.SwitchCopsOnBikes(true);
        Game.SwitchRandomTrains(true);
        Game.SwitchAmbientPlanes(true);
        Game.SwitchEmergencyServices(true);
    }

    private baseMissionPrepareChar(char: Char, respectType: int, hateType: int): Char {
        this.baseMissionCharsArray.push(char);
        char.setDrownsInWater(false).setRelationship(0, respectType).setRelationship(4, hateType)
            .setMoney(0).setDropsWeaponsWhenDead(false);
        if (respectType === 24) {
            return char.setRelationship(0, 0).setNeverTargeted(true).setNeverLeavesGroup(true)
                .setDecisionMaker(+this.baseMissionDecisionsMakersChar[1]);
        }
        return char.setRelationship(4, 0).setDecisionMaker(+this.baseMissionDecisionsMakersChar[0]);
    }

    private baseMissionPrepareBlip(blip: Blip, asFriendly: boolean, blipDisplay: int): Blip {
        this.baseMissionBlipsArray.push(blip);
        return blip.setAsFriendly(asFriendly).changeDisplay(blipDisplay);
    }

    private baseMissionDeleteTheCarCarefully(car: Car): void {
        if (!Car.DoesExist(+car))
            return;
        car.markAsNoLongerNeeded();
        if (this.playerChar.isInCar(car) || car.isOnScreen()) {
            car.changePlaybackToUseAi().setProofs(false, false, false, false, false).setCanBurstTires(true)
                .setUpsidedownNotDamaged(false).setCanBeVisiblyDamaged(true).setCollision(true);
            if (car.isHealthGreater(1000))
                car.setHealth(1000);
            return;
        }
        car.delete();
    }

    private restorePlayerWeapon(): void {
        if (this.baseMissionIsSavedPlayerWeapon) {
            this.playerChar.removeAllWeapons();
            for (let i = 1; i < 47; ++i) {
                if (this.baseMissionPlayerAmmo[i] > 0) {
                    this.loadWeaponModelsNow(i);
                    this.playerChar.giveWeapon(i, this.baseMissionPlayerAmmo[i]);
                    this.unloadWeaponModels(i);
                }
            }
        }
    }

    private baseMissionSetupDecisionMakers(): void {
        this.baseMissionDecisionsMakersChar.push(this.createEmptyDecisionMakerChar()); // enemy
        this.baseMissionDecisionsMakersChar.push(this.createEmptyDecisionMakerChar()); // friend
        // ...
    }

}