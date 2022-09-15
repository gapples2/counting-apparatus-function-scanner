const scanners = {
    "v0.0.1":{
        desc: "The last version of the function scanner in the old server with 1 minor change. The original version name was 'v5.1.3'.",
        scan(txt){
            const start = ["(","[","⌊"]
            const end = [")","]","⌋"]
            const split = ["/",",","&","+","*","-"]
            let totaltotal = {}
            txt = txt.replace(/[ ]+/g,"").replace(/[0-9]+/g,"x").split("\n").filter(a=>!a.includes("—"))
            // remove all spaces and replace all numbers with x
            txt.forEach(line=>{
                line = line.split("=")
                let result = "IDK"
                if(line.length==2){
                    result = line[0]
                }
                line = line[line.length-1]
                // now time for the real pain
                let total = {}
                let names = [""]
                let missing = [[]]
                let abs = [false]
                let inner = 0
                for(let x=0;x<line.length;x++){
                    let char = line[x]
                    if(start.includes(char)){
                        if(names[inner]==""&&char!="["){
                            missing[inner].push(true)
                        }else{
                            missing[inner].push(false)
                            names[inner] += char + "x"
                            inner++
                            names[inner] = ""
                            missing.push([])
                            abs.push(false)
                        }
                    }else if(end.includes(char)){
                        let miss = missing[inner].pop()
                        if(!miss){
                            if(names[inner]=="!"){
                                names[inner-1] = names[inner-1].slice(0,-1)+"!"
                            }
                            if(names[inner]!="x"&&names[inner]!="!"){
                                if(!total[names[inner]])total[names[inner]]=0
                                total[names[inner]]++
                            }
                            missing.pop()
                            names.pop()
                            abs.pop()
                            inner--
                            names[inner] += char
                            missing[inner].pop()
                        }
                    }else if(char=="|"){
                        if(names[inner].length==0){
                            // start of absolute value
                            abs[inner] = true
                            names[inner] += "|x|"
                            inner++
                            names[inner] = ""
                            missing.push([])
                            abs.push(false)
                        }else{
                            if(abs[inner-1]){
                                // end of absolute value
                                if(!total[names[inner]])total[names[inner]]=0
                                total[names[inner]]++
                                inner--
                                names.pop()
                                missing.pop()
                                abs.pop()
                            }else{
                                // bitwise or
                                if(!total["x|x"])total["x|x"]=0
                                total["x|x"]++
                                if(!total[names[inner]])total[names[inner]]=0
                                total[names[inner]]++
                                names[inner]=""
                            }
                        }
                    }else{
                        if(split.includes(char)||(names[inner].endsWith(".")&&char==".")){
                            let a = names[inner].slice(0,char=="."?-1:Infinity)
                            if(!total[a])total[a]=0
                            total[a]++
                            if(char=="."){
                                if(!(total["x..x"]))total["x..x"]=0
                                total["x..x"]++
                            }else{
                                if(char!=","){
                                    if(!(total["x"+char+"x"]))total["x"+char+"x"]=0
                                    total["x"+char+"x"]++
                                }
                            }
                            names[inner] = ""
                        }else names[inner] += char
                    }
                }
                if(!total[names[0]])total[names[0]]=1
                else total[names[0]]++
                Object.keys(total).forEach(a=>{
                    if(!totaltotal[a])totaltotal[a]=0
                    totaltotal[a]+=total[a]
                })
            })
            delete totaltotal["x"]
            delete totaltotal[""]
            return(Object.keys(totaltotal).map(a=>a+": "+totaltotal[a]).join("<br>"))
        }
    }
}