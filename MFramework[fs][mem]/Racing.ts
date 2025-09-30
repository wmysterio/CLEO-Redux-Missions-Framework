import { BaseMission } from "./BaseMission";
import { Screen } from "./Drawing";
import { Timer } from "./Timer";

/** Represents a node in a race route. */
class RouteNode {

    /** The X coordinate of the node. */
    public x: float;

    /** The Y coordinate of the node. */
    public y: float;

    /** The Z coordinate of the node. */
    public z: float;

    /** The heading angle of the node in degrees. */
    public heading: float;

    /** The speed for the node in game units. */
    public speed: float;

    /** Indicates whether the node is a checkpoint. */
    public isCheckpoint: boolean;

    /** The ID of the checkpoint, or -1 if not a checkpoint. */
    public checkpointId: int;

    /** The time limit for reaching the node in milliseconds. */
    public timeLimitMs: int;



    /**
     * Initializes a new route node.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units.
     * @param isCheckpoint - Whether the node is a checkpoint.
     * @param timeLimitMs - The time limit for reaching the node in milliseconds.
     */
    constructor(x: float, y: float, z: float, heading: float, speed: float, isCheckpoint: boolean, timeLimitMs: int) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.speed = speed;
        this.isCheckpoint = isCheckpoint;
        this.timeLimitMs = timeLimitMs;
        this.checkpointId = isCheckpoint ? 0 : -1;
    }

}

/** Represents a radar node with a blip and checkpoint in a radar race. */
class RadarNode {

    private _blip: Blip;
    private _checkpoint: Checkpoint;

    /** Indicates whether the radar has been passed by the player. */
    public isPassed: boolean;

    /** X coordinate of the radar. */
    public x: float;

    /** Y coordinate of the radar. */
    public y: float;

    /** Z coordinate of the radar. */
    public z: float;



    /**
     * Creates a radar node based on the provided route node.
     * @param routeNode - The route node containing coordinates for the radar.
     */
    public constructor(routeNode: RouteNode) {
        this._blip = new Blip(-1);
        this._checkpoint = new Checkpoint(-1);
        this.isPassed = false;
        this.x = routeNode.x;
        this.y = routeNode.y;
        this.z = routeNode.z;
    }



    /** Creates the radar blip and checkpoint at the specified coordinates. */
    public create(): void {
        this._blip = Blip.AddForCoord(this.x, this.y, this.z);
        this._checkpoint = Checkpoint.Create(2, this.x, this.y, this.z, this.x, this.y, this.z, 6.0);
    }

    /** Removes the radar blip and checkpoint. */
    public remove(): void {
        this._blip.remove();
        this._checkpoint.delete();
    }

}

/** Represents a racer in a street race. */
class Racer {

    /** The unique ID of the racer. */
    public id: int;

    /** The car used by the racer. */
    public car: Car;

    /** The character of the racer. */
    public char: Char;

    /** Indicates whether the racer is the player. */
    public isPlayer: boolean;

    /** The last route node visited by the racer. */
    public lastNode: RouteNode;

    /** The current lap number of the racer. */
    public currentLap: int;

    /** The ID of the next route node to reach. */
    public nextNodeId: int;

    /** The sum of speeds recorded at checkpoints. */
    public totalSpeed: float;

    /** The available time for the racer in milliseconds. */
    public availableTime: int;

    /** Indicates whether the racer is knocked out of the race. */
    public isKnockedOut: boolean;



    /**
     * Initializes a new street racer.
     * @param id - The unique ID of the racer.
     * @param char - The character of the racer.
     * @param car - The car used by the racer.
     * @param isPlayer - Whether the racer is the player.
     * @param startNode - The starting route node for the racer.
     */
    constructor(id: int, char: Char, car: Car, isPlayer: boolean, startNode: RouteNode) {
        this.id = id;
        this.car = car;
        this.char = char;
        this.isPlayer = isPlayer;
        this.lastNode = startNode;
        this.currentLap = 0;
        this.nextNodeId = 0;
        this.totalSpeed = 0.0;
        this.availableTime = 0;
        this.isKnockedOut = false;
    }

}

/** Contains information for initializing a street racer. */
class RacerInfo {

    /** The model ID of the racer's car. */
    public carModel: int;

    /** The X coordinate of the starting position. */
    public x: float;

    /** The Y coordinate of the starting position. */
    public y: float;

    /** The Z coordinate of the starting position. */
    public z: float;

    /** The heading angle of the starting position in degrees. */
    public heading: float;

    /** The model ID of the racer's character, or -1 for random. */
    public charModelId: int;

    /** The function to apply additional car settings, or undefined to skip. */
    public setupCar: (car: Car) => void;

    /** The starting route node for the racer. */
    public startNode: RouteNode;

    /** Indicates whether the racer is the player. */
    public isPlayer: boolean;


    /**
     * Initializes a new racer info.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param charModelId - The model ID of the racer's character, or -1 for random.
     * @param setupCar - The function to apply additional car settings, or undefined to skip.
     * @param speed - The speed for the starting node.
     * @param timeLimitMs - The time limit for the starting node in milliseconds.
     * @param isPlayer - Whether the racer is the player.
     */
    constructor(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int, setupCar: (car: Car) => void, speed: float, timeLimitMs: int, isPlayer: boolean) {
        this.carModel = carModel;
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.charModelId = charModelId;
        this.isPlayer = isPlayer;
        this.setupCar = setupCar;
        this.startNode = new RouteNode(x, y, z, heading, speed, false, timeLimitMs);
    }

}

/** Base class for race missions, managing racers, routes, and checkpoints. */
abstract class BaseRaceMission extends BaseMission {

    private static readonly _setupEmptyCar: (car: Car) => void = (car: Car) => { };

