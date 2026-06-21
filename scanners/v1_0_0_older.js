const v1_0_0 = {
    desc: "A brand new version with little bug testing and recursion. I don't know why, but my past self hated recursion.",

    closingParentheses(txt,pos,use="()"){
        let d = 0
        const len = txt.length
        for(let x=pos;x<len;x++){
            if(txt[x]==use[0])d++
            if(txt[x]==use[1])d--
            if(d==0)return x
        }
        return len
    },

    parseLine(txt){
        // A(1+1^1+(-1)++)
        // [["function","A",["number","+","number","^","number",["parentheses",["-","number"]],"++"]]]
        txt=txt.replaceAll(" ","")
        let arr = []
        let lookingAt = "none"
        let ctxt = ""
        const len = txt.length
        for(let x=0;x<len;x++){
        let char = txt[x]
        if(lookingAt=="none"){
            if(letterRegex.test(char)){lookingAt="function"}
            else if(numberRegex.test(char)){lookingAt="number"}
            else if(char=="("){lookingAt="parentheses"}
            else{lookingAt="symbol"}
        }
        switch(lookingAt){
            case "function":
                if(char=="["){
                    let p = this.closingParentheses(txt,x,"[]")
                    arr.push(["parentheses",this.parseLine(txt.slice(x+1,p))])
                    arr.push(["symbol","\x00"])
                    x=p
                    break;
                }
                if(char=="("){
                    let p = this.closingParentheses(txt,x)
                    let t = txt.slice(x+1,p).split(",")
                    arr.push(["function",ctxt,this.parseLine(t[0])])
                    for(let y=1;y<t.length;y++)arr.push(["symbol","\x00"],["parentheses",this.parseLine(t[y])])
                    x=p
                    lookingAt="none"
                    ctxt=""
                }
                ctxt+=char
                break;
            case "number":
                if(!numberRegex.test(txt[x+1])){
                    arr.push("number")
                    lookingAt="none"
                }
                break;
            case "symbol":
                ctxt+=char
                if(!symbolRegex.test(txt[x+1])){
                    arr.push(["symbol",ctxt])
                    lookingAt="none"
                    ctxt=""
                }
                break;
            case "parentheses":
                let p = this.closingParentheses(txt,x)
                arr.push(["parentheses",this.parseLine(txt.slice(x+1,p))])
                x=p
                lookingAt="none"
                break;
            }
        }
        return arr
    },

    splitSymbols(arr){
    // split symbols into smaller symbols if needed

    let narr = []
    for(let x=0;x<arr.length;x++){
        let i = arr[x]
        if(i[0]=="function"){
            narr.push([i[0],i[1],this.splitSymbols(i[2])])
        }
        if(i[0]=="parentheses")narr.push([i[0],this.splitSymbols(i[1])])
        if(i=="number"){
            narr.push("number")
        }
        if(i[0]=="symbol"){
            let s = i[1]
            let isp = 0
            for(let y=0;y<specialCases.length;y++){
                let sc = specialCases[y]
                if(!s.startsWith(sc[1]))continue;
                if(sc[0]=="pre"&&narr[x+1]!="number")continue;
                if(sc[0]=="post"&&narr[x-1]!="number")continue;
                narr.push([sc[2]??"symbol",s.slice(0,sc[1].length)])
                isp = sc[1].length
            }
            let n = ""
            for(let y=isp;y<s.length;y++){
                let c = s[y]
                let o = n[n.length-1]??c
                if(c!=o){
                narr.push(["symbol",n])
                n = ""
                }
                n+=c
            }
            narr.push(["symbol",n])
        }
        }
        return narr
    },

    mergeObjects(obj1,obj2){
        let keys1 = Object.keys(obj1)
        let keys2 = Object.keys(obj2)
        let newobj = {}
        for(let x=0;x<keys1.length;x++){
            newobj[keys1[x]] = obj1[keys1[x]]
        }
        for(let x=0;x<keys2.length;x++){
        if(!newobj[keys2[x]])newobj[keys2[x]]=0
            newobj[keys2[x]]+=obj2[keys2[x]]
        }
        return newobj
    },

    interpretLine(arr){
        // [["function","A",["number","+","number","^","number",["parentheses",["-","number"]],"++"]]]
        // {"A(x)":1,"x+x":2,"x^x":1,"-x":1,"x++":1}

        let obj = {}
        const incIndex = i=>obj[i]=(obj[i]??0)+1
        const len = arr.length

        for(let x=0;x<len;x++){
            let i = arr[x]
            if(i[0]=="symbol"){
            //deal with symbols
                while(i[0]=="symbol"&&x<len){
                    incIndex(i[1]+"x")
                    x++
                    i = arr[x]
                }
            }
            if(i[0]=="function"){
                incIndex(i[1]+"(x)")
                obj = this.mergeObjects(obj,this.interpretLine(i[2]))
                i = "number"
            }
            if(i[0]=="parentheses"){
                obj = this.mergeObjects(obj,this.interpretLine(i[1]))
                i = "number"
            }
            x++
            i = arr[x]??[]
            while(i[0]=="symbol"&&x<len){
                if(arr[x+1]?.[0]!="symbol"&&x!=(len-1))break;
                incIndex("x"+i[1])
                x++
                i = arr[x]??[]
            }
            i = arr[x]
            if(i)incIndex(`x${i[1]}x`)
        }
        if(obj["x\x00x"])delete obj["x\x00x"]
        return obj
    },

    formatObject(obj){
        let str = ""
        let keys = Object.keys(obj)
        for(let x=0;x<keys.length;x++){
            str+=`${keys[x]}: ${obj[keys[x]]}<br>`
        }
        return str.slice(0,-2)
    },

    scan(txt){
        txt = txt.split("\n").filter(l=>!l.includes("—"))
        let obj = {}
        for(let x=0;x<txt.length;x++){
            let t = txt[x].split("=")
            obj = this.mergeObjects(obj,this.interpretLine(this.splitSymbols(this.parseLine(t[t.length-1]))))
        }
        return this.formatObject(obj)
    }
}