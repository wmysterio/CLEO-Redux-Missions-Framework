if (HOST !== "sa")
    exit("Incorrect host!");

import { Core } from "./Core";
import { Canvas, Label, Rect, SCREEN_CENTER_X, SCREEN_CENTER_Y, SCREEN_WIDTH, TextAlign, TextFont } from "./Drawing";
import { NativeCamera } from "./Native";

/** Manages the application logic and user interface. */
export class App {

    private static _projectCount: int = 0;
    private static _storylineCount: int = 0;
    private static _missionIndexToSelect: int = -1;
    private static _activationKeyCode: int;
    private static _selectedStorylineRect: Rect;
    private static _missionNameLabel: Label;
    private static _missionCounterLabel: Label;
    private static _projectNameLabel: Label;
    private static _storylinesNames: Label[];
    private static _difficultyStars: Label[];
    private static _canvas: Canvas;

    private static readonly NUM_TOP_STORYLINES_ROWS: int = 3;
    private static readonly MIDDLE_STORYLINE_ROW: int = this.NUM_TOP_STORYLINES_ROWS + 1;
    private static readonly ALL_STORYLINES_ROWS: int = this.NUM_TOP_STORYLINES_ROWS + this.MIDDLE_STORYLINE_ROW;

    public static readonly FADE_TRANSITION_DURATION: int = 800;
    public static readonly INPUT_COOLDOWN: int = 200;



    private constructor() { }



    /**
     * Runs the application, initializing the core and handling menu interactions.
     * @param useManualProjectLoading - Whether to use manual project loading (default: true).
     * @returns True if the application runs successfully, false if no projects are loaded.
     */
    public static Run(useManualProjectLoading: boolean = true): boolean {
        Core.Run(useManualProjectLoading);
        this._projectCount = Core.ProjectsCount;
        if (1 > this._projectCount) {
            if (!useManualProjectLoading)
                exit("Application must have at least one project!");
            return false;
        }
        const errorsState = Core.ValidateSizes();
        if (errorsState.hasStorylineErrors)
            exit("Project must have at least one storyline!");
        if (errorsState.hasMissionErrors)
            exit("Storyline must have at least one mission!");
        this._readActivationKeyCode();
        while (true) {
            wait(0);
            if (!this._canPlayerOpenMenu(true)) {
                wait(249);
                continue;
            }
            if (Pad.IsKeyDown(this._activationKeyCode))
                this._updateMenu();
        }
    }