    private _racersInfo: RacerInfo[];
    private _racers: Racer[];
    private _racersBlips: Blip[];
    private _racersCount: int;
    private _playerRacerCar: Car;
    private _route: RouteNode[];
    private _nodesCount: int;
    private _checkpoint: Checkpoint;
    private _carDensityMultiplier: float;
    private _pedDensityMultiplier: float;
    private _wantedMultiplier: float;
    private _spawnCops: boolean;
    private _minWantedLevel: int;
    private _blip: Blip;
    private _bossPath: int;
    private _bossPathSpeed: float;
    private _playerIndex: int;
    private _lastCheckpointId: int;
    private _checkpointTune: int;
    private _lastCheckpointForPlayer: boolean;
    private _disablePlayerCheckpointsCheck: boolean;
    private _isWantedChallenge: boolean;
    private _onStartEvent: () => void;
    private _onUpdateEvent: () => void;

    /** Gets the number of street racers. */
    public get racersCount(): int {
        return this._racersCount;
    }

    /** Gets the street racer player. */
    public get playerRacer(): Racer {
        return this._racers[this._playerIndex];
    }

    /** Gets the street racing player's ID. */
    public get playerRacerId(): int {
        return this._playerIndex;
    }

    /** Gets the ID of the last checkpoint. */
    public get lastCheckpointId(): int {
        return this._lastCheckpointId;
    }

    /** Gets the minimum wanted level. */
    public get minWantedLevel(): int {
        return this._minWantedLevel;
    }

    /**
     * Sets the minimum wanted level.
     * @param level - The minimum wanted level (0 to 6).
     */
    public set minWantedLevel(level: int) {
        if (level > -1 && 7 > level)
            this._minWantedLevel = level;
    }


    public get playerRacerCar(): Car {
        return this._playerRacerCar;
    }


    public onInitEvent(): void {
        super.onInitEvent();
        this._isWantedChallenge = this instanceof BaseWantedChallenge;
        this._racersInfo = new Array<RacerInfo>();
        this._route = new Array<RouteNode>();
        this._nodesCount = 0;
        this._lastCheckpointId = 0;
        this._racers = new Array<Racer>();
        this._racersCount = 0;
        this._playerIndex = -1;
        this._bossPath = -1;
        this._bossPathSpeed = 0.0;
        this._minWantedLevel = this._isWantedChallenge ? 1 : 0;
        this._racersBlips = new Array<Blip>();
        this._blip = new Blip(-1);
        this._playerRacerCar = new Car(-1);
        this._checkpoint = new Checkpoint(-1);
        this._checkpointTune = 1058;
        this._lastCheckpointForPlayer = false;
        this._disablePlayerCheckpointsCheck = false;
        Text.LoadMissionText("RACETOR");
        this.successBigMessage.gxt = "RACES18";

        this._onStartEvent = this.onStartEvent;
        this._onUpdateEvent = this.onUpdateEvent;

        this.onStartEvent = () => {
            this._onStartEvent();
            this.setTraffic(0.0, 0.0, false, 0.0);
            this._changeTraffic();
            if (this._isWantedChallenge)
                this.setTraffic(1.0, 1.0, true, 1.0);
            this.onRacerSetupEvent();
            this._afterRaceSetup();
        };

        this.onUpdateEvent = () => {
            this._updateRace();
            this._onUpdateEvent();
        };
    }

    public onEndEvent(): void {
        this._blip.remove();
        this._checkpoint.delete();
        if (this._bossPath > -1)
            Streaming.RemoveCarRecording(this._bossPath);
        super.onEndEvent();
    }

    /** Handles the script start event, called when the script begins. */
    public onRacerSetupEvent(): void { }

    /** Handles the event of a racer reaching a route node. */
    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void { }

    /** Handles the event of a racer completing a lap of the route. */
    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void { }

    /** Handles the display of information. */
    public abstract onDrawInfoEvent(): void;



    /**
     * Adds a new street racer. Character and car models will be loaded and unloaded automatically.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param charModelId - The model ID of the racer's character, or -1 for random (default: -1).
     * @param setupCar - The function to apply additional car settings, or undefined to skip (default: undefined).
     */
    public addRacer(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int = -1, setupCar: (car: Car) => void = undefined): void {
        if (setupCar === undefined)
            setupCar = BaseRaceMission._setupEmptyCar;
        const addedRacerInfo = new RacerInfo(carModel, x, y, z, heading, 8 > charModelId ? -1 : charModelId, setupCar, 0.0, 0.0, false);
        this._racersInfo.push(addedRacerInfo);
    }

    /**
     * Adds the player as a street racer. Car model will be loaded and unloaded automatically.
     * @param carModel - The model ID of the racer's car.
     * @param x - The X coordinate of the starting position.
     * @param y - The Y coordinate of the starting position.
     * @param z - The Z coordinate of the starting position.
     * @param heading - The heading angle in degrees.
     * @param setupCar - The function to apply additional car settings (default: undefined).
     */
    public addPlayerRacer(carModel: int, x: float, y: float, z: float, heading: float, setupCar: (car: Car) => void = undefined): void {
        if (setupCar === undefined)
            setupCar = BaseRaceMission._setupEmptyCar;
        this._racersInfo.push(new RacerInfo(carModel, x, y, z, heading, 0, setupCar, 0.0, 0.0, true));
    }

    /**
     * Adds a new checkpoint node mandatory for both player and NPC.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units (non-negative).
     * @param timeLimitMs - The time limit for reaching the node in milliseconds (default: 0).
     */
    public addRouteNode(x: float, y: float, z: float, heading: float, speed: float, timeLimitMs: int = 0): void {
        const node = new RouteNode(x, y, z, heading, speed, true, timeLimitMs);
        node.checkpointId = this._route.length;
        this._route.push(node);
    }

