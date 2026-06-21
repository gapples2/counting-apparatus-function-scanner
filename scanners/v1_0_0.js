const Tokens = {
    ParenExpr: 1,
    BracketExpr: 2,
    Expr: 3,
    Name: 4,
    Number: 5
}

const Locations = {
    NotEnd: 10
}

const functions_unsorted = [
    {
        id: "J",
        name: "J[n](x)",
        syntax: ["J", Tokens.BracketExpr, Tokens.ParenExpr]
    },
    {
        id: "Y",
        name: "Y[n](x)",
        syntax: ["Y", Tokens.BracketExpr, Tokens.ParenExpr]
    },
    {
        id: "AF",
        name: "x¡!",
        syntax: ["¡!"]
    },
    {
        id: "CF",
        name: "x^[!]",
        syntax: ["^[!]"]
    },
    {
        id: "DP",
        name: "D*n",
        syntax: ["D*"]
    },
    {
        id: "DX",
        name: "d/dx(f(x))",
        syntax: ["d/dx", Tokens.ParenExpr]
    },
    {
        id: "EN",
        name: "E_n",
        syntax: ["E_"],
    },
    {
        id: "FF",
        name: "x_n",
        syntax: ["_"]
    },
    {
        id: "GM",
        name: "GM(x_1, ..., x_n)",
        syntax: ["GM", Tokens.ParenExpr]
    },
    {
        id: "HM",
        name: "HM(x_1, ..., x_n)",
        syntax: ["HM", Tokens.ParenExpr]
    },
    {
        id: "LF",
        name: "¡x",
        syntax: ["¡"]
    },
    {
        id: "OR",
        name: "a | b",
        syntax: ["|"]
    },
    {
        id: "PF",
        name: "x!!",
        syntax: ["!!"]
    },
    {
        id: "PI",
        name: "x!",
        syntax: ["!"]
    },
    {
        id: "QF",
        name: "x!!!!",
        syntax: ["!!!!"]
    },
    {
        id: "RF",
        name: "x‾n",
        syntax: ["‾"]
    },
    {
        id: "TF",
        name: "x!!!",
        syntax: ["!!!"]
    }
    /*{
        id: "ABS",
        name: "|x|",
        syntax: ["|", Tokens.Expr, "|"]
    }*/
]

const functions = functions_unsorted.toSorted(
    (a, b) => b.syntax[0].length + b.syntax.length - a.syntax[0].length - a.syntax.length
)

function findMatch(line, start, left, right) {
    let comma = []
    let depth = 1
    for(let i = start + 1; i < line.length; i++) {
        if(line[i] == left) {
            depth++
        }
        if(line[i] == right) {
            depth--
        }
        if(line[i] == "," && depth == 1) {
            comma.push(i)
        }
        if(depth == 0) {
            return [...comma, i]
        }
    }
    return [-1]
}

function generateFuncName(base, argCount) {
    if(argCount < 4) {
        return `${base}(${(["", "x", "x,y", "x,y,z"])[argCount]})`
    }
    let args = ""
    for(let i = 0; i < argCount; i++) {
        args += String.fromCharCode(i + 97) + ","
    }
    return `${base}(${args.slice(0, -1)})`
}

function add(count, func) {
    if(!count[func]) {
        count[func] = 0
    }
    count[func]++
}

function merge(count1, count2) {
    for(let arr of Object.entries(count2)) {
        if(!count1[arr[0]]) {
            count1[arr[0]] = 0
        }
        count1[arr[0]] += arr[1]
    }
}

function stringify(count) {
    return Object.entries(count).map(arr => `${arr[0]}: ${arr[1]}`).join("<br>")
}

