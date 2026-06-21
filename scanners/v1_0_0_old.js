class sstack{
    arr = []
    constructor(){

    }

    push(v){
        // [funcId,currentPos,maxPos]
        if(v[1]==v[2])return;
        this.arr.push(v)
    }

    pop(){
        if(this.arr.length==0)return undefined,false
        return this.arr.pop(),true
    }

    end(){
        if(this.arr.length==0)return undefined
        return this.arr[this.arr.length-1]
    }

    increment(){
        if(this.arr.length==0)return [true,false]
        let end = this.arr[this.arr.length-1]
        end[1]++
        let e3up = false
        if(end[1]>end[3]){
            e3up = true
            end[3] = end[1]
        }
        while(end[1]==end[2]){
            e3up = false
            this.arr.pop()
            if(this.arr.length==0)break;
            end = this.arr[this.arr.length-1]
            end[1]++
            if(end[1]>end[3]){
                e3up = true
                end[3] = end[1]
            }
        }
        return [this.arr.length==0||Object.values(Input).includes(scanners["v1.0.0"].functions[end[0]].check[end[1]]),e3up]
    }

    decrement(){
        if(this.arr.length==0)return false
        let end = this.arr[this.arr.length-1]
        if(end[1]==0)return false
        end[1]--
        return true
    }
}

const Input = {
    Var: "single",
    List: "multi"
}