    /**
     * Adds a new route node for NPC navigation.
     * @param x - The X coordinate of the node.
     * @param y - The Y coordinate of the node.
     * @param z - The Z coordinate of the node.
     * @param heading - The heading angle in degrees.
     * @param speed - The speed for the node in game units (non-negative).
     * @param timeLimitMs - The time limit for reaching the node in milliseconds (default: 0).
     */
    public addRouteNodeNoCheckpoint(x: float, y: float, z: float, heading: float, speed: float, timeLimitMs: int = 0): void {
        this._route.push(new RouteNode(x, y, z, heading, speed, false, timeLimitMs));
    }

    /**
     * Returns information about a street racer.
     * @param id - The unique ID of the racer.
     * @returns The racer.
     */
    public getRacer(id: int): Racer {
        return this._racers[id];
    }

    /**
     * Returns information about a route node.
     * @param id - The ID of the route node.
     * @returns The route node.
     */
    public getRouteNode(id: int): RouteNode {
        return this._route[id];
    }

    /**
     * Returns true if the route node is a checkpoint.
     * @param id - The ID of the route node.
     * @returns True if the node is a checkpoint, false otherwise.
     */
    public isRouteNodeACheckpoint(id: int): boolean {
        return this._route[id].isCheckpoint;
    }