const v1_0_0 = {
    desc: "idk",
    parse(line) {
        let tokens = []
        let i = 0
        let name = ""
        let isNum = false

        while(i < line.length) {
            if(line[i] == '(' || line[i] == '[') {
                // add a name token if needed
                if(name.length > 0) {
                    tokens.push({
                        type: Tokens.Name,
                        content: name
                    })
                    name = ""
                    isNum = false
                }
                // parse all the parenthesis / bracket stuff
                let right = line[i] == '(' ? ')' : ']'
                let match = [i, ...findMatch(line, i, line[i], right)]
                //console.log(match)
                let content = []
                for(let x = 0; x < match.length - 1; x++) {
                    content.push(this.parse(line.slice(match[x] + 1, match[x + 1])))
                }
                tokens.push({
                    type: line[i] == '(' ? Tokens.ParenExpr : Tokens.BracketExpr,
                    content
                })
                i = match.at(-1) + 1
                //console.log(match.at(-1))
                continue;
            }
            // its not a nesting thing
            if(name.length == 0 && (/[0-9]/).test(line[i]) && line.charCodeAt(i + 1) != 65039) {
                i++
                while((/[0-9]/).test(line[i])) {
                    i++;
                }
                tokens.push({
                    type: Tokens.Number,
                    content: ""
                })
                continue;
            }
            name += line[i]
            i++
        }
        // add the final name if necessary
        if(name.length > 0) {
            tokens.push({
                type: Tokens.Name,
                content: name
            })
        }
        return tokens
    },
    scanTokens(tokens) {
        let count = {}
        console.log(tokens)
        for(let i = 0; i < tokens.length; i++) {
            let token = tokens[i]
            switch(token.type) {
            case Tokens.ParenExpr:
                // ignore it
                break;
            case Tokens.Name:
                // first: check if its a special case
                let special = false
                for(let func of functions) {
                    if(!token.content.startsWith(func.syntax[0])) {
                        continue;
                    }
                    // could be a special case
                    let good = true
                    for(let x = 1; x < func.syntax.length; x++) {
                        let test = func.syntax[x]
                        if(Number.isInteger(test)) {
                            good = good && tokens[i + x]?.type == test
                        }else{
                            if(x == (func.syntax.length - 1)) {
                                good == good && tokens[i + x].type == Tokens.Name && tokens[i + x].content == test
                            }else{
                                good == good && tokens[i + x].type == Tokens.Name && tokens[i + x].content.startsWith(test)
                            }
                        }
                        good = good && tokens[i + x]?.type == func.syntax[x]
                    }
                    if(!good) {
                        continue;
                    }
                    // its a special case
                    special = true
                    add(count, func.name)
                    token.content = token.content.slice(func.syntax.at(-1).length)
                    if(token.content.length > 0) {
                        i--
                    }
                    break;
                }
                if(special) {
                    break;
                }
                // next: check if its a normal function
                if(tokens[i + 1]?.type == Tokens.ParenExpr) {
                    // its a normal function
                    let name = generateFuncName(token.content, tokens[i + 1].content.length)
                    add(count, name)
                    i++
                    break;
                }
                // finally, take out a character and try again
                token.content = token.content.slice(1)
                if(token.content.length > 0) {
                    i--
                }
                break;
            case Tokens.Number:
                // numbers dont actually matter at all
                break;
            default:
                break;
            }
        }
        // now we have to scan each expression
        for(let token of tokens) {
            if(token.type != Tokens.ParenExpr && token.type != Tokens.BracketExpr) {
                continue;
            }
            for(let expr of token.content) {
                let count2 = this.scanTokens(expr)
                merge(count, count2)
            }
        }
        return count
    },
    scanLine(line) {
        let tokens = this.parse(line)
        return this.scanTokens(tokens)
    },
    scan(txt) {
        txt = txt.replaceAll(" ", "").split("\n")
        let count = {}
        for(let line of txt) {
            line = line.split("=")
            if(line.length == 1) {
                line = line[0]
            }else{
                line = line[1]
            }
            let count2 = this.scanLine(line)
            merge(count, count2)
        }
        return stringify(count)
    }
}

export {v1_0_0}