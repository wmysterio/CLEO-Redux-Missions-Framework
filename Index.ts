import { App } from "./App";






import "./Project3/PROJECT";






if (App.Run())
    exit();

let directoryMask = `${__dirname}\\`;
let dynamicImportFilePath = `${directoryMask}DynamicImport.ts`;

if (Fs.DoesFileExist(dynamicImportFilePath))
    Fs.DeleteFile(dynamicImportFilePath);

let hDynamicImportFile = File.Open(dynamicImportFilePath, 0x7477); // wt
if (hDynamicImportFile === undefined)
    exit("Could not open file!");

let hFindFile = FindFile.First(`${directoryMask}*`);
if (hFindFile.handle === undefined) {
    hDynamicImportFile.close();
    exit("Could not find folders!");
}

let directoryName = hFindFile.fileName;
let fileCounter = 0;
let projectsNotFound = true;
let regexPattern = new RegExp("^[a-zA-Z][a-zA-Z0-9_]{0,13}$", 'g');
do {
    if (directoryName !== undefined) {
        let matches = directoryName.match(regexPattern);
        if (matches !== null && matches !== undefined && matches.length > 0) {
            let dirCandidate = `${__dirname}\\${directoryName}\\`;
            if (Fs.DoesDirectoryExist(dirCandidate) && Fs.DoesFileExist(`${dirCandidate}PROJECT.ts`)) {
                projectsNotFound = false;
                hDynamicImportFile.writeString(`import "./${directoryName}/PROJECT";`);
            }
        }
    }
    if (fileCounter++ > 20) {
        fileCounter = 0;
        wait(0);
    }
    directoryName = hFindFile.handle.next();
} while (directoryName !== undefined);

hFindFile.handle.close();
hDynamicImportFile.close();

if (projectsNotFound)
    exit("Application must have at least one project!");

Promise.resolve();
import "./DynamicImport";
App.Run(false);