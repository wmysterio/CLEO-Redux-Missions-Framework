/// Created by wmysterio, 11.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../../.././.config/sa.d.ts" />

import { BaseMission } from "../../../BaseMission";
import { AddedRacerInfo } from "./AddedRacerInfo";
import { Route } from "./Route";
import { RouteNode } from "./RouteNode";
import { StreetRacer } from "./StreetRacer";

/** A base class that implements general racer behavior */
export abstract class BaseRaceMission extends BaseMission {

    private static baseRaceMissionEmptyCarSetup: (car: Car) => void = (car: Car) => { };

    private baseRaceMissionStage: int;
    private baseRaceMissionRoute: Route;
    private baseRaceMissionStreetRacers: StreetRacer[];
    private baseRaceMissionMinWantedLevel: int;
    private baseRaceMissionNumRouteNodes: int;
    private baseRaceMissionCarDensityMultiplier: float;
    private baseRaceMissionPedDensityMultiplier: float;
    private baseRaceMissionWantedMultiplier: float;
    private baseRaceMissionSpawnCops: boolean;
    private baseRaceMissionNumStreetRacers: int;
    private baseRaceMissionAddedRacerInfo: AddedRacerInfo[];
    private baseRaceMissionBlips: Blip[];
    private baseRaceMissionCheckpoint: Checkpoint;
    private baseRaceMissionBlip: Blip;
    private baseRaceMissionLastCheckpointForPlayer: boolean;
    private baseRaceMissionLastCheckpointId: int;
    private baseRaceMissionOnCheckpointTune: int;
    private baseRaceDisablePlayerCheckpointsChek: boolean;
    private baseRaceMissionBossPath: int;
    private baseRaceMissionBossPathSpeed: float;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseRaceMissionStage = 0;
        this.baseRaceMissionRoute = new Route();
        this.baseRaceMissionStreetRacers = new Array<StreetRacer>();
        this.baseRaceMissionAddedRacerInfo = new Array<AddedRacerInfo>();
        this.baseRaceMissionBlips = new Array<Blip>();
        this.baseRaceMissionMinWantedLevel = 0;
        this.baseRaceMissionNumStreetRacers = 0;
        this.baseRaceMissionNumRouteNodes = 0;
        this.baseRaceMissionLastCheckpointId = 0;
        this.baseRaceDisablePlayerCheckpointsChek = false;
        this.baseRaceMissionCheckpoint = new Checkpoint(-1);
        this.baseRaceMissionBlip = new Blip(-1);
        this.baseRaceMissionLastCheckpointForPlayer = false;
        this.baseRaceMissionOnCheckpointTune = 1058;
        this.baseRaceMissionBossPath = -1;
        this.baseRaceMissionBossPathSpeed = 0.0;
    }

    /** Reaction to an event before the start of the race */
    protected onRaceBeforeStartEvent(): void { }

    /** Reaction to an event before  */
    protected onRaceBefore321GOEvent(): void { }

    /** Reaction to the race completion event */
    protected onRaceEndEvent(isFailed: boolean): void { }

    /** Reaction to the event of a racer reaching a checkpoint */
    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void { }

    /** Reaction to the racer completing a lap of the route */
    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void { }

    /** Reaction to the event of drawing information about the player's state in the race */
    protected onDrawInfoEvent(): void { }

    /** Adds a new route node */
    protected addRouteNode(x: float, y: float, z: float, heading: float, speed: float, timeLimitInMilliseconds: int = 0): void {
        if (this.baseRaceMissionStage === 0)
            this.baseRaceMissionRoute.addNode(x, y, z, heading, speed, false, timeLimitInMilliseconds);
    }

    /** Adds a new route node that is mandatory for the player */
    protected addRouteNodeAsCheckpoint(x: float, y: float, z: float, heading: float, speed: float, timeLimit: int = 0): void {
        if (this.baseRaceMissionStage === 0)
            this.baseRaceMissionRoute.addNode(x, y, z, heading, speed, true, timeLimit);
    }

    /** Gets all added street racers */
    protected getStreetRacers(): StreetRacer[] {
        return this.baseRaceMissionStreetRacers;
    }

    /** Returns information about a street racer */
    protected getStreetRacer(id: int): StreetRacer {
        return this.baseRaceMissionStreetRacers[id];
    }

    /** Returns information about a route node */
    protected getRouteNode(id: int): RouteNode {
        return this.baseRaceMissionRoute.getNode(id);
    }

    /** Returns true if the route node is a checkpoint */
    protected isRouteNodeACheckpoint(id: int): boolean {
        return this.baseRaceMissionRoute.getNode(id).isCheckpoint;
    }

    /** Sets the minimum wanted level during a race */
    protected setRaceMinWantedLevel(minWantedLevel: int): void {
        if (minWantedLevel > -1 && 7 > minWantedLevel)
            this.baseRaceMissionMinWantedLevel = minWantedLevel;
    }

    /** Sets traffic parameters */
    protected setRaceTraffic(cars: float, peds: float, cops: boolean = false, wantedMultiplier: float = 1.0): void {
        this.baseRaceMissionCarDensityMultiplier = cars;
        this.baseRaceMissionPedDensityMultiplier = peds;
        this.baseRaceMissionWantedMultiplier = wantedMultiplier;
        this.baseRaceMissionSpawnCops = cops;
    }

    /** 
     * Adds a new street racer. Character and car models will be loaded and unloaded automatically
     * @param charModelId Use 0 for player's car
     * @param carSetup Function for additional car settings. Use "undefined" to skip
     */
    protected addStreetRacer(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int = -1, carSetup: (car: Car) => void = undefined): void {
        if (this.baseRaceMissionStage === 0) {
            if (carSetup === undefined)
                carSetup = BaseRaceMission.baseRaceMissionEmptyCarSetup;
            let addedRacerInfo = new AddedRacerInfo(carModel, x, y, z, heading, charModelId, carSetup);
            this.baseRaceMissionAddedRacerInfo.push(addedRacerInfo);
        }
    }

    /** Returns true if it is now possible to mark all checkpoints as finished (visually) */
    protected canMarkCheckpointsAsFinish(): boolean {
        return 2 > this.baseRaceMissionGetNumCheckpoints();
    }

    /** Makes a camera snapshot-style checkpoint sound */
    protected makeCheckpointTuneAsCameraShot(): void {
        this.baseRaceMissionOnCheckpointTune = 1132;
    }

    /** Sets the checkpoint type to finish (visual) */
    protected markAllCheckpointsAsFinish(): void {
        this.baseRaceMissionLastCheckpointForPlayer = true;
    }

    protected disablePlayerCheckpointsChek(): void {
        this.baseRaceDisablePlayerCheckpointsChek = true;
    }

    /** Hides the street racer blip */
    protected hideStreetRacerBlip(streetRacerId: int): void {
        this.baseRaceMissionBlips[streetRacerId].changeDisplay(0);
    }

    /** Returns the ID of the last checkpoint */
    protected getLastCheckpointId(): int {
        return this.baseRaceMissionLastCheckpointId;
    }

    /** Returns the ID of the next checkpoint */
    protected findNextCheckpointId(currentId: int): int {
        let nextId = currentId + 1;
        for (let i = nextId; i < this.baseRaceMissionNumRouteNodes; ++i) {
            if (this.baseRaceMissionRoute.isCheckpoint(i))
                return i;
        }
        for (let i = 0; i < currentId; ++i) {
            if (this.baseRaceMissionRoute.isCheckpoint(i))
                return i;
        }
        throw new Error("Route not have a checkpoints!");
    }

    /** Specifies the path of the boss's vehicle and the speed of this path */
    protected setBossPath(path: int, speed: float = 1.0): void {
        this.baseRaceMissionBossPath = path;
        this.baseRaceMissionBossPathSpeed = speed;
    }


    /** For this type of missions use the "onRaceBeforeStartEvent" method! */
    protected onStartEvent(): void {
        Text.LoadMissionText("RACETOR");
        this.setDefaultMissionSuccessBigMessage("RACES18", true); // Winner!
        this.setRaceTraffic(0.0, 0.0, false, 0.0);
        this.baseRaceMissionMakeTraffic();
        this.player.clearWantedLevel().setControl(false);
    }

    protected complete(missionNameGxt: string = ""): void {
        this.baseRaceMissionStage = 3;
        this.onRaceEndEvent(false);
        super.complete(missionNameGxt);
    }

    protected fail(reasonMessage: string = "", failedMessageTime: int = 5000, gxtKey: boolean = false): void {
        this.baseRaceMissionStage = 3;
        this.onRaceEndEvent(true);
        super.fail(reasonMessage, failedMessageTime, gxtKey);
    }

    /** Do not override this method. This method is now used for internal framework work */
    protected onUpdateEvent(): void {
        switch (this.baseRaceMissionStage) {
            case 0:
                this.baseRaceMissionProcessBeforeBegin();
                return;
            case 1:
                this.baseRaceMissionProcessAfterBegin();
                return;
            case 2:
                this.baseRaceMissionProcessRaceUpdate();
                return;
        }
    }

    protected onCleanupEvent(): void {
        super.onCleanupEvent();
        this.baseRaceMissionBlip.remove();
        this.baseRaceMissionCheckpoint.delete();
        if (this.baseRaceMissionBossPath > -1)
            Streaming.RemoveCarRecording(this.baseRaceMissionBossPath);
        Text.UseCommands(false);
    }



    private baseRaceMissionProcessBeforeBegin(): void {
        this.onRaceBeforeStartEvent();
        this.baseRaceMissionStage = 1;
    }

    private baseRaceMissionProcessAfterBegin(): void {
        this.player.clearWantedLevel();
        let numAddedRacerInfo = this.baseRaceMissionAddedRacerInfo.length;
        let usedModels = new Array<int>();
        for (let i = 0; i < numAddedRacerInfo; ++i) {
            usedModels.push(this.baseRaceMissionAddedRacerInfo[i].carModel);
            let charModelId = this.baseRaceMissionAddedRacerInfo[i].charModelId;
            if (charModelId > 0 && charModelId !== 7)
                usedModels.push(charModelId);
        }
        usedModels.forEach(modelId => {
            Streaming.RequestModel(modelId);
        });
        Streaming.LoadAllModelsNow();
        for (let i = 0; i < numAddedRacerInfo; ++i) {
            let racerInfo = this.baseRaceMissionAddedRacerInfo[i];
            let isPlayer = racerInfo.charModelId === 0;
            let racerCar = this.addCar(racerInfo.carModel, racerInfo.x, racerInfo.y, racerInfo.z, racerInfo.heading);
            if (racerInfo.carSetup !== undefined)
                racerInfo.carSetup(racerCar);
            let racerChar: Char;
            if (isPlayer) {
                racerChar = this.playerChar;
            } else if (racerInfo.charModelId === -1) {
                racerChar = this.addFriendInsideCar(7, racerCar);
            } else {
                racerChar = this.addFriendInsideCar(racerInfo.charModelId, racerCar);
            }
            this.baseRaceMissionBlips.push(
                this.addBlipForCar(racerCar).setAsFriendly(true).changeScale(2).changeColor(0)
            );
            if (isPlayer) {
                this.playerChar.warpIntoCar(racerCar.setHealth(2000));
                this.hideStreetRacerBlip(i);
            } else {
                racerCar.setUpsidedownNotDamaged(true).setCanBurstTires(false).setCanBeVisiblyDamaged(false)
                    .setProofs(false, false, false, true, false);
                StuckCarCheck.Add(racerCar.setHealth(20000), 2.0, 3000);
                racerChar.setCanBeKnockedOffBike(true).setCantBeDraggedOut(true).setGetOutUpsideDownCar(false)
                    .setMaxHealth(2000).setHealth(2000).setCanBeShotInVehicle(false);
            }
            let id = this.baseRaceMissionStreetRacers.length;
            let racer = new StreetRacer(id, racerChar, racerCar, isPlayer, racerInfo.startNode);
            this.baseRaceMissionStreetRacers.push(racer);
        }
        usedModels.forEach(modelId => {
            Streaming.MarkModelAsNoLongerNeeded(modelId);
        });
        this.baseRaceMissionNumRouteNodes = this.baseRaceMissionRoute.getNumNodes();
        this.baseRaceMissionLastCheckpointId = this.baseRaceMissionFindLastCheckpointId();
        let startLocation = this.baseRaceMissionRoute.getNode(0);
        World.ClearArea(startLocation.x, startLocation.y, startLocation.z, 300.0, true);
        this.refreshArea(startLocation.x, startLocation.y, startLocation.z);
        this.baseRaceMissionNumStreetRacers = this.baseRaceMissionStreetRacers.length;
        for (let i = 0; i < this.baseRaceMissionNumStreetRacers; ++i) {
            let streetRacer = this.baseRaceMissionStreetRacers[i];
            if (streetRacer.isPlayer) {
                streetRacer.nextNodeId = -1;
                break;
            }
        }
        Audio.SetRadioChannel(12);
        this.resetCamera();
        let bossCar = new Car(-1);
        if (this.baseRaceMissionBossPath > -1) {
            Streaming.RequestCarRecording(this.baseRaceMissionBossPath);
            while (!Streaming.HasCarRecordingBeenLoaded(this.baseRaceMissionBossPath))
                wait(0);
            for (let i = 0; i < this.baseRaceMissionNumStreetRacers; ++i) {
                let streetRacer = this.baseRaceMissionStreetRacers[i];
                if (streetRacer.isPlayer)
                    continue;
                bossCar = streetRacer.car;
                break;
            }
        }
        this.onRaceBefore321GOEvent();
        wait(1000);
        Text.PrintBig("RACES_4", 1100, 4); // 3
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
        wait(1100);
        Text.PrintBig("RACES_5", 1100, 4); // 2
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
        wait(1100);
        Text.PrintBig("RACES_6", 1100, 4); // 1
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1056);
        wait(1100);
        Text.PrintBig("RACES_7", 1100, 4); // GO!
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1057);
        this.baseRaceMissionMakeTraffic();
        this.player.alterWantedLevelNoDrop(this.baseRaceMissionMinWantedLevel).setControl(true);
        if (this.canMarkCheckpointsAsFinish())
            this.markAllCheckpointsAsFinish();
        if (Car.DoesExist(+bossCar) && this.baseRaceMissionBossPath > -1)
            bossCar.startPlayback(this.baseRaceMissionBossPath).setPlaybackSpeed(this.baseRaceMissionBossPathSpeed);
        this.baseRaceMissionStage = 2;
    }

    private baseRaceMissionProcessRaceUpdate(): void {
        Text.UseCommands(true);
        for (let i = 0; i < this.baseRaceMissionNumStreetRacers; ++i) {
            let streetRacer = this.baseRaceMissionStreetRacers[i];
            if (streetRacer.isPlayer) {
                if (Car.IsDead(+streetRacer.car) || streetRacer.car.isInWater() || streetRacer.car.isOnFire()) {
                    this.fail("RACES24", 6000, true);
                    return;
                }
                if (!this.playerChar.isInAnyCar()) {
                    this.fail("RACES20", 6000, true);
                    return;
                }
                if (this.baseRaceDisablePlayerCheckpointsChek)
                    continue;
                this.baseRaceMissionUpdatePlayerRoute(streetRacer);
                continue;
            }
            if (Char.IsDead(+streetRacer.char) || Car.IsDead(+streetRacer.car) || streetRacer.car.hasBeenDamagedByChar(this.playerChar)) {
                this.fail("RACES25", 6000, true);
                return;
            }
            if (!streetRacer.char.isInCar(streetRacer.car))
                streetRacer.char.warpIntoCar(streetRacer.car);
            if (streetRacer.isKnockedOut)
                continue;
            let currentNode = this.baseRaceMissionRoute.getNode(streetRacer.nextNodeId);
            if (StuckCarCheck.IsCarStuck(streetRacer.car) && !streetRacer.car.isOnScreen() && !streetRacer.car.isPlaybackGoingOn())
                this.baseRaceMissionTryRestoreRacerCar(streetRacer, currentNode);
            if (streetRacer.car.locate3D(currentNode.x, currentNode.y, currentNode.z, 12.0, 12.0, 12.0, false)) {
                if (currentNode.isCheckpoint) {
                    streetRacer.summOfSpeed += streetRacer.car.getSpeed();
                    this.onStreetRacerCheckpointPassedEvent(streetRacer, currentNode);
                }
                let nextNodeId = streetRacer.nextNodeId + 1;
                if (nextNodeId === this.baseRaceMissionNumRouteNodes) {
                    streetRacer.currentLap += 1;
                    this.onStreetRacerLapPassedEvent(streetRacer, streetRacer.currentLap);
                    nextNodeId = 0;
                }
                streetRacer.lastNode = currentNode;
                streetRacer.nextNodeId = nextNodeId;
                currentNode = this.baseRaceMissionRoute.getNode(nextNodeId);
                streetRacer.char.clearTasks();
            }
            if (streetRacer.car.isPlaybackGoingOn())
                continue;
            let taskStatus = streetRacer.char.getScriptTaskStatus(0x05D1);
            if (taskStatus === 7)
                Task.CarDriveToCoord(streetRacer.char, streetRacer.car, currentNode.x, currentNode.y, currentNode.z, currentNode.speed, 0, 0, 2);
        }
        this.onDrawInfoEvent();
    }

    private baseRaceMissionTryRestoreRacerCar(streetRacer: StreetRacer, currentNode: RouteNode): void {
        let lastNode = streetRacer.lastNode;
        let anyRacerLocatedAtLastNode = false;
        for (let i = 0; i < this.baseRaceMissionNumStreetRacers; ++i) {
            if (streetRacer.id === i)
                continue;
            let racer = this.baseRaceMissionStreetRacers[i];
            if (racer.char.locateAnyMeans3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)
                || racer.car.locate3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)) {
                anyRacerLocatedAtLastNode = true;
                break;
            }
        }
        if (anyRacerLocatedAtLastNode)
            return;
        World.ClearArea(streetRacer.lastNode.x, streetRacer.lastNode.y, streetRacer.lastNode.z, 4.0, true);
        streetRacer.car.setRotationVelocity(0.0, 0.0, lastNode.heading).setCoordinates(lastNode.x, lastNode.y, lastNode.z)
            .setCruiseSpeed(currentNode.speed).setForwardSpeed(currentNode.speed);
    }

    private baseRaceMissionUpdatePlayerRoute(streetRacer: StreetRacer): void {
        if (streetRacer.nextNodeId === -1)
            streetRacer.nextNodeId = this.findNextCheckpointId(-1);
        let currentCheckpoint = this.baseRaceMissionRoute.getNode(streetRacer.nextNodeId);
        if (streetRacer.car.locate3D(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z, 12.0, 12.0, 12.0, false)
            /*&& streetRacer.car.isOnAllWheels()*/) {
            streetRacer.summOfSpeed += streetRacer.car.getSpeed();
            streetRacer.availableTime += currentCheckpoint.timeLimitInMilliseconds;
            this.baseRaceMissionBlip.remove();
            this.baseRaceMissionCheckpoint.delete();
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, this.baseRaceMissionOnCheckpointTune);
            this.onStreetRacerCheckpointPassedEvent(streetRacer, currentCheckpoint);
            if (this.baseRaceMissionLastCheckpointId === streetRacer.nextNodeId) {
                streetRacer.currentLap += 1;
                this.onStreetRacerLapPassedEvent(streetRacer, streetRacer.currentLap);
                streetRacer.nextNodeId = -1;
            }
            streetRacer.nextNodeId = this.findNextCheckpointId(streetRacer.nextNodeId);
            currentCheckpoint = this.baseRaceMissionRoute.getNode(streetRacer.nextNodeId);
        }
        if (Blip.DoesExist(+this.baseRaceMissionBlip))
            return;
        let nextCheckpointId = this.findNextCheckpointId(streetRacer.nextNodeId);
        let nextCheckpoint = this.baseRaceMissionRoute.getNode(nextCheckpointId);
        this.baseRaceMissionBlip = Blip.AddForCoord(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z);
        this.baseRaceMissionCheckpoint = Checkpoint.Create(
            this.baseRaceMissionLastCheckpointForPlayer ? 1 : 0,
            currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z,
            nextCheckpoint.x, nextCheckpoint.y, nextCheckpoint.z, 6.0
        );
    }

    private baseRaceMissionGetNumCheckpoints(): int {
        let result = 0;
        for (let i = 0; i < this.baseRaceMissionNumRouteNodes; ++i) {
            if (this.baseRaceMissionRoute.isCheckpoint(i))
                result += 1;
        }
        return result;
    }

    private baseRaceMissionFindLastCheckpointId(): int {
        let start = this.baseRaceMissionNumRouteNodes - 1;
        for (let i = start; i >= 0; --i) {
            if (this.baseRaceMissionRoute.isCheckpoint(i))
                return i
        }
        throw new Error("Route not have a checkpoints!");
    }

    private baseRaceMissionMakeTraffic(): void {
        World.SetPedDensityMultiplier(this.baseRaceMissionPedDensityMultiplier);
        World.SetCarDensityMultiplier(this.baseRaceMissionCarDensityMultiplier);
        Game.SetPoliceIgnorePlayer(this.player, !this.baseRaceMissionSpawnCops);
        Game.SetCreateRandomCops(this.baseRaceMissionSpawnCops);
        Game.EnableAmbientCrime(this.baseRaceMissionSpawnCops);
        Game.SwitchPoliceHelis(this.baseRaceMissionSpawnCops);
        Game.SwitchCopsOnBikes(this.baseRaceMissionSpawnCops);
        Game.SetWantedMultiplier(this.baseRaceMissionSpawnCops ? this.baseRaceMissionWantedMultiplier : 0.0);
    }

}