    private static _updateMenu(): void {
        Core.ActiveMissionInfo.projectIndex = 0;
        Core.ActiveMissionInfo.storylineIndex = 0;
        Core.ActiveMissionInfo.missionIndex = -1;
        this._canvas = this._loadCanvas();
        this._changeDifficultyStarsColors(Core.GameDifficulty);
        this._selectProject(Core.ActiveMissionInfo.projectIndex);
        Core.Player.setControl(false);
        TIMERA = 0;
        while (this._canPlayerOpenMenu()) {
            wait(0);
            if (TIMERA > this.INPUT_COOLDOWN) {
                if (Pad.IsKeyDown(this._activationKeyCode)) { // (F2 by default)
                    Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1138);
                    break;
                }
                if (Pad.IsKeyDown(82)) { // R
                    Core.ResetProject(Core.ActiveMissionInfo.projectIndex);
                    Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1138);
                    break;
                }
                if (Pad.IsKeyPressed(32) || Pad.IsKeyPressed(13)) { // Space, Return      || Pad.IsKeyPressed(70) F
                    if (this._missionIndexToSelect !== -1) {
                        Core.ActiveMissionInfo.missionIndex = this._missionIndexToSelect;
                        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1054);
                        break;
                    }
                    Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1053);
                    TIMERA = 0;
                }
            }
            if (this._projectCount > 1 && TIMERA > this.INPUT_COOLDOWN) {
                if (Pad.IsKeyPressed(65) || Pad.IsKeyPressed(37)) { // A, Left arrow
                    this._nextProject();
                } else if (Pad.IsKeyPressed(68) || Pad.IsKeyPressed(39)) { // D, Right arrow
                    this._prevProject();
                }
            }
            if (this._storylineCount > 1 && TIMERA > this.INPUT_COOLDOWN) {
                if (Pad.IsKeyPressed(87) || Pad.IsKeyPressed(38)) { // W, Up arrow
                    this._prevStoryline();
                } else if (Pad.IsKeyPressed(83) || Pad.IsKeyPressed(40)) { // S, Down arrow
                    this._nextStoryline();
                }
            }
            if (TIMERA > this.INPUT_COOLDOWN) {
                if (Pad.IsKeyPressed(49)) {
                    this._saveGameDifficulty(0);
                } else if (Pad.IsKeyPressed(50)) {
                    this._saveGameDifficulty(1);
                } else if (Pad.IsKeyPressed(51)) {
                    this._saveGameDifficulty(2);
                }
            }
            Core.ClearText();
            this._canvas.draw();
        }
        this._unloadCanvas();
        Text.UseCommands(false);
        Core.Player.setControl(true);
        if (Core.ActiveMissionInfo.missionIndex > -1) {
            Core.RunMission();
            wait(250);
        }
        Core.UnloadFxtFile(Core.ActiveMissionInfo.projectIndex);
        while (!Core.Player.isPlaying())
            wait(250);
        Core.PlayerChar = Core.Player.getChar();
        Core.PlayerGroup = Core.Player.getGroup();
    }

    private static _nextProject(): void {
        let nextIndex = Core.ActiveMissionInfo.projectIndex + 1;
        if (nextIndex >= this._projectCount)
            nextIndex = 0;
        this._selectProject(nextIndex);
    }

    private static _prevProject(): void {
        let nextIndex = Core.ActiveMissionInfo.projectIndex - 1;
        if (nextIndex < 0)
            nextIndex = this._projectCount - 1;
        this._selectProject(nextIndex);
    }

    private static _selectProject(projectIndex: int): void {
        Core.UnloadFxtFile(Core.ActiveMissionInfo.projectIndex)
        Core.LoadFxtFile(projectIndex);
        Core.ActiveMissionInfo.projectIndex = projectIndex;
        const projectInfo = Core.GetProjectInfoAt(projectIndex);
        this._projectNameLabel.text = projectInfo.titleGxtKey;
        this._storylineCount = projectInfo.storylines.size;
        this._selectStoryline(0, false);
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1138);
        TIMERA = 0;
    }

    private static _nextStoryline(): void {
        let nextIndex = Core.ActiveMissionInfo.storylineIndex + 1;
        if (nextIndex >= this._storylineCount)
            nextIndex = 0;
        this._selectStoryline(nextIndex, true);
    }

    private static _prevStoryline(): void {
        let nextIndex = Core.ActiveMissionInfo.storylineIndex - 1;
        if (0 > nextIndex)
            nextIndex = this._storylineCount - 1;
        this._selectStoryline(nextIndex, true);
    }

    private static _selectStoryline(nextIndex: int, playAudio: boolean): void {
        Core.ActiveMissionInfo.storylineIndex = nextIndex;
        this._clearCanvasTexts();
        this._missionIndexToSelect = -1;
        const projectInfo = Core.GetProjectInfoAt(Core.ActiveMissionInfo.projectIndex);
        for (let i = 0, j = nextIndex - this.NUM_TOP_STORYLINES_ROWS; i < this.ALL_STORYLINES_ROWS; ++i, ++j) {
            if (0 > j)
                continue;
            if (this._storylineCount > j) {
                const storylineInfo = projectInfo.storylines.get(j);
                const missionsCount = storylineInfo.missions.size;
                const progress = storylineInfo.progress;
                let storylineGxt = "BJ_HIDE";
                if (missionsCount > progress) {
                    const missionInfo = storylineInfo.missions.get(progress);
                    const canStartMission = missionInfo.create().onCheckStartConditions();
                    if (canStartMission || progress > 0)
                        storylineGxt = storylineInfo.titleGxtKey;
                    if (j === nextIndex) {
                        this._selectedStorylineRect.changeColor(210, 45, 57, 172);
                        this._missionCounterLabel.changeFormattedText("%d/%d", progress, missionsCount);
                        this._missionNameLabel.changeText(canStartMission ? missionInfo.titleGxtKey : "BJ_HIDE");
                        if (canStartMission)
                            this._missionIndexToSelect = missionInfo.missionIndex;
                    }
                } else {
                    storylineGxt = storylineInfo.titleGxtKey;
                    if (j === nextIndex) {
                        this._selectedStorylineRect.changeColor(51, 125, 69, 172);
                        this._missionCounterLabel.changeFormattedText("%d/%d", progress, missionsCount);
                    }
                }
                this._storylinesNames[i].changeText(storylineGxt);
                this._storylinesNames[i].visible = true;
            }
        }
        if (playAudio)
            Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1137);
        TIMERA = 0;
    }

    private static _saveGameDifficulty(level: int) {
        Core.GameDifficulty = level;
        this._changeDifficultyStarsColors(level);
        Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1138);
        TIMERA = 0;
    }

    private static _changeDifficultyStarsColors(level: int): void {
        for (let i = 0; i < 3; ++i)
            this._difficultyStars[i].changeColor(255, 255, 255, level >= i ? 255 : 128);
    }

    private static _loadCanvas(): Canvas {

        this._difficultyStars = new Array<Label>();
        this._storylinesNames = new Array<Label>();

        let globalCenterY = SCREEN_CENTER_Y - 110.0;
        const starCenterY = globalCenterY + 5.0;
        const storylineHeight = Label.CalculateRowHeight(1.8, 6.0);
        let alphaStep = 70;
        let alpha = 255 - this.NUM_TOP_STORYLINES_ROWS * alphaStep;

        const canvas = new Canvas(0, 0, 0, 0);

        const storylineBackground = canvas.addRect(SCREEN_CENTER_X, 0.0, SCREEN_WIDTH, (this.ALL_STORYLINES_ROWS + 1) * storylineHeight + 6.0, 37, 41, 46, 172);

        this._projectNameLabel = canvas.addLabel(10.0, globalCenterY, 255, 255, 255, 255);
        this._projectNameLabel.shadowA = 0;
        this._projectNameLabel.font = TextFont.Menu;
        this._projectNameLabel.changeScale(0.6, 2.8, 12.0);

        canvas.insertAtStart(new Rect(SCREEN_CENTER_X, this._projectNameLabel.calculateYCenterForRect(globalCenterY), SCREEN_WIDTH, this._projectNameLabel.height, 37, 41, 46, 240))

        for (let i = 0, j = 636.0 - (2.0 * 26.0); i < 3; ++i, j += 26.0) {
            const star = canvas.addLabel(j, starCenterY, 255, 255, 255, 128);
            star.font = TextFont.Gothic;
            star.align = TextAlign.Right;
            star.shadowA = 0;
            star.changeScale(0.6253, 2.0876);
            star.changeFormattedText("]");
            this._difficultyStars.push(star);
        }

        globalCenterY += this._projectNameLabel.height;

        this._selectedStorylineRect = canvas.addRect(SCREEN_CENTER_X, 0.0, SCREEN_WIDTH, storylineHeight * 2.0, 210, 45, 57, 172);

        for (let i = 0, storylinePositionY = globalCenterY; i < this.ALL_STORYLINES_ROWS; ++i, storylinePositionY += storylineHeight) {
            const storylinesName = canvas.addLabel(10.0, storylinePositionY, 255, 255, 255, alpha);
            storylinesName.font = TextFont.Menu;
            storylinesName.shadowA = 0;
            storylinesName.changeScale(0.5, 1.8, 6.0);
            this._storylinesNames.push(storylinesName);
            if (i === this.MIDDLE_STORYLINE_ROW - 1) {
                storylinesName.a = 255;
                this._selectedStorylineRect.centerY = storylinePositionY + storylinesName.height - 2.0;
                this._missionCounterLabel = canvas.addLabel(634.0, storylinePositionY, 255, 255, 255, 255);
                this._missionCounterLabel.font = TextFont.Menu;
                this._missionCounterLabel.align = TextAlign.Right;
                this._missionCounterLabel.shadowA = 0;
                this._missionCounterLabel.changeScale(0.8, 3.8);
                storylinePositionY += storylineHeight;
                this._missionNameLabel = canvas.addLabel(20.0, storylinePositionY, 255, 255, 255, 255);
                storylineBackground.centerY = this._missionNameLabel.calculateYCenterForRect(storylinePositionY) - 5.0;
                this._missionNameLabel.font = TextFont.Menu;
                this._missionNameLabel.shadowA = 0;
                this._missionNameLabel.changeEdge(2, 0, 0, 0, 255);
                this._missionNameLabel.changeScale(0.5, 1.8, 6.0);
                alpha -= alphaStep;
                alphaStep *= -1;
                continue;
            }
            alpha += alphaStep;
        }

        this._clearCanvasTexts();
        return canvas;
    }

    private static _unloadCanvas(): void {
        this._selectedStorylineRect = null;
        this._missionNameLabel = null;
        this._missionCounterLabel = null;
        this._projectNameLabel = null;
        this._storylinesNames = null;
        this._difficultyStars = null;
        this._canvas = null;
    }

    private static _clearCanvasTexts(): void {
        for (let i = 0; i < this.ALL_STORYLINES_ROWS; ++i) {
            this._storylinesNames[i].visible = false;
            this._storylinesNames[i].changeText("DUMMY");
        }
        this._missionCounterLabel.changeFormattedText("");
        this._missionNameLabel.text = "DUMMY";
    }

    private static _canPlayerOpenMenu(requireControl: boolean = false): boolean {
        if (Core.IsPlayerInactive() || ONMISSION || NativeCamera.GetFadingStatus() > 0)
            return false;
        if (Streaming.GetAreaVisible() !== 0 || Core.PlayerChar.getAreaVisible() !== 0)
            return false;
        if (requireControl) {
            if (Core.PlayerChar.isInWater() || Core.PlayerChar.isInAir())
                return false;
            return Core.Player.isControlOn() && Core.PlayerChar.isOnFoot() && Core.PlayerChar.isStopped();
        }
        return true;
    }

    private static _readActivationKeyCode(): void {
        this._activationKeyCode = 113;
        if (Fs.DoesFileExist(Core.CONFIG_PATH)) {
            this._activationKeyCode = IniFile.ReadInt(Core.CONFIG_PATH, "Application", "ActivationKeyCode");
            if (this._activationKeyCode === undefined || 0 > this._activationKeyCode || 256 > this._activationKeyCode)
                this._activationKeyCode = 113;
        }
        IniFile.WriteInt(this._activationKeyCode, Core.CONFIG_PATH, "Application", "ActivationKeyCode");
    }

}