const v1_0_0 = {
    desc: "lastest and greatest function scanner",
    scan(txt){
        txt = txt.replaceAll(" ","").split("\n").filter(l=>l.includes("="))
        let count = {}
        let errs = []
        for(let x=0;x<txt.length;x++){
            let lineSplit = txt[x].split("=")
            let num = lineSplit[0]
            let line = lineSplit[1]+"(1)" // adding the (1) makes some more stuff work properly
            let possible = this.default.filter(p=>this.functions[p].location!="middle")
            let stack = new sstack()
            let store = ""
            let lookingFor = false
            let isNumber = false
            let isList = false
            let tcount = {}
            for(let y=0;y<line.length;y++){
                let char = line[y]
                console.log(char,JSON.stringify(stack.arr),store,possible,lookingFor)
                if(char=="'"&&store.length>0&&!isNumber){
                    if(!tcount[24])tcount[24]=0
                    tcount[24]++
                    continue;
                }
                store+=char
                if(isNumber||store.length==1){
                    let inm = "0123456789nx".includes(char)
                    if(line.charCodeAt(y+1)==65039)inm=false // needed for number emoijs
                    if(isNumber||inm){
                        //console.log("A NUMBER")
                        isNumber = true
                        if(!inm){
                            store = ""
                            isNumber = false
                            y--
                            //console.log("INCREMENT FROM NUMBER")
                            let [i,iss] = stack.increment()
                            //console.log("LOOKING FOR IN NUMBER",i)
                            if(i)lookingFor = false
                            else lookingFor = this.functions[stack.end()[0]].check[stack.end()[1]]
                            isList = i?false:this.functions[stack.end()[0]].check[stack.end()[1]-1]==Input.List
                            possible = this.default
                            if(!iss)possible=possible.filter(p=>this.functions[p].location!="start")
                            else possible=possible.filter(p=>this.functions[p].location!="middle")
                        }
                        continue;
                    }

                }
                if(isList&&store==","){
                    stack.decrement()
                    isList = false
                    lookingFor = false
                    store = ""
                    continue;
                }
                let np = possible.filter(c=>this.functions[c].check[0][store.length-1]==char)
                if(lookingFor){
                    if(store.length>lookingFor.length&&possible.length==0){
                        errs.push(num)
                        console.log(`Something went wrong on equation ${num}.`)
                        break;
                    }
                    if(store==lookingFor){
                        let [i,iss] = stack.increment()
                        //console.log("INCREMENT FROM STORE")
                        if(i)lookingFor = false
                        else lookingFor = this.functions[stack.end()[0]].check[stack.end()[1]]
                        isList = i?false:this.functions[stack.end()[0]].check[stack.end()[1]-1]==Input.List
                        store = ""
                        possible = this.default
                        if(!iss)possible=possible.filter(p=>this.functions[p].location!="start")
                        else possible=possible.filter(p=>this.functions[p].location!="middle")
                        continue;
                    }
                }
                // look for function
                console.log(np)
                if(np.length<=1){
                    //if(possible.length!=1){
                    //    console.log(`Something went wrong on equation ${num}.`)
                    //    break;
                    //}
                    let p = np[0]
                    if(np.length==0){
                        let f = possible.filter(c=>this.functions[c].check[0]==store.slice(0,-1))
                        if(f.length!=1){
                            if(lookingFor)continue;
                            errs.push(num)
                            console.log(`Something went wrong on equation ${num}.`)
                            break;
                        }
                        p = f[0]
                    }
                    if(lookingFor){
                        let suc = stack.decrement()
                        if(!suc){
                            errs.push(num)
                            console.log(`Something went wrong on equation ${num}.`)
                            break;
                        }
                    }
                    if(!tcount[p])tcount[p] = 0
                    tcount[p]++
                    //console.log(np)
                    let c = this.functions[p].check
                    y+=c[0].length-store.length
                    console.log(c[0].length,store.length)
                    stack.push([p,1,c.length,1])
                    possible = this.default.filter(p=>this.functions[p].location!="start")
                    store = ""
                    continue;
                }
                possible = np
            }
            if(errs.includes(num))continue;
            Object.entries(tcount).forEach(e=>{
                if(!count[e[0]])count[e[0]]=0
                count[e[0]]+=e[1]
            })
        }
        delete count[0]
        return Object.entries(count).sort((a,b)=>b[1]-a[1]).map(c=>`${this.functions[c[0]].func}: ${c[1]}`).join("<br>")
        +(errs.length>0?"<br><br>Equations "+errs.join(",")+" failed and are not counted.":"")
    },
    functions:[
        {
            id: "paren",
            func: "()",
            check: ["(",Input.Var,")"]
        },
        {
            id: "A",
            func: "A(a,b)",
            check: ["A(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "B",
            func: "B(x,y)",
            check: ["B(",Input.Var,Input.Var,")"]
        },
        {
            id: "C",
            func: "C(x)",
            check: ["C(",Input.Var,")"]
        },
        {
            id: "E",
            func: "E(n)",
            check: ["E(",Input.Var,")"]
        },
        {
            id: "H",
            func: "H(a,b)",
            check: ["H(",Input.Var,Input.Var,")"]
        },
        {
            id: "J",
            func: "J[n](x)",
            check: ["J[",Input.Var,"](",Input.Var,")"]
        },
        {
            id: "K",
            func: "K(x)",
            check: ["K(",Input.Var,")"]
        },
        {
            id: "L",
            func: "L(x)",
            check: ["L(",Input.Var,")"]
        },
        {
            id: "P",
            func: "P(a,z)",
            check: ["P(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "Q",
            func: "Q(a,z)",
            check: ["Q(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "W",
            func: "W(x)",
            check: ["W(",Input.Var,")"]
        },
        {
            id: "Y",
            func: "Y[n](x)",
            check: ["Y[",Input.Var,"](",Input.Var,")"]
        },
        {
            id: "Z",
            func: "Z(x)",
            check: ["Z(",Input.Var,")"]
        },
        {
            id: "AF",
            func: "x¡!",
            check: ["¡!"]
        },
        {
            id: "AI",
            func: "Ai(x)",
            check: ["Ai(",Input.Var,")"]
        },
        {
            id: "AS",
            func: "s(x)",
            check: ["s(",Input.Var,")"]
        },
        {
            id: "AT",
            func: "🔺(a,b,c)",
            check: ["🔺(",Input.Var,",",Input.Var,",",Input.Var,")"]
        },
        {
            id: "BI",
            func: "Bi(x)",
            check: ["Bi(",Input.Var,")"]
        },
        {
            id: "CF",
            func: "x^[!]",
            check: ["^[!]"]
        },
        {
            id: "CI",
            func: "Ci(x)",
            check: ["Ci(",Input.Var,")"]
        },
        {
            id: "CN",
            func: "☸️(n)",
            check: ["☸️(",Input.Var,")"]
        },
        {
            id: "DC",
            func: "D‾n",
            check: ["D‾",Input.Var,""]
        },
        {
            id: "DP",
            func: "D*n",
            check: ["D*",Input.Var]
        },
        {
            id: "DX",
            func: "f'(x)",
            check: ["'"]
        },
        {
            id: "EI",
            func: "Ei(x)",
            check: ["Ei(",Input.Var,")"]
        },
        {
            id: "EN",
            func: "E_n",
            check: ["E_",Input.Var]
        },
        {
            id: "FF",
            func: "x_n",
            check: ["_",Input.Var],
            location: "middle"
        },
        {
            id: "GI",
            func: "Gi(x)",
            check: ["Gi(",Input.Var,")"]
        },
        {
            id: "GM",
            func: "GM[n](x_1, ..., x_n)",
            check: ["GM[",Input.Var,"](",Input.List,")"]
        },
        {
            id: "HG",
            func: "🌡️(n)",
            check: ["🌡️(",Input.Var,")"]
        },
        {
            id: "HI",
            func: "Hi(x)",
            check: ["Hi(",Input.Var,")"]
        },
        {
            id: "HM",
            func: "HM[n](x_1, ..., x_n)",
            check: ["HM[",Input.Var,"](",Input.List,")"]
        },
        {
            id: "HP",
            func: "hp(x)",
            check: ["hp(",Input.Var,")"]
        },
        {
            id: "IM",
            func: "im(z)",
            check: ["im(",Input.Var,")"]
        },
        {
            id: "JP",
            func: "JP(x)",
            check: ["JP(",Input.Var,")"]
        },
        {
            id: "LF",
            func: "¡x",
            check: ["¡",Input.Var],
            location: "start"
        },
        {
            id: "LI",
            func: "Li(x)",
            check: ["Li(",Input.Var,")"]
        },
        {
            id: "LN",
            func: "ln(x)",
            check: ["ln(",Input.Var,")"]
        },
        {
            id: "OR",
            func: "a|b",
            check: ["|",Input.Var],
            location: "middle"
        },
        {
            id: "PF",
            func: "x!!",
            check: ["!!"]
        },
        {
            id: "PI",
            func: "x!",
            check: ["!"]
        },
        {
            id: "PN",
            func: "✓(n)",
            check: ["✓(",Input.Var,")"]
        },
        {
            id: "QF",
            func: "x!!!!",
            check: ["!!!!"]
        },
        {
            id: "RE",
            func: "re(z)",
            check: ["re(",Input.Var,")"]
        },
        {
            id: "RF",
            func: "x‾n",
            check: ["‾",Input.Var],
            location: "middle"
        },
        {
            id: "SC",
            func: "SC(x)",
            check: ["SC(",Input.Var,")"]
        },
        {
            id: "SF",
            func: "sf(x)",
            check: ["sf(",Input.Var,")"]
        },
        {
            id: "SI",
            func: "Si(x)",
            check: ["Si(",Input.Var,")"]
        },
        {
            id: "SP",
            func: "sp(x)",
            check: ["sp(",Input.Var,")"]
        },
        {
            id: "ST",
            func: "st(x)",
            check: ["st(",Input.Var,")"]
        },
        {
            id: "TF",
            func: "x!!!",
            check: ["!!!"]
        },
        {
            id: "TN",
            func: "T(x)",
            check: ["T(",Input.Var,")"]
        },
        {
            id: "UR",
            func: "1️⃣(x)",
            check: ["1️⃣(",Input.Var,")"]
        },
        {
            id: "XX",
            func: "X(x)",
            check: ["X(",Input.Var,")"]
        },
        {
            id: "ABS",
            func: "|x|",
            check: ["|",Input.Var,"|"]
        },
        {
            id: "ABU",
            func: "abu(x)",
            check: ["abu(",Input.Var,")"]
        },
        {
            id: "ADD",
            func: "x+y",
            check: ["+",Input.Var],
            location: "middle"
        },
        {
            id: "ADI",
            func: "-x",
            check: ["-",Input.Var],
            location: "start"
        },
        {
            id: "AMI",
            func: "ami(x)",
            check: ["ami(",Input.Var,")"]
        },
        {
            id: "AND",
            func: "a&b",
            check: ["&",Input.Var],
            location: "middle"
        },
        {
            id: "ARG",
            func: "arg(z)",
            check: ["arg(",Input.Var,")"]
        },
        {
            id: "AVG",
            func: "am(x_1, x_2, ...)",
            check: ["am(",Input.List,")"]
        },
        {
            id: "BAL",
            func: "bal(n)",
            check: ["bal(",Input.Var,")"]
        },
        {
            id: "BAX",
            func: "Bax(n)",
            check: ["Bax(",Input.Var,")"]
        },
        {
            id: "BCF",
            func: "C[n](z)",
            check: ["C[",Input.Var,"](",Input.Var,")"]
        },
        {
            id: "BER",
            func: "Ber(x)",
            check: ["Ber(",Input.Var,")"]
        },
        {
            id: "BIN",
            func: "bin[n](x)",
            check: ["bin[",Input.Var,"](",Input.Var,")"]
        },
        {
            id: "BLG",
            func: "log2(x)",
            check: ["log2(",Input.Var,")"]
        },
        {
            id: "BRK",
            func: "[[n]]",
            check: ["[[",Input.Var,"]]"]
        },
        {
            id: "CAS",
            func: "cas(x)",
            check: ["cas(",Input.Var,")"]
        },
        {
            id: "CAT",
            func: "🐱(x,n)",
            check: ["🐱(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "CDF",
            func: "cdf[f(x)](x)",
            check: ["cdf[",Input.Var,"](",Input.Var]
        },
        {
            id: "CFK",
            func: "ϑ  (x)",
            check: ["ϑ  (",Input.Var,")"]
        },
        {
            id: "CHI",
            func: "Chi(x)",
            check: ["Chi(",Input.Var,")"]
        },
        {
            id: "CHN",
            func: "hex(x)",
            check: ["hex(",Input.Var,")"]
        },
        {
            id: "CIS",
            func: "cis(x)",
            check: ["cis(",Input.Var,")"]
        },
        {
            id: "CMP",
            func: "cmp(x)",
            check: ["cmp(",Input.Var,")"]
        },
        {
            id: "COL",
            func: "COL(n)",
            check: ["COL(",Input.Var,")"]
        },
        {
            id: "COS",
            func: "cos(x)",
            check: ["cos(",Input.Var,")"]
        },
        {
            id: "COT",
            func: "cot(x)",
            check: ["cot(",Input.Var,")"]
        },
        {
            id: "COW",
            func: "🐮(n)",
            check: ["🐮(",Input.Var,")"]
        },
        {
            id: "CSC",
            func: "csc(x)",
            check: ["csc(",Input.Var,")"]
        },
        {
            id: "CSK",
            func: "ψ (x)",
            check: ["ψ (",Input.Var,")"]
        },
        {
            id: "DBL",
            func: "2️⃣(n)",
            check: ["2️⃣(",Input.Var,")"]
        },
        {
            id: "DDD",
            func: "δ(x)",
            check: ["δ(",Input.Var,")"]
        },
        {
            id: "DEC",
            func: "dec[n](x)",
            check: ["dec[",Input.Var,"]"]
        },
        {
            id: "DEF",
            func: "def(n)",
            check: ["def(",Input.Var,")"]
        },
        {
            id: "DET",
            func: "det(A)",
            check: ["det(",Input.Var,")"]
        },
        {
            id: "DGM",
            func: "D^n",
            check: ["D^",Input.Var]
        },
        {
            id: "DIV",
            func: "x/y",
            check: ["/",Input.Var],
            location: "middle"
        },
        {
            id: "DLF",
            func: "D¡(n)",
            check: ["D¡(",Input.Var,")"]
        },
        {
            id: "DOT",
            func: "A•B",
            check: ["•",Input.Var],
            location: "middle"
        },
        {
            id: "DRT",
            func: "D√n",
            check: ["D√",Input.Var]
        },
        {
            id: "DSM",
            func: "D+n",
            check: ["D+",Input.Var]
        },
        {
            id: "DUC",
            func: "🦆(x)",
            check: ["🦆(",Input.Var,")"]
        },
        {
            id: "DWS",
            func: "dws(n)",
            check: ["dws(",Input.Var,")"]
        },
        {
            id: "EGF",
            func: "egf(x)",
            check: ["egf(",Input.Var,")"]
        },
        {
            id: "EGG",
            func: "🥚(x)",
            check: ["🥚(",Input.Var,")"]
        },
        {
            id: "EHS",
            func: "ehs(x)",
            check: ["ehs(",Input.Var,")"]
        },
        {
            id: "EKG",
            func: "ekg(x)",
            check: ["ekg(",Input.Var,")"]
        },
        {
            id: "EMG",
            func: "EM>(n)",
            check: ["EM>(",Input.Var,")"]
        },
        {
            id: "EML",
            func: "EM<(x)",
            check: ["EM<(",Input.Var,")"]
        },
        {
            id: "ENG",
            func: "eng(x)",
            check: ["eng(",Input.Var,")"]
        },
        {
            id: "ERF",
            func: "erf(x)",
            check: ["erf(",Input.Var,")"]
        },
        {
            id: "ETA",
            func: "η(s)",
            check: ["η(",Input.Var,")"]
        },
        {
            id: "EXP",
            func: "exp(x)",
            check: ["exp(",Input.Var,")"]
        },
        {
            id: "FAQ",
            func: "k!q",
            check: ["!q"]
        },
        {
            id: "FFN",
            func: "ff(x)",
            check: ["ff(",Input.Var,")"]
        },
        {
            id: "FIB",
            func: "fib(n)",
            check: ["fib(",Input.Var,")"]
        },
        {
            id: "FLT",
            func: "f_n",
            check: ["f_",Input.Var]
        },
        {
            id: "FLY",
            func: "🪰(n)",
            check: ["🪰(",Input.Var,")"]
        },
        {
            id: "GAP",
            func: "gap(n)",
            check: ["gap(",Input.Var,")"]
        },
        {
            id: "GCD",
            func: "gcd(x_1, x_2, ...)",
            check: ["gcd(",Input.List,")"]
        },
        {
            id: "GFP",
            func: "gfp(f(x))",
            check: ["gfp(",Input.Var,")"]
        },
        {
            id: "GUY",
            func: "🧑‍🦱(n)",
            check: ["🧑‍🦱(",Input.Var,")"]
        },
        {
            id: "HEX",
            func: "HX(n)",
            check: ["HX(",Input.Var,")"]
        },
        {
            id: "HPN",
            func: "h✓(n)",
            check: ["h✓(",Input.Var,")"]
        },
        {
            id: "HYP",
            func: "Δ(n)",
            check: ["Δ(",Input.Var,")"]
        },
        {
            id: "IMP",
            func: "😠(n)",
            check: ["😠(",Input.Var,")"]
        },
        {
            id: "INT",
            func: "∫(x,dx,LB,UB)",
            check: ["∫(",Input.Var,",dx,",Input.Var,",",Input.Var,")"]
        },
        {
            id: "LAH",
            func: "Lah(n,k)",
            check: ["Lah(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "LCM",
            func: "lcm(x_1, x_2, ...)",
            check: ["lcm(",Input.List,")"]
        },
        {
            id: "LCS",
            func: "lc(x)",
            check: ["lc(",Input.Var,")"]
        },
        {
            id: "LEO",
            func: "leo(n)",
            check: ["leo(",Input.Var,")"]
        },
        {
            id: "LFP",
            func: "lfp(f(x))",
            check: ["lfp(",Input.Var,")"]
        },
        {
            id: "LIG",
            func: "γ(x,y)",
            check: ["γ(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "LOG",
            func: "log(x)",
            check: ["log(",Input.Var,")"]
        },
        {
            id: "LSD",
            func: "💊(n)",
            check: ["💊(",Input.Var,")"]
        },
        {
            id: "LSL",
            func: "lsl(n)",
            check: ["lsl(",Input.Var,")"]
        },
        {
            id: "LSS",
            func: "ls(x)",
            check: ["ls(",Input.Var,")"]
        },
        {
            id: "MAX",
            func: "max(a_1, a_2, ...)",
            check: ["max(",Input.List,")"]
        },
        {
            id: "MDP",
            func: "D*[n](x_1, ..., x_n)",
            check: ["D*[",Input.Var,"](",Input.List,")"]
        },
        {
            id: "MIN",
            func: "min(a_1, a_2, ...)",
            check: ["min(",Input.List,")"]
        },
        {
            id: "MLT",
            func: "x*y",
            check: ["*",Input.Var],
            location: "middle"
        },
        {
            id: "MOD",
            func: "a%b",
            check: ["%",Input.Var],
            location: "middle"
        },
        {
            id: "NOR",
            func: "a|b",
            check: ["|",Input.Var],
            location: "middle"
        },
        {
            id: "NOT",
            func: "n~",
            check: ["~"]
        },
        {
            id: "NSW",
            func: "nsw(n)",
            check: ["nsw(",Input.Var,")"]
        },
        {
            id: "ODD",
            func: "odd(x)",
            check: ["odd(",Input.Var,")"]
        },
        {
            id: "OHM",
            func: "Ω⚡(n)",
            check: ["Ω⚡(",Input.Var,")"]
        },
        {
            id: "ONE",
            func: "one(n)",
            check: ["one(",Input.Var,")"]
        },
        {
            id: "PCF",
            func: "primeπ(n)",
            check: ["primeπ(",Input.Var,")"]
        },
        {
            id: "PDF",
            func: "pdf[f(x)](x)",
            check: ["pdf[",Input.Var,"](",Input.Var,")"]
        },
        {
            id: "PRE",
            func: "x--",
            check: ["--"]
        },
        {
            id: "PRI",
            func: "x#",
            check: ["#"]
        },
        {
            id: "REC",
            func: "{n}(x)",
            check: ["{",Input.Var,"}(",Input.Var,")"]
        },
        {
            id: "REF",
            func: "ref(A)",
            check: ["ref(",Input.Var,")"]
        },
        {
            id: "REM",
            func: "rem(x)",
            check: ["rem(",Input.Var,")"]
        },
        {
            id: "REO",
            func: "🥠(n)",
            check: ["🥠(",Input.Var,")"]
        },
        {
            id: "RLG",
            func: "rlg(n)",
            check: ["rlg(",Input.Var,")"]
        },
        {
            id: "RMS",
            func: "RMS(x_1, x_2, ...)",
            check: ["RMS(",Input.List,")"]
        },
        {
            id: "SAD",
            func: "😔(n)",
            check: ["😔(",Input.Var,")"]
        },
        {
            id: "SCG",
            func: "SCG(n)",
            check: ["SCG(",Input.Var,")"]
        },
        {
            id: "SEC",
            func: "sec(x)",
            check: ["sec(",Input.Var,")"]
        },
        {
            id: "SEX",
            func: "💍(n)",
            check: ["💍(",Input.Var,")"]
        },
        {
            id: "SHI",
            func: "Shi(x)",
            check: ["Shi(",Input.Var,")"]
        },
        {
            id: "SIN",
            func: "sin(x)",
            check: ["sin(",Input.Var,")"]
        },
        {
            id: "SIX",
            func: "six(n)",
            check: ["six(",Input.Var,")"]
        },
        {
            id: "SLN",
            func: "sln(x)",
            check: ["sln(",Input.Var,")"]
        },
        {
            id: "SPN",
            func: "s✓(n)",
            check: ["s✓(",Input.Var,")"]
        },
        {
            id: "SQR",
            func: "x²",
            check: ["²"]
        },
        {
            id: "STD",
            func: "σ(x_1, x_2, ...)",
            check: ["σ(",Input.List,")"]
        },
        {
            id: "SUB",
            func: "x-y",
            check: ["-",Input.Var],
            location: "middle"
        },
        {
            id: "SUC",
            func: "x++",
            check: ["++"]
        },
        {
            id: "SUM",
            func: "Σ(f(n),n,LB,UB)",
            check: ["Σ(",Input.Var,",",Input.Var,",",Input.Var,",",Input.Var,")"]
        },
        {
            id: "SUN",
            func: "☀️(n)",
            check: ["☀️(",Input.Var,")"]
        },
        {
            id: "SWF",
            func: "x≀",
            check: ["≀"]
        },
        {
            id: "TAN",
            func: "tan(x)",
            check: ["tan(",Input.Var,")"]
        },
        {
            id: "TAU",
            func: "τ(n)",
            check: ["τ(",Input.Var,")"]
        },
        {
            id: "TEN",
            func: "ten(n)",
            check: ["ten(",Input.Var,")"]
        },
        {
            id: "TPL",
            func: "3️⃣(n)",
            check: ["3️⃣(",Input.Var,")"]
        },
        {
            id: "TRI",
            func: "Tr(n)",
            check: ["Tr(",Input.Var,")"]
        },
        {
            id: "TWO",
            func: "two(n)",
            check: ["two(",Input.Var,")"]
        },
        {
            id: "UIG",
            func: "Γ(x,y)",
            check: ["Γ(",Input.Var,",",Input.Var,")"]
        },
        {
            id: "XOR",
            func: "a∧b",
            check: ["∧",Input.Var],
            location: "middle"
        }
    ],
}