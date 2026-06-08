if (HOST !== "sa")
    exit(`Unsupported game!`);

//@ts-ignore
import "./DynamicImport";
import { App } from "./App";

App.Run();