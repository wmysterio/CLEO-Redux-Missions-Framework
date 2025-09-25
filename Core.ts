import { App } from "./App";
import { BaseProject } from "./BaseProject";
import { BaseMission } from "./BaseMission";
import { BaseStoryline } from "./BaseStoryline";
import { BaseScriptedScene, ISequenceChaining } from "./BaseScriptedScene";
import { NativeCamera } from "./Native";
import { Timer } from "./Timer";

class MissionInfo {

    public projectIndex: int;
    public storylineIndex: int;
    public missionIndex: int;
    public titleGxtKey: string;
    public create: () => BaseMission;



    public constructor(titleGxtKey: string, create: () => BaseMission) {
        this.titleGxtKey = titleGxtKey;
        this.create = create;
    }

}

class StorylineInfo {

    public progress: int;
    public projectIndex: int;
    public storylineIndex: int;
    public titleGxtKey: string;
    public missions: Map<int, MissionInfo>;



    public constructor(titleGxtKey: string, missions: Map<int, MissionInfo>) {
        this.titleGxtKey = titleGxtKey;
        this.missions = missions;
    }

}

class ProjectInfo {

    public projectIndex: int;
    public titleGxtKey: string;
    public rootDirectory: string;
    public iniSectionName: string;
    public storylines: Map<int, StorylineInfo>;



    public constructor(titleGxtKey: string, rootDirectory: string, iniSectionName: string, storylines: Map<int, StorylineInfo>) {
        this.titleGxtKey = titleGxtKey;
        this.rootDirectory = rootDirectory;
        this.iniSectionName = iniSectionName;
        this.storylines = storylines;
    }

}

/**
 * Static class that manages core game logic, resources, missions, storylines, projects, and scripted scenes.
 * Provides centralized control for game state, player interactions, and resource management.
 */
export class Core {

    private static _isInitialized: boolean = false;
    private static _gameDifficulty: int;
    private static _missionState: int = 0;
    private static _lastProjects: Map<int, ProjectInfo> = new Map<int, ProjectInfo>();
    private static _lastStorylines: Map<int, StorylineInfo> = new Map<int, StorylineInfo>();
    private static _lastMissions: Map<int, MissionInfo> = new Map<int, MissionInfo>();
    private static _projectsMap: Map<int, ProjectInfo> = new Map<int, ProjectInfo>();

    private static readonly _skipScriptedSceneError = new Error();

    public static readonly SAVE_PATH: string = __dirname + "\\Save";
    public static readonly CONFIG_PATH: string = __dirname + "\\Config.ini";
    public static readonly MISSION_FAILURE_ERROR = new Error();
    public static readonly MISSION_SUCCESS_ERROR = new Error();
    public static readonly ActiveMissionInfo: MissionInfo = new MissionInfo("DUMMY", undefined);

    public static GameRootDirectory: string;
    public static Player: Player;
    public static PlayerChar: Char;
    public static PlayerGroup: Group;

    /** Gets the number of registered projects. */
    public static get ProjectsCount(): int {
        return this._projectsMap.size;
    }

    /** Gets the game difficulty level. */
    public static get GameDifficulty(): int {
        return this._gameDifficulty;
    }

    /**
     * Saves the game difficulty level, clamping it between 0 and 2.
     * @param level - The difficulty level to set.
     */
    public static set GameDifficulty(level: int) {
        if (level === this._gameDifficulty)
            return;
        this._gameDifficulty = this._clampGameDifficulty(level);
        IniFile.WriteInt(level, this.CONFIG_PATH, "Application", "GameDifficulty");
    }

    private constructor() { }




    /**
     * Checks if the player is in a non-playable state ({@link Player.isPlaying}, {@link Char.DoesExist}, {@link Char.IsDead}, and {@link Char.hasBeenArrested}).
     * @returns True if the player cannot interact with the game world, false otherwise.
     */
    public static IsPlayerInactive(): boolean {
        if (!this.Player.isPlaying() || !Char.DoesExist(+this.PlayerChar))
            return true;
        return Char.IsDead(+this.PlayerChar) || this.PlayerChar.hasBeenArrested();
    }