    /**
     * Returns the ID of the next checkpoint.
     * @param currentId - The current checkpoint ID.
     * @returns The ID of the next checkpoint. Throws an error if no checkpoints exist.
     */
    public findNextCheckpointId(currentId: int): int {
        let nextId = currentId + 1;
        for (let i = nextId; i < this._nodesCount; ++i)
            if (this._route[i].isCheckpoint)
                return i;
        for (let i = 0; i < currentId; ++i)
            if (this._route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    /**
     * Hides the street racer's blip.
     * @param racerId - The ID of the racer whose blip to hide.
     */
    public hideRacerBlip(racerId: int): void {
        this._racersBlips[racerId].changeDisplay(0);
    }





    /**
     * Sets traffic parameters.
     * @param cars - The car density multiplier.
     * @param peds - The pedestrian density multiplier.
     * @param cops - Whether to spawn cops (default: false).
     * @param wantedMultiplier - The multiplier for wanted level (default: 1.0).
     */
    public setTraffic(cars: float, peds: float, cops: boolean = false, wantedMultiplier: float = 1.0): void {
        this._carDensityMultiplier = cars;
        this._pedDensityMultiplier = peds;
        this._wantedMultiplier = wantedMultiplier;
        this._spawnCops = cops;
    }

    /** Sets the checkpoint sound to a camera snapshot style. */
    public setCheckpointTuneAsCameraShot(): void {
        this._checkpointTune = 1132;
    }

    /**
     * Returns true if it is possible to mark all checkpoints as finished (visually).
     * @returns True if fewer than 2 checkpoints remain, false otherwise.
     */
    public canMarkCheckpointsAsFinish(): boolean {
        return 2 > this._calculateCheckpointsCount();
    }

    /** Sets the checkpoint type to finish (visual). */
    public markAllCheckpointsAsFinish(): void {
        this._lastCheckpointForPlayer = true;
    }

    /** Disables checking if the player is near checkpoints. */
    public disablePlayerCheckpointsCheck(): void {
        this._disablePlayerCheckpointsCheck = true;
    }

    /**
     * Specifies the path and speed for the boss's vehicle. The first non-player racer is considered the boss.
     * @param path - The ID of the car recording path.
     * @param speed - The playback speed for the path (default: 1.0).
     */
    public setBossPath(path: int, speed: float = 1.0): void {
        this._bossPath = path;
        this._bossPathSpeed = speed;
    }



    private _afterRaceSetup(): void {
        this.player.clearWantedLevel().setControl(false);
        const racerInfoCount = this._racersInfo.length;
        const usedModels = new Array<int>();
        for (let i = 0; i < racerInfoCount; ++i) {
            usedModels.push(this._racersInfo[i].carModel);
            let charModelId = this._racersInfo[i].charModelId;
            if (charModelId > 0 && charModelId !== 7)
                usedModels.push(charModelId);
        }
        this.loadModels(...usedModels);
        this.refreshArea(this._racersInfo[0].x, this._racersInfo[0].y, this._racersInfo[0].z, 300.0);
        for (let i = 0; i < racerInfoCount; ++i) {
            const racerInfo = this._racersInfo[i];
            const racerCar = this.addCar(racerInfo.carModel, racerInfo.x, racerInfo.y, racerInfo.z, racerInfo.heading).setHealth(2000);
            if (racerInfo.setupCar !== undefined)
                racerInfo.setupCar(racerCar);
            let racerChar: Char;
            if (racerInfo.isPlayer) {
                racerChar = this.playerChar;
                this._playerRacerCar = racerCar;
            } else if (racerInfo.charModelId === -1) {
                racerChar = this.addNeutralCharInsideCar(7, racerCar);
            } else {
                racerChar = this.addNeutralCharInsideCar(racerInfo.charModelId, racerCar);
            }
            this._racersBlips.push(this.addBlipToCar(racerCar).setAsFriendly(true).changeScale(2).changeColor(0));
            if (racerInfo.isPlayer) {
                this.playerChar.warpIntoCar(racerCar);
                this.hideRacerBlip(i);
            } else {
                racerCar.setUpsidedownNotDamaged(true).setCanBurstTires(false).setCanBeVisiblyDamaged(false)
                    .setProofs(false, false, false, true, false);
                StuckCarCheck.Add(racerCar.setHealth(20000), 2.0, 3000);
                racerChar.setCanBeKnockedOffBike(true).setCantBeDraggedOut(true).setGetOutUpsideDownCar(false)
                    .setMaxHealth(2000).setHealth(2000).setCanBeShotInVehicle(false);
            }
            this._racers.push(new Racer(this._racers.length, racerChar, racerCar, racerInfo.isPlayer, racerInfo.startNode));
        }
        this.unloadModels(...usedModels);
        if (!this._isWantedChallenge) {
            this._nodesCount = this._route.length;
            this._lastCheckpointId = this._findLastCheckpointId();
            this._racersCount = this._racers.length;
            for (let i = 0; i < this._racersCount; ++i) {
                const racer = this._racers[i];
                if (racer.isPlayer) {
                    this._playerIndex = i;
                    racer.nextNodeId = -1;
                    break;
                }
            }
        }
        Audio.SetRadioChannel(12);
        Audio.SetRadioChannel(-1);
        this.resetCamera();
        let bossCar = new Car(-1);
        if (this._bossPath > -1 && !this._isWantedChallenge) {
            Streaming.RequestCarRecording(this._bossPath);
            while (!Streaming.HasCarRecordingBeenLoaded(this._bossPath))
                wait(0);
            for (let i = 0; i < this._racersCount; ++i) {
                if (this._playerIndex === i)
                    continue;
                bossCar = this._racers[i].car;
                break;
            }
        }
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
        if (!this._isWantedChallenge)
            this.player.alterWantedLevelNoDrop(this._minWantedLevel);
        this.player.setControl(true);
        if (this.canMarkCheckpointsAsFinish())
            this.markAllCheckpointsAsFinish();
        for (let i = 0; i < this._racersCount; ++i)
            this._racers[i].car.freezePosition(false);
        if (Car.DoesExist(+bossCar) && this._bossPath > -1)
            bossCar.startPlayback(this._bossPath).setPlaybackSpeed(this._bossPathSpeed);
        this._changeTraffic();
    }

    private _updateRace(): void {
        if (this.isCarDead(this._playerRacerCar)) {
            this.fail("RACES24", 6000);
            return;
        }
        if (!this.playerChar.isInAnyCar()) {
            this.fail("RACES20", 6000);
            return;
        }
        if (this._isWantedChallenge) {
            this.onDrawInfoEvent();
            return;
        }
        for (let i = 0; i < this._racersCount; ++i) {
            const racer = this._racers[i];
            if (racer.isPlayer) {
                this._updatePlayerRacer(racer);
                continue;
            }
            if (this.isCharDead(racer.char) || this.isCarDead(racer.car) || racer.car.hasBeenDamagedByChar(this.playerChar)) {
                this.fail("RACES25", 6000);
                return;
            }
            if (!racer.char.isInCar(racer.car))
                racer.char.warpIntoCar(racer.car);
            if (racer.isKnockedOut)
                continue;
            let currentNode = this._route[racer.nextNodeId];
            if (StuckCarCheck.IsCarStuck(racer.car) && !racer.car.isOnScreen() && !racer.car.isPlaybackGoingOn())
                this._tryRestoreRacerCar(racer, currentNode);
            if (racer.car.locate3D(currentNode.x, currentNode.y, currentNode.z, 12.0, 12.0, 12.0, false)) {
                if (currentNode.isCheckpoint) {
                    racer.totalSpeed += racer.car.getSpeed();
                    this.onRacerRouteNodePassedEvent(racer, currentNode);
                }
                let nextNodeId = racer.nextNodeId + 1;
                if (nextNodeId === this._nodesCount) {
                    racer.currentLap += 1;
                    this.onRacerLapPassedEvent(racer, racer.currentLap);
                    nextNodeId = 0;
                }
                racer.lastNode = currentNode;
                racer.nextNodeId = nextNodeId;
                currentNode = this._route[nextNodeId];
                racer.char.clearTasks();
            }
            if (racer.car.isPlaybackGoingOn())
                continue;
            if (this.isScriptTaskFinished(racer.char, 0x05D1))
                Task.CarDriveToCoord(racer.char, racer.car, currentNode.x, currentNode.y, currentNode.z, currentNode.speed, 0, 0, 2);
        }
        this.onDrawInfoEvent();
    }

    private _tryRestoreRacerCar(racer: Racer, currentNode: RouteNode): void {
        const lastNode = racer.lastNode;
        let anyRacerLocatedAtLastNode = false;
        for (let i = 0; i < this._racersCount; ++i) {
            if (this._racers[i].id === i)
                continue;
            const racer = this._racers[i];
            if (racer.char.locateAnyMeans3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)
                || racer.car.locate3D(lastNode.x, lastNode.y, lastNode.z, 12.0, 12.0, 12.0, false)) {
                anyRacerLocatedAtLastNode = true;
                break;
            }
        }
        if (anyRacerLocatedAtLastNode)
            return;
        World.ClearArea(racer.lastNode.x, racer.lastNode.y, racer.lastNode.z, 4.0, true);
        racer.car.setRotationVelocity(0.0, 0.0, lastNode.heading).setCoordinates(lastNode.x, lastNode.y, lastNode.z)
            .setCruiseSpeed(currentNode.speed).setForwardSpeed(currentNode.speed);
    }

    private _updatePlayerRacer(racer: Racer): void {
        if (this._disablePlayerCheckpointsCheck)
            return;
        if (racer.nextNodeId === -1)
            racer.nextNodeId = this.findNextCheckpointId(-1);
        let currentCheckpoint = this._route[racer.nextNodeId];
        if (this._playerRacerCar.locate3D(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z, 12.0, 12.0, 12.0, false)) {
            /*&& StreetRacer.car.isOnAllWheels()*/
            racer.totalSpeed += this._playerRacerCar.getSpeed();
            racer.availableTime += currentCheckpoint.timeLimitMs;
            this._blip.remove();
            this._checkpoint.delete();
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, this._checkpointTune);
            this.onRacerRouteNodePassedEvent(racer, currentCheckpoint);
            if (this._lastCheckpointId === racer.nextNodeId) {
                racer.currentLap += 1;
                this.onRacerLapPassedEvent(racer, racer.currentLap);
                racer.nextNodeId = -1;
            }
            racer.nextNodeId = this.findNextCheckpointId(racer.nextNodeId);
            currentCheckpoint = this._route[racer.nextNodeId];
        }
        if (Blip.DoesExist(+this._blip))
            return;
        const nextCheckpoint = this._route[this.findNextCheckpointId(racer.nextNodeId)];
        this._blip = Blip.AddForCoord(currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z);
        this._checkpoint = Checkpoint.Create(
            this._lastCheckpointForPlayer ? 1 : 0,
            currentCheckpoint.x, currentCheckpoint.y, currentCheckpoint.z,
            nextCheckpoint.x, nextCheckpoint.y, nextCheckpoint.z, 6.0
        );
    }

