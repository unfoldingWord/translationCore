/**
 * This script injects the architect type into the artifact name
 * so we have unique artifacts for 32bit and 36 bit Windows builds
 */

const path = require('path');
const fs = require('fs');
const glob = require('glob');

const pattern = process.argv[2];

const processArtifact = (artifactPath, arch) => {
    const artifactName = path.basename(artifactPath);
    const [name, ...ignore] = artifactName.split(/[^A-Za-z]/, 1);
    const rest = artifactName.substr(name.length, artifactName.length);
    const newName = `${name}-win-${arch}${rest}`;
    const newPath = path.join(path.dirname(artifactPath), newName);
    console.log(`${artifactName} --> ${newName}`);
    fs.renameSync(artifactPath, newPath);
};

if (!pattern) {
    console.error('No artifact path/pattern specified');
    return 1;
} else if(!pattern.endsWith('.exe')) {
    console.error('That is not a Windows artifact! Expected .exe');
    return 1;
} else {
    const arch = process.arch;
    console.log(`Identified architect as ${arch}.`);

    const artifacts = glob.sync(pattern);
    if(artifacts.length === 0) {
        // treat patter as path if there are no matches
        processArtifact(pattern, arch);
    } else {
        for (const artifact of artifacts) {
            processArtifact(artifact, arch);
        }
    }
    console.log('Done!');
}