    /** Clears all text elements from the screen, including help, prints, and big messages. */
    public static ClearText(): void {
        Text.ClearHelp();
        Text.ClearPrints();
        Text.ClearSmallPrints();
        for (let i = 0; i < 8; ++i) {
            if (i === 3)
                continue;
            Text.ClearThisPrintBigNow(i);
        }
    }

    /**
     * Waits until all specified items are loaded.
     * @param items - Array of items to check for loading.
     * @param checkLoaded - Callback function to check if an item is loaded.
     */
    public static WaitUntilLoaded<T>(items: T[], checkLoaded: (item: T) => boolean): void {
        do {
            wait(0);
        } while (items.some(item => !checkLoaded(item)));
    }

    /** Runs a mission through its lifecycle and sets the global ONMISSION flag. */
    public static RunMission(): void {
        const missionInfo = this.GetMissionInfoAt(this.ActiveMissionInfo.projectIndex, this.ActiveMissionInfo.storylineIndex, this.ActiveMissionInfo.missionIndex);
        const mission = missionInfo.create();
        ONMISSION = true;
        TIMERB = 0;
        do {
            wait(0);
            if (this.IsPlayerInactive())
                this._missionState = 3;
            switch (this._missionState) {
                case 0:
                    this._runMissionStartEvent(mission);
                    break;
                case 1:
                    this._runMissionUpdateEvent(mission);
                    break;
                case 2:
                    this._runMissionSuccessEvent(mission);
                    break;
                case 3:
                    this._runMissionFailureEvent(mission);
                    break;
                case 4:
                    this._runMissionEndEvent(mission);
                    break;
            }
        } while (this._missionState !== 5);
        ONMISSION = false;
        this._missionState = 0;
    }

    /**
     * Runs a scripted scene through its lifecycle. Manages HUD, camera, player control, and world settings.
     * @param scriptedScene - The scripted scene to run.
     * @param debugMode - If true, bypasses standard scene setup for manual control.
     */
    public static RunScriptedScene(scriptedScene: BaseScriptedScene, debugMode: boolean): void {
        this._runScriptedSceneBeforeInitEvent();
        scriptedScene.onInitEvent();
        if (debugMode) {
            scriptedScene.onStartEvent();
            wait(1500);
            scriptedScene.onRunEvent();
            this._playSequenceChaining(scriptedScene);
            scriptedScene.resetCamera();
            scriptedScene.onCleanupEvent();
            scriptedScene.onEndEvent();
            this._runScriptedSceneAfterEndEvent();
            return;
        }
        Hud.DisplayZoneNames(false);
        Hud.DisplayCarNames(false);
        this.Player.setControl(false);
        if (NativeCamera.GetFadingStatus() !== 2)
            scriptedScene.fadeToOpaque();
        while (NativeCamera.GetFadingStatus() !== 2)
            wait(100);
        scriptedScene.onStartEvent();
        wait(1500);
        if (scriptedScene.useWorldSettings)
            this._disableDefaultWorldSetting();
        Hud.DisplayRadar(false);
        Hud.Display(false);
        Hud.SwitchWidescreen(true);
        wait(App.FADE_TRANSITION_DURATION);
        scriptedScene.clearText();
        scriptedScene.fadeToTransparent();
        scriptedScene.onRunEvent();
        this._playSequenceChaining(scriptedScene);
        scriptedScene.clearText();
        scriptedScene.fadeToOpaque();
        while (NativeCamera.GetFadingStatus() !== 2)
            wait(100);
        scriptedScene.resetCamera();
        scriptedScene.onCleanupEvent();
        scriptedScene.onEndEvent();
        wait(App.FADE_TRANSITION_DURATION);
        if (scriptedScene.useWorldSettings)
            this._enableDefaultWorldSetting();
        this.Player.setControl(true);
        this._runScriptedSceneAfterEndEvent();
        this.PlayerChar.clearTasksImmediately();
        scriptedScene.resetHud();
        scriptedScene.clearText();
        scriptedScene.fadeToTransparent();
    }