    private _calculateCheckpointsCount(): int {
        let result = 0;
        for (let i = 0; i < this._nodesCount; ++i)
            if (this._route[i].isCheckpoint)
                result += 1;
        return result;
    }

    private _findLastCheckpointId(): int {
        for (let i = this._nodesCount - 1; i >= 0; --i)
            if (this._route[i].isCheckpoint)
                return i;
        throw new Error("There are no checkpoints on the route or their number is less than the minimum!");
    }

    private _changeTraffic(): void {
        World.SetPedDensityMultiplier(this._pedDensityMultiplier);
        World.SetCarDensityMultiplier(this._carDensityMultiplier);
        Game.SetPoliceIgnorePlayer(this.player, !this._spawnCops);
        Game.SetCreateRandomCops(this._spawnCops);
        Game.EnableAmbientCrime(this._spawnCops);
        Game.SwitchPoliceHelis(this._spawnCops);
        Game.SwitchCopsOnBikes(this._spawnCops);
        Game.SetWantedMultiplier(this._spawnCops ? this._wantedMultiplier : 0.0);
    }

}

/** Base class implementing a sprint race, where the player competes against other racers to reach the final checkpoint first. */
export abstract class BaseSprintRace extends BaseRaceMission {

    private _positionGxt: string;

    /**
     * Sets the GXT key for the text displayed near the player's position in the race.
     * @param gxtKey - The GXT key for the position text.
     */
    public set positionGxt(gxtKey: string) {
        this._positionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._positionGxt = "RACES44";
    }

    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void {
        if (racer.isPlayer && this.lastCheckpointId === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void {
        if (racer.isPlayer) {
            this.complete();
        } else {
            this.fail("RACEFA", 5000);
        }
    }

    public onDrawInfoEvent(): void {
        Screen.DisplayCounter(this._getPlayerPosition(), 1, this._positionGxt);
    }



    private _getPlayerPosition(): int {
        let position = 1;
        const playerRacer = this.playerRacer;
        const currentPlayerCheckpointId = playerRacer.nextNodeId;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            const currentStreetRacer = this.getRacer(i);
            let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
            if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
            if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                position += 1;
            } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                const playerCoord = playerRacer.car.getCoordinates();
                const racerCoord = currentStreetRacer.car.getCoordinates();
                const nextNode = this.getRouteNode(currentPlayerCheckpointId);
                const playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                const racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                if (playerDistance > racerDistance)
                    position += 1;
            }
        }
        return position;
    }

}

/** Base class implementing circuit racing. */
export abstract class BaseCircuitRace extends BaseRaceMission {

    private _lapsCount: int;
    private _positionGxt: string;

    /**
     * Sets the number of race laps, with a minimum of 2.
     * @param count - The number of laps for the race.
     */
    public set lapsCount(count: int) {
        this._lapsCount = 2 > count ? 2 : count;
    }

    /**
     * Sets the GXT key for the text displayed near the player's position in the race.
     * @param gxtKey - The GXT key for the position text.
     */
    public set positionGxt(gxtKey: string) {
        this._positionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._lapsCount = 2;
        this._positionGxt = "RACES44";
    }

    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void {
        if (!racer.isPlayer || this._lapsCount > (racer.currentLap + 1))
            return;
        if (this.lastCheckpointId === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void {
        if (this._lapsCount > lastLap)
            return;
        if (racer.isPlayer) {
            this.complete();
        } else {
            this.fail("RACEFA", 5000);
        }
    }

    public onDrawInfoEvent(): void {
        Screen.DisplayCounter(this._getPlayerPosition(), 1, this._positionGxt);
        Screen.DisplayCounterWith2Numbers(this.playerRacer.currentLap + 1, this._lapsCount, 2, "RACES32");
    }



    /** @returns Always false. */
    public canMarkCheckpointsAsFinish(): boolean {
        return false;
    }



    private _getPlayerPosition(): int {
        let position = 1;
        const playerRacer = this.playerRacer;
        const currentPlayerCheckpointId = playerRacer.nextNodeId;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            const currentStreetRacer = this.getRacer(i);
            if (currentStreetRacer.currentLap > playerRacer.currentLap) {
                position += 1;
            } else if (currentStreetRacer.currentLap === playerRacer.currentLap) {
                let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
                if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    const playerCoord = playerRacer.car.getCoordinates();
                    const racerCoord = currentStreetRacer.car.getCoordinates();
                    const nextNode = this.getRouteNode(currentPlayerCheckpointId);
                    const playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    const racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    if (playerDistance > racerDistance)
                        position += 1;
                }
            }
        }
        return position;
    }

}

