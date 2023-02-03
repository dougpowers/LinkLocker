// console.log(process.argv);

if (process.argv.length < 3) {
    console.log("Please pass an argument.")
} else {
    let addFlag = process.argv.findIndex((v, i, a) => {
        if (v === "-a") {
            return true;
        }
    })

    let addDirectory = null;

    if (addFlag >= 0) { addDirectory = process.argv[addFlag + 1]; }    

    if (addDirectory) {
        console.log("Adding gecko id...");

        let fs = require("fs");

        let manifestText = fs.readFileSync(`${addDirectory}/manifest.json`, {encoding: "utf8"});

        let manifest = JSON.parse(manifestText);

        manifest.browser_specific_settings = {gecko: {id: "dougpowers@gmail.com"}}

        console.log(manifest.browser_specific_settings.gecko.id);

        fs.writeFileSync(`${addDirectory}/manifest.json`, JSON.stringify(manifest, null, 4));
    } else {
        let removeFlag = process.argv.findIndex((v, i, a) => {
            if (v === "-r") {
                return true;
            }
        })

        let removeDirectory = null;

        if (removeFlag >= 0) { removeDirectory = process.argv[removeFlag + 1]}
        
        if (removeDirectory) {
            let fs = require("fs");

            let manifestText = fs.readFileSync(`${removeDirectory}/manifest.json`, {encoding: "utf8"});

            let manifest = JSON.parse(manifestText);

            console.log("Removing gecko id...")

            delete manifest.browser_specific_settings;

            fs.writeFileSync(`${removeDirectory}/manifest.json`, JSON.stringify(manifest, null, 4));
        }
    }

}
