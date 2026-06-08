/** Provides utility methods for logging messages and terminating the framework with error reporting. */
export class Logger {

    private static _PrintScriptErrorHelpMessage(): void {
        Text.ClearHelp();
        Text.PrintHelpFormatted(`Mission framework error! Check the file "cleo_redux.log".`);
    }

    /**
     * Logs a message to the script log.
     * @param message - The message to log.
     * @param includeErrorHelpMessage - Whether to display an in-game error help message.
     */
    public static Print(message: any, includeErrorHelpMessage: boolean = false): void {
        if (includeErrorHelpMessage)
            this._PrintScriptErrorHelpMessage();
        log(message);
    }

    /**
     * Terminates the script with an error message.
     * @param message - The error message.
     * @param includeErrorHelpMessage - Whether to display an in-game error help message.
     */
    public static Exit(message: any, includeErrorHelpMessage: boolean = false): void {
        if (includeErrorHelpMessage)
            this._PrintScriptErrorHelpMessage();
        exit(message);
    }



    private constructor() { }

}