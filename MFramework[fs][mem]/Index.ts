import { App } from "./App";






//import "./Examples/PROJECT";






if (App.Run())
    exit();

const directoryMask = `${__dirname}\\`;
const dynamicImportFilePath = `${directoryMask}DynamicImport.ts`;

Promise.resolve();
if (Fs.DoesFileExist(dynamicImportFilePath))
    Fs.DeleteFile(dynamicImportFilePath);

const hDynamicImportFile = File.Open(dynamicImportFilePath, 0x7477); // wt
if (hDynamicImportFile === undefined)
    exit("Could not open file!");

const hFindFile = FindFile.First(`${directoryMask}*`);
if (hFindFile.handle === undefined) {
    hDynamicImportFile.close();
    exit("Could not find folders!");
}

const regexPattern = new RegExp("^[a-zA-Z][a-zA-Z0-9_]{0,13}$", 'g');
let directoryName = hFindFile.fileName;
let fileCounter = 0;
let projectsNotFound = true;
do {
    if (directoryName !== undefined) {
        const matches = directoryName.match(regexPattern);
        if (matches !== null && matches !== undefined && matches.length > 0) {
            const dirCandidate = `${__dirname}\\${directoryName}\\`;
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

//async function loadProjects() {
//@ts-ignore
//    await import("./DynamicImport");
//}
import "./DynamicImport";
//loadProjects().then(function () {
App.Run(false);
//});