    /**
     * Initializes the core game environment and player.
     * @param useManualProjectLoading - Whether to use manual project loading (default: false).
     * @returns True if initialization is successful, false otherwise.
     */
    public static Run(useManualProjectLoading: boolean): boolean {
        if (useManualProjectLoading) {
            if (this._isInitialized)
                return false;
            this._initializeProjectsMap();
            this._isInitialized = this._projectsMap.size > 0;
            if (!this._isInitialized)
                return false;
        } else {
            this._initializeProjectsMap();
            this._isInitialized = true;
        }

        this._initializeGameRootDirectory();
        this._loadGameDifficulty(1);
        this._initializePlayer();
        return true;
    }

    /**
     * Retrieves project information by its index.
     * @param projectIndex - The index of the project.
     * @returns The project information.
     */
    public static GetProjectInfoAt(projectIndex: int): ProjectInfo {
        return this._projectsMap.get(projectIndex);
    }

    /**
     * Retrieves storyline information by its index.
     * @param projectIndex - The index of the storyline.
     * @returns The storyline information.
     */
    public static GetStorylineInfoAt(projectIndex: int, storylineIndex: int): StorylineInfo {
        return this._projectsMap.get(projectIndex).storylines.get(storylineIndex);
    }

    /**
     * Retrieves mission information by project, storyline, and mission indices.
     * @param projectIndex - The index of the project.
     * @param storylineIndex - The index of the storyline within the project.
     * @param missionIndex - The index of the mission within the storyline.
     * @returns The mission information or undefined.
     */
    public static GetMissionInfoAt(projectIndex: int, storylineIndex: int, missionIndex: int): MissionInfo {
        return this._projectsMap.get(projectIndex).storylines.get(storylineIndex).missions.get(missionIndex);
    }

    /**
     * Registers a mission in the core system.
     * @param mission - The base mission instance.
     */
    public static RegisterMission(mission: BaseMission): void {
        if (this._isInitialized)
            return;
        const missionConstructor = mission.constructor as new () => BaseMission;
        let create = (): BaseMission => {
            const instance = new missionConstructor();
            if (!(instance instanceof BaseMission)) {
                throw new Error(`Created instance is not of type BaseMission: ${missionConstructor.name}`);
            }
            return instance;
        };
        this._lastMissions.set(this._lastMissions.size, new MissionInfo(mission.constructor.name, create));
    }

    /**
     * Registers a storyline in the core system.
     * @param storyline - The storyline to register.
     */
    public static RegisterStoryline(storyline: BaseStoryline): void {
        if (this._isInitialized)
            return;
        this._lastStorylines.set(this._lastStorylines.size, new StorylineInfo(storyline.constructor.name, this._lastMissions));
        this._lastMissions = new Map<int, MissionInfo>();
    }

    /**
     * Registers a project in the core system.
     * @param project - The project to register.
     */
    public static RegisterProject(project: BaseProject): void {
        if (this._isInitialized)
            return;
        let projectRootDirectory = project.getRootDirectory();
        let pathToTest = projectRootDirectory.replace(__dirname, '').replace(/^\\/g, '');
        if (/[\[\]\\\/]/g.test(pathToTest))
            exit(`Invalid project directory: ${projectRootDirectory}!`);
        let projectTypeName = project.constructor.name;
        if (projectTypeName !== "PROJECT")
            exit(`Incorrect project name: ${projectTypeName}!`);
        this._lastProjects.set(this._lastProjects.size, new ProjectInfo(projectTypeName, `${projectRootDirectory}\\`, `PROJECT_${pathToTest}`, this._lastStorylines));
        this._lastStorylines = new Map<int, StorylineInfo>();
    }

    /**
     * Removes all project data from the save file.
     * @param projectIndex - The index of the project.
     */
    public static ResetProject(projectIndex: int): void {
        const projectInfo = this._projectsMap.get(projectIndex);
        const storylines = projectInfo.storylines;
        IniFile.DeleteSection(this.SAVE_PATH, projectInfo.iniSectionName);
        for (const [_, storyline] of storylines)
            storyline.progress = 0;
    }