/** Base class implementing a knockout race where the number of laps depends on the number of racers. */
export abstract class BaseLapKnockoutRace extends BaseRaceMission {

    private _safeZCoordForCars: float;
    private _randomNames: int[];
    private _positionGxt: string;

    /**
     * Sets the GXT key for the text displayed near the player's position in the race.
     * @param gxtKey - The GXT key for the position text.
     */
    public set positionGxt(gxtKey: string) {
        this._positionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._generateRandomStreetRacersNames();
        this._safeZCoordForCars = -1000.0;
        this._positionGxt = "RACES44";
        FxtStore.insert("NAMEKNO", "~d~ ~a~ ~d~", true);
    }

    public onEndEvent(): void {
        FxtStore.delete("NAMEKNO", true);
        super.onEndEvent();
    }

    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void {
        if (!racer.isPlayer || this._getLapsCount() > (racer.currentLap + 1))
            return;
        if (this.lastCheckpointId === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void {
        let isKnocked = true;
        for (let i = 0; i < this.racersCount; ++i) {
            const racer = this.getRacer(i);
            if (racer.isKnockedOut)
                continue;
            if (lastLap > racer.currentLap) {
                isKnocked = false;
                break;
            }
        }
        if (isKnocked) {
            if (racer.isPlayer) {
                this.fail("RACEFA", 5000);
                return;
            }
            this.hideRacerBlip(racer.id);
            racer.isKnockedOut = true;
            this._safeZCoordForCars -= 10.0;
            racer.char.setProofs(true, true, true, true, true).clearTasks();
            racer.car.setProofs(true, true, true, true, true).setRotationVelocity(0.0, 0.0, 0.0)
                .setCoordinates(0.0, 0.0, this._safeZCoordForCars)
                .freezePositionAndDontLoadCollision(true);
            if (this._randomNames.length > 0)
                Text.PrintStringInStringNow("NAMEKNO", ("CRED61" + this._randomNames.pop()), 4000, 1);
            return;
        }
        if (this._getLapsCount() > lastLap)
            return;
        if (racer.isPlayer) {
            this.complete();
        } else {
            this.fail("RACEFA", 5000);
        }
    }

    public onDrawInfoEvent(): void {
        Screen.DisplayCounter(this._getPlayerPosition(), 1, this._positionGxt);
        const lapsCount = this._getLapsCount();
        if (lapsCount > 1)
            Screen.DisplayCounterWith2Numbers(this.playerRacer.currentLap + 1, lapsCount, 2, "RACES32");
    }



    /** @returns Always false. */
    public canMarkCheckpointsAsFinish(): boolean {
        return false;
    }


    private _getLapsCount(): int {
        return this.racersCount - 1;
    }

    private _getPlayerPosition(): int {
        let position = 1;
        const currentPlayerCheckpointId = this.playerRacer.nextNodeId;
        const playerRacer = this.playerRacer;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            const currentStreetRacer = this.getRacer(i);
            if (currentStreetRacer.currentLap > playerRacer.currentLap) {
                position += 1;
            } else if (currentStreetRacer.currentLap === playerRacer.currentLap) {
                let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
                if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    const playerCoord = playerRacer.car.getCoordinates();
                    const racerCoord = currentStreetRacer.car.getCoordinates();
                    const nextNode = this.getRouteNode(currentPlayerCheckpointId);
                    const playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    const racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    if (playerDistance > racerDistance)
                        position += 1;
                }
            }
        }
        return position;
    }

    private _generateRandomStreetRacersNames(): void {
        this._randomNames = new Array<int>();
        for (let i = 0; i < 10; ++i)
            this._randomNames.push(i);
        for (let i = this._randomNames.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._randomNames[i], this._randomNames[j]] = [this._randomNames[j], this._randomNames[i]];
        }
    }

}

/** Base class implementing a speedtrap race, where the winner is determined by total speed at checkpoints. */
export abstract class BaseSpeedtrapRace extends BaseRaceMission {

    private _lapsCount: int;
    private _positionGxt: string;

    /**
     * Sets the number of race laps, with a minimum of 1.
     * @param count - The number of laps for the race.
     */
    public set lapsCount(count: int) {
        this._lapsCount = 1 > count ? 1 : count;
    }

