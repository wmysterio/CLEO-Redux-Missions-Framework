const directoryMask = `${__dirname}\\`;
const dynamicImportFilePath = `${directoryMask}DynamicImport.ts`;

if (Fs.DoesFileExist(dynamicImportFilePath))
    Fs.DeleteFile(dynamicImportFilePath)

const hFindFile = FindFile.First(`${directoryMask}*`);
if (hFindFile !== undefined) {
    const projectNameRegexPattern = new RegExp("^[a-zA-Z0-9][a-zA-Z0-9_]{0,13}$", 'g');
    let projectCounter: int = 0;
    let importText: string = `import {Core} from "./Core";`;

    while (true) {
        const directoryName = hFindFile.handle.next();
        if (directoryName === undefined)
            break;
        const matches = directoryName.match(projectNameRegexPattern);
        if (matches !== null && matches.length > 0) {
            const dirCandidate = `${directoryMask}${directoryName}\\`;
            if (Fs.DoesDirectoryExist(dirCandidate) && Fs.DoesFileExist(`${dirCandidate}PROJECT.ts`)) {
                const projectAlias = `project${projectCounter}`;
                importText += `\nimport {PROJECT as ${projectAlias}} from "./${directoryName}/PROJECT";Core.RegisterProject("${directoryName}",${projectAlias});`;
                projectCounter += 1;
            }
        }
    }

    hFindFile.handle.close();

    if (projectCounter > 0) {
        const hDynamicImportFile = File.Open(dynamicImportFilePath, 0x7477); // wt
        if (hDynamicImportFile !== undefined) {
            const importTextSplit = importText.split('\n');
            const importTextSplitLength = importTextSplit.length;
            for (let i = 0; i < importTextSplitLength; ++i)
                hDynamicImportFile.writeString(importTextSplit[i]);
            hDynamicImportFile.close();
        }
    }
}