    /**
     * Loads the text resources for the project from its FXT file.
     * @param projectIndex - The index of the project.
     * @remarks The FXT file is expected to be located in the project's root directory.
     */
    public static LoadFxtFile(projectIndex: int): void {
        const fxtPath = `${this._projectsMap.get(projectIndex).rootDirectory}Text.fxt`;
        FxtStore.insert("TEXTW2N", "~1~ ~1~", true);
        if (Fs.DoesFileExist(fxtPath))
            Text.LoadFxt(fxtPath);
    }

    /**
     * Unloads the text resources for the project from its FXT file.
     * @param projectIndex - The index of the project.
     * @remarks The FXT file is expected to be located in the project's root directory.
     */
    public static UnloadFxtFile(projectIndex: int): void {
        const fxtPath = `${this._projectsMap.get(projectIndex).rootDirectory}Text.fxt`;
        FxtStore.delete("TEXTW2N", true);
        if (Fs.DoesFileExist(fxtPath))
            Text.UnloadFxt(fxtPath);
    }

    /**
     * Validates that each project has at least one storyline and each storyline has at least one mission.
     * @returns An object indicating errors in storylines or missions sizes.
     */
    public static ValidateSizes(): { hasStorylineErrors: boolean; hasMissionErrors: boolean } {
        this._lastProjects = null;
        this._lastStorylines = null;
        this._lastMissions = null;
        const errors = {
            hasStorylineErrors: false,
            hasMissionErrors: false
        };
        for (const [_, project] of this._projectsMap) {
            if (project.storylines.size === 0) {
                errors.hasStorylineErrors = true;
                return errors;
            }
            for (const [_, storyline] of project.storylines) {
                if (storyline.missions.size === 0) {
                    errors.hasMissionErrors = true;
                    return errors;
                }
            }
        }
        return errors;
    }



    private static _initializePlayer(): void {
        this.Player = new Player(0);
        while (!this.Player.isPlaying()) {
            wait(250);
        }
        this.PlayerChar = Core.Player.getChar();
        this.PlayerGroup = Core.Player.getGroup();
    }

    private static _initializeProjectsMap(): void {
        this._projectsMap = this._lastProjects;
        for (const [projectKey, project] of this._projectsMap) {
            project.projectIndex = projectKey;
            for (const [storylineKey, storyline] of project.storylines) {
                storyline.projectIndex = projectKey;
                storyline.storylineIndex = storylineKey;
                for (const [missionKey, mission] of storyline.missions) {
                    mission.projectIndex = projectKey;
                    mission.storylineIndex = storylineKey;
                    mission.missionIndex = missionKey;
                }
                storyline.progress = this._loadProgress(project, storyline);
            }
        }
    }

    private static _initializeGameRootDirectory(): void {
        const split = __dirname.split('\\');
        const cleoIndex = split.findIndex(s => s.toUpperCase() === "CLEO");
        if (cleoIndex === -1 || cleoIndex < 2)
            exit(`Invalid framework directory: ${__dirname}`);
        this.GameRootDirectory = split.slice(cleoIndex).join('\\').replace(/^\\/g, '');
    }

    public static _loadGameDifficulty(defaultValue: int): int {
        defaultValue = this._clampGameDifficulty(defaultValue);
        let result = IniFile.ReadInt(this.CONFIG_PATH, "Application", "GameDifficulty");
        if (result === undefined)
            result = defaultValue;
        this.GameDifficulty = result;
        return result;
    }

    private static _clampGameDifficulty(level: int): int {
        if (level < 0)
            return 0;
        if (level > 2)
            return 2;
        return level;
    }

    private static _getMissionsPassedIniKey(storylineIndex: int): string {
        return `STORYLINE_${storylineIndex}_MISSIONS_PASSED`;
    }

    private static _saveProgress(): void {
        const nextProgress = this.ActiveMissionInfo.missionIndex + 1;
        const storylineIndex = this.ActiveMissionInfo.storylineIndex;
        const projectInfo = this.GetProjectInfoAt(this.ActiveMissionInfo.projectIndex);
        IniFile.WriteInt(nextProgress, this.SAVE_PATH, projectInfo.iniSectionName, this._getMissionsPassedIniKey(storylineIndex));
        projectInfo.storylines.get(storylineIndex).progress = nextProgress;
    }