    /**
     * Sets the GXT key for the text displayed near the player's position in the race.
     * @param gxtKey - The GXT key for the position text.
     */
    public set positionGxt(gxtKey: string) {
        this._positionGxt = gxtKey;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._lapsCount = 1;
        this._positionGxt = "RACES44";
        this.setCheckpointTuneAsCameraShot();
    }

    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void {
        if (!racer.isPlayer || this._lapsCount > (racer.currentLap + 1))
            return;
        if (this.lastCheckpointId === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void {
        if (this._lapsCount > lastLap)
            return;
        this._recalculateSpeeds(racer.id);
    }

    public onDrawInfoEvent(): void {
        Screen.DisplayCounter(this._getPlayerPosition(), 1, this._positionGxt);
        Screen.DisplayCounter(this.playerRacer.totalSpeed, 2, "KICK1_9");
        if (this._lapsCount > 1)
            Screen.DisplayCounterWith2Numbers(this.playerRacer.currentLap + 1, this._lapsCount, 3, "RACES32");
    }



    private _getPlayerPosition(): int {
        let position = 1;
        const playerSpeed = this.playerRacer.totalSpeed;
        for (let i = 0; i < this.racersCount; ++i) {
            if (this.playerRacerId === i)
                continue;
            let currentStreetRacer = this.getRacer(i);
            if (currentStreetRacer.totalSpeed > playerSpeed)
                position += 1;
        }
        return position;
    }

    private _recalculateSpeeds(finishedRacerId: int): void {
        const lastCheckpointId = this.lastCheckpointId;
        const racersCount = this.racersCount;
        for (let i = 0; i < racersCount; ++i) {
            if (finishedRacerId === i || this.playerRacerId === i)
                continue;
            const currentStreetRacer = this.getRacer(i);
            if (lastCheckpointId === currentStreetRacer.nextNodeId) {
                currentStreetRacer.totalSpeed += this.getRouteNode(lastCheckpointId).speed;
                continue;
            }
            while (lastCheckpointId > currentStreetRacer.nextNodeId) {
                currentStreetRacer.nextNodeId = this.findNextCheckpointId(currentStreetRacer.nextNodeId);
                currentStreetRacer.totalSpeed += this.getRouteNode(currentStreetRacer.nextNodeId).speed;
            }
        }
        let maxSpeed = 0.0;
        let winnerId = 0;
        for (let i = 0; i < racersCount; ++i) {
            const currentStreetRacer = this.getRacer(i);
            if (currentStreetRacer.totalSpeed > maxSpeed) {
                maxSpeed = currentStreetRacer.totalSpeed;
                winnerId = i;
            }
        }
        if (this.getRacer(winnerId).isPlayer) {
            this.complete();
            return;
        }
        this.fail("RACEFA", 5000);
    }

}

/** Base class implementing a speed radar challenge, where the player must pass radars to achieve a required speed within an optional time limit. */
export abstract class BaseRadarChallenge extends BaseRaceMission {

    private _timeLimit: int;
    private _radarTimer: Timer;
    private _useTimer: boolean;
    private _playerSpeed: float;
    private _neededSpeed: float;
    private _radarNodes: RadarNode[];
    private _radarsCount: int;
    private _passedRadarsCount: int;
    private __onStartEvent: () => void;

    /**
     * Sets the time limit for the player to pass all radars, enabling the timer.
     * @param timeInMilliseconds - Time limit in milliseconds.
     */
    public set timeLimit(timeInMilliseconds: int) {
        this._timeLimit = timeInMilliseconds;
        this._useTimer = true;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._radarTimer = new Timer();
        this._useTimer = false;
        this._neededSpeed = 0.0;
        this._playerSpeed = 0.0;
        this._radarNodes = new Array<RadarNode>();
        this._radarsCount = 0;
        this._passedRadarsCount = 0;
        this._timeLimit = 10000;
        this.disablePlayerCheckpointsCheck();

        this.__onStartEvent = this.onStartEvent;

        this.onStartEvent = () => {
            this.__onStartEvent();
            let checkpointId = this.lastCheckpointId;
            do {
                const routeNode = this.getRouteNode(checkpointId);
                this._neededSpeed += routeNode.speed;
                this._radarNodes.push(new RadarNode(routeNode));
                checkpointId = this.findNextCheckpointId(checkpointId);
            } while (checkpointId !== this.lastCheckpointId);
            this._radarsCount = this._radarNodes.length;
            this._radarNodes.forEach(radarNode => radarNode.create());
            if (this._useTimer)
                this._radarTimer.reset(this._timeLimit);
        };
    }

    public onDrawInfoEvent(): void {
        if (this._useTimer) {
            if (0 >= this._radarTimer.millisecondsLeft) {
                this._removeAll(true, "BB_17");
                return;
            }
            Screen.DisplayTimeLeft(this._radarTimer);
        }
        for (let i = 0; i < this._radarsCount; ++i) {
            const radar = this._radarNodes[i];
            if (radar.isPassed)
                continue;
            if (this.playerRacerCar.locate3D(radar.x, radar.y, radar.z, 12.0, 12.0, 12.0, false)) {
                /*&& this._playerCar.isOnAllWheels()*/
                Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1132);
                radar.isPassed = true;
                radar.remove();
                this._passedRadarsCount += 1;
                this._playerSpeed += this.playerRacerCar.getSpeed();
                Text.PrintWith2NumbersNow("SN_ONE", this._passedRadarsCount, this._radarsCount, 5000, 1);
            }
        }
        Screen.DisplayCounter(this._playerSpeed, 1, "KICK1_9");
        Screen.DisplayCounter(this._neededSpeed, 2, "ST1_7");
        Screen.DisplayCounter(this.playerRacerCar.getSpeed(), 4);
        if (this._passedRadarsCount === this._radarsCount)
            this._removeAll(this._neededSpeed > this._playerSpeed, "DNC_003");
    }



    /** @returns Always false. */
    public canMarkCheckpointsAsFinish(): boolean {
        return false;
    }



    private _removeAll(isFailed: boolean, reasonSmallMessageGxt: string): void {
        this._radarNodes.forEach(radarNode => radarNode.remove());
        if (isFailed) {
            this.fail(reasonSmallMessageGxt, 5000);
        } else {
            this.complete();
        }
    }

}

/** Base class implementing a timed checkpoint challenge, where the player must pass checkpoints within time limits. */
export abstract class BaseCheckpointChallenge extends BaseRaceMission {

    private _lapsCount: int;
    private _checkpointTimer: Timer;
    private __onStartEvent: () => void;

    /**
     * Sets the number of challenge laps, with a minimum of 1.
     * @param count - The number of laps for the race.
     */
    public set lapsCount(count: int) {
        this._lapsCount = 1 > count ? 1 : count;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._checkpointTimer = new Timer();
        this._lapsCount = 1;
        this.setCheckpointTuneAsCameraShot();
        this.__onStartEvent = this.onStartEvent;

        this.onStartEvent = () => {
            this.__onStartEvent();
            const nextCheckpointId = this.findNextCheckpointId(-1);
            const nextRouteNode = this.getRouteNode(nextCheckpointId);
            this._checkpointTimer.reset(nextRouteNode.timeLimitMs);
        };
    }

