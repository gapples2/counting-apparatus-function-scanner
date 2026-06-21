import { scanners } from "./scanners.js"

const input = document.getElementById("input")
const versions = document.getElementById("versions")
const versionText = document.getElementById("version-text")
const output = document.getElementById("output")

function generateVersionButtons(){
    const scannerVersions = Object.keys(scanners)
    for(let x=0;x<scannerVersions.length;x++){
        const name = scannerVersions[x]
        const scanner = scanners[name]
        const button = document.createElement("button")
        button.addEventListener("mouseover",function(){
            versionText.textContent = scanner.desc
        })
        button.addEventListener("click",function(){
            let out;
            try{out = scanner.scan(input.value)}catch(e){out = "Something went wrong!<br><br>"+e+"<br>"+e.stack}
            output.innerHTML = out
        })
        button.textContent = name
        versions.appendChild(button)
    }
}

generateVersionButtons()