    private static _loadProgress(projectInfo: ProjectInfo, storylineInfo: StorylineInfo): int {
        let progress = IniFile.ReadInt(this.SAVE_PATH, projectInfo.iniSectionName, this._getMissionsPassedIniKey(storylineInfo.storylineIndex));
        if (progress === undefined || 0 > progress)
            progress = 0;
        let numMissions = storylineInfo.missions.size;
        if (progress >= numMissions)
            progress = numMissions;
        return progress;
    }

    private static _runMissionStartEvent(mission: BaseMission): void {
        mission.onInitEvent();
        mission.clearText();
        Stat.RegisterMissionGiven();
        Stat.ShowUpdateStats(false);
        Game.SetCreateRandomGangMembers(false);
        Game.SetCreateRandomCops(false);
        Game.EnableAmbientCrime(false);
        Game.SwitchPoliceHelis(false);
        Game.SwitchCopsOnBikes(false);
        Game.SwitchRandomTrains(false);
        Game.SwitchAmbientPlanes(false);
        Game.SwitchEmergencyServices(false);
        this.Player.setGroupRecruitment(false);
        mission.playerGroup.remove();
        mission.audioBackground.play(0, true);
        mission.onStartEvent();
        if (mission.enableTitleMessage)
            Text.PrintBig(this.ActiveMissionInfo.titleGxtKey, 1000, 2);
        mission.audioBackground.play(0, true);
        this._missionState = 1;
    }

    private static _runMissionUpdateEvent(mission: BaseMission): void {
        try {
            if (ONMISSION) {
                mission.onUpdateEvent();
                return;
            }
            throw this.MISSION_FAILURE_ERROR;
        } catch (error) {
            if (error === this.MISSION_SUCCESS_ERROR) {
                this._missionState = 2;
            } else if (error === this.MISSION_FAILURE_ERROR) {
                this._missionState = 3;
            } else {
                log(error);
                Text.PrintHelpFormatted("Script error. Check logs.");
                this._missionState = 5;
            }
        }
    }

    private static _runMissionSuccessEvent(mission: BaseMission): void {
        this._runMissionCleanupEvent(mission);
        Stat.IncrementIntNoMessage(147, 1);
        if (mission.successSound)
            Audio.PlayMissionPassedTune(1);
        const respectReward = mission.respectReward;
        const cashReward = mission.cashReward;
        let rewardFlag = 0;
        if (mission.respectReward > 0) {
            rewardFlag += 1;
            Stat.AwardPlayerMissionRespect(respectReward);
        }
        if (cashReward > 0) {
            rewardFlag += 2;
            this.Player.addScore(cashReward);
        }
        if (mission.enableSuccessBigMessage) {
            switch (rewardFlag) {
                case 3:
                    Text.PrintWithNumberBig("M_PASSS", cashReward, 5000, 1); // Mission passed +$ +Respect
                    break;
                case 2:
                    Text.PrintWithNumberBig("M_PASS", cashReward, 5000, 1); // Mission passed +$
                    break;
                case 1:
                    Text.PrintBig("M_PASSR", 5000, 1); // Mission passed +Respect
                    break;
                default:
                    let bigMessage = mission.successBigMessage;
                    Text.PrintBig(bigMessage.gxt, bigMessage.duration, 1);
                    break;
            }
        }
        mission.onSuccessEvent();
        if (mission.enableProgressSaving)
            this._saveProgress();
        this._missionState = 4;
    }

    private static _runMissionFailureEvent(mission: BaseMission): void {
        this._runMissionCleanupEvent(mission);
        mission.onFailureEvent();
        if (mission.enableFailureBigMessage) {
            const bigMessage = mission.failureBigMessage;
            wait(250);
            Text.PrintBig(bigMessage.gxt, bigMessage.duration, 1);
        }
        const smallMessage = mission.failureSmallMessage;
        if (smallMessage.duration > 0)
            Text.PrintNow(smallMessage.gxt, smallMessage.duration, 1);
        this._missionState = 4;
    }