    public onRacerRouteNodePassedEvent(racer: Racer, lastNode: RouteNode): void {
        if (racer.isPlayer && lastNode.isCheckpoint) {
            const nextCheckpointId = this.findNextCheckpointId(lastNode.checkpointId);
            const nextRouteNode = this.getRouteNode(nextCheckpointId);
            this._checkpointTimer.addMilliseconds(nextRouteNode.timeLimitMs);
            Text.PrintWithNumberNow("A_TIME", Math.floor((nextRouteNode.timeLimitMs / 1000) % 60), 5000, 1); // +seconds
        }
        if (!racer.isPlayer || this._lapsCount > (racer.currentLap + 1))
            return;
        if (this.lastCheckpointId === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    public onRacerLapPassedEvent(racer: Racer, lastLap: int): void {
        if (this._lapsCount > lastLap)
            return;
        if (racer.isPlayer)
            this.complete();
    }

    public onDrawInfoEvent(): void {
        if (this._lapsCount > 1)
            Screen.DisplayCounterWith2Numbers(this.playerRacer.currentLap + 1, this._lapsCount, 1, "RACES32");
        if (0 >= this._checkpointTimer.millisecondsLeft) {
            this.fail("BB_17", 5000);
            return;
        }
        Screen.DisplayTimeLeft(this._checkpointTimer);
    }

}

/** Base class implementing a wanted challenge, where the player must maintain a specified wanted level for a set time while evading cops. */
export abstract class BaseWantedChallenge extends BaseRaceMission {

    private _chaseStage: int;
    private _chaseTimer: Timer;
    private _timeMinimum: int;
    private _mandatoryToAvoidPolice: boolean;
    private _startGxt: string;
    private _lostWantedGxt: string;
    private _clearWantedGxt: string;

    /** Sets the startup message. */
    public set startMessage(gxtKey: string) {
        this._startGxt = gxtKey;
    }

    /** Sets the message displayed when the wanted level is lost. */
    public set lostWantedMessage(gxtKey: string) {
        this._lostWantedGxt = gxtKey;
    }

    /** Sets the message about the need to clear the wanted level. */
    public set clearWantedMessage(gxtKey: string) {
        this._clearWantedGxt = gxtKey;
    }

    /** Sets the minimum time the police wanted level must be maintained. */
    public set timeMinimum(timeInMilliseconds: int) {
        this._timeMinimum = timeInMilliseconds;
    }

    /** Gets the minimum wanted level required to hold. */
    public get minWantedLevel(): int {
        return super.minWantedLevel;
    }

    /**
     * Sets the minimum wanted level required to hold. 
     * @param level — The minimum wanted level (0 to 6)
     */
    public set minWantedLevel(level: int) {
        if (1 > level)
            level = 1;
        super.minWantedLevel = level;
    }



    public onInitEvent(): void {
        super.onInitEvent();
        this._chaseTimer = new Timer(10000);
        this._chaseStage = 0;
        this._startGxt = "";
        this._lostWantedGxt = "RACEFA";
        this._clearWantedGxt = "";
        this._mandatoryToAvoidPolice = false;
        this.savePlayerWeapons();
        this.loadWeaponModelsNow(29);
        this.playerChar.giveWeapon(29, 9999).setCurrentWeapon(29);
        this.unloadWeaponModels(29);
        this.disablePlayerCheckpointsCheck();
    }

    public onDrawInfoEvent(): void {
        switch (this._chaseStage) {
            case 0:
                this._chaseTimer.reset(this._timeMinimum);
                this.player.alterWantedLevel(this.minWantedLevel);
                if (this._startGxt.length > 0) {
                    this.printText(this._startGxt, 6000);
                } else {
                    this.printText("GYM1_6" + this.minWantedLevel.toString(), 5000);
                }
                this._chaseStage = 1;
                break;
            case 1:
                if (this.minWantedLevel > this.player.storeWantedLevel())
                    this.fail(this._lostWantedGxt, 5000);
                Screen.DisplayTimeLeft(this._chaseTimer);
                if (this._chaseTimer.millisecondsLeft > 1)
                    break;
                if (this._mandatoryToAvoidPolice) {
                    if (1 > this._clearWantedGxt.length) {
                        Text.LoadMissionText("RYDER3");
                        this._clearWantedGxt = "RYD3_I";
                    }
                    this.printText(this._clearWantedGxt, 6000);
                    this._chaseStage = 2;
                } else {
                    this._chaseStage = 3;
                }
                break;
            case 2:
                if (this.player.storeWantedLevel() === 0) {
                    Text.LoadMissionText("RACETOR");
                    this._chaseStage = 3;
                }
                break;
            case 3:
                this.player.clearWantedLevel();
                this.complete();
                break;
        }
    }



    /**
     * Sets traffic parameters, always enabling cops.
     * @param cars - The car density multiplier.
     * @param peds - The pedestrian density multiplier.
     * @param wantedMultiplier - The multiplier for wanted level (default: 1.0).
     */
    public setTraffic(cars: float, peds: float, cops: boolean = true, wantedMultiplier: float = 1.0): void {
        super.setTraffic(cars, peds, true, wantedMultiplier);
    }

    /** @returns Always false. */
    public canMarkCheckpointsAsFinish(): boolean {
        return false;
    }



    /** Makes it mandatory to avoid the police to complete the mission. */
    public makeMandatoryToAvoidPolice(): void {
        this._mandatoryToAvoidPolice = true;
    }

}