    private static _runMissionCleanupEvent(mission: BaseMission): void {
        mission.clearText();
        mission.voiceAudio.unload();
        mission.audioBackground.unload();
        mission.dialogue.unload();
        mission.onCleanupEvent();
    }

    private static _runMissionEndEvent(mission: BaseMission): void {
        Game.SetCreateRandomGangMembers(true);
        Game.SetCreateRandomCops(true);
        Game.EnableAmbientCrime(true);
        Game.SwitchPoliceHelis(true);
        Game.SwitchCopsOnBikes(true);
        Game.SwitchRandomTrains(true);
        Game.SwitchAmbientPlanes(true);
        Game.SwitchEmergencyServices(true);
        this._runScriptedSceneAfterEndEvent();
        mission.resetHud();
        mission.resetCamera();
        this._enableDefaultWorldSetting();
        Weather.Release();
        this.Player.alterWantedLevelNoDrop(0);
        this.Player.setGroupRecruitment(true).setControl(true);
        this.PlayerGroup.remove();
        Stat.ShowUpdateStats(true);
        Mission.Finish();
        mission.onEndEvent();
        this._missionState = 5;
    }

    private static _playSequenceChaining(sequenceChaining: ISequenceChaining): void {
        Game.AllowPauseInWidescreen(true);
        const _wait = wait;
        const _fade = Camera.DoFade;
        Camera.DoFade = (time, direction) => {
            log("Do not use 'Camera.DoFade' method during a scripted scene. There may be bugs!");
        };
        //@ts-ignore
        wait = (time) => {
            log("Do not use the 'wait' function during a scripted scene. There may be bugs!");
        };
        const scriptedWait = (time) => {
            _wait(time);
            if (Pad.IsSkipCutsceneButtonPressed())
                throw this._skipScriptedSceneError;
        };
        const timer = new Timer();
        const actions = sequenceChaining.actionsSequence;
        try {
            for (let i = 0; i < actions.length; ++i) {
                let action = actions[i];
                if (action.action !== undefined)
                    action.action();
                if (action.duration === -1) {
                    if (action.condition === undefined)
                        continue;
                    while (action.condition())
                        scriptedWait(0);
                    continue;
                }
                timer.reset();
                while (action.duration > timer.millisecondsPassed)
                    scriptedWait(0);
            }
        } catch (e) {
            if (e !== this._skipScriptedSceneError) {
                //@ts-ignore
                wait = _wait;
                Camera.DoFade = _fade;
                Game.AllowPauseInWidescreen(false);
                throw e;
            }
        }
        //@ts-ignore
        wait = _wait;
        Camera.DoFade = _fade;
        Game.AllowPauseInWidescreen(false);
    }

    private static _disableDefaultWorldSetting(): void {
        World.SetPedDensityMultiplier(0.0);
        World.SetCarDensityMultiplier(0.0);
        Game.SetWantedMultiplier(0.0);
        Game.SetPoliceIgnorePlayer(this.Player, true);
        Game.SetEveryoneIgnorePlayer(this.Player, true);
    }

    private static _enableDefaultWorldSetting(): void {
        World.SetPedDensityMultiplier(1.0);
        World.SetCarDensityMultiplier(1.0);
        Game.SetWantedMultiplier(1.0);
        Game.SetPoliceIgnorePlayer(this.Player, false);
        Game.SetEveryoneIgnorePlayer(this.Player, false);
    }

    private static _runScriptedSceneBeforeInitEvent(): void {
        this.PlayerChar
            .hideWeaponForScriptedCutscene(true)
            .shutUp(true)
            .clearTasks()
            .clearLookAt()
            .stopFacialTalk();
    }

    private static _runScriptedSceneAfterEndEvent(): void {
        this.PlayerChar
            .hideWeaponForScriptedCutscene(false)
            .shutUp(false)
            .clearTasks()
            .clearLookAt()
            .stopFacialTalk()
            .setCanBeKnockedOffBike(false);
    }

}