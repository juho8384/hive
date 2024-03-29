(function(r) {
    function s(p) {
        var g = {
            VERSION: "2.0.5",
            WIRE_TYPES: {}
        };
        g.WIRE_TYPES.VARINT = 0;
        g.WIRE_TYPES.BITS64 = 1;
        g.WIRE_TYPES.LDELIM = 2;
        g.WIRE_TYPES.STARTGROUP = 3;
        g.WIRE_TYPES.ENDGROUP = 4;
        g.WIRE_TYPES.BITS32 = 5;
        g.TYPES = {
            int32: {
                name: "int32",
                wireType: g.WIRE_TYPES.VARINT
            },
            uint32: {
                name: "uint32",
                wireType: g.WIRE_TYPES.VARINT
            },
            sint32: {
                name: "sint32",
                wireType: g.WIRE_TYPES.VARINT
            },
            int64: {
                name: "int64",
                wireType: g.WIRE_TYPES.VARINT
            },
            uint64: {
                name: "uint64",
                wireType: g.WIRE_TYPES.VARINT
            },
            sint64: {
                name: "sint64",
                wireType: g.WIRE_TYPES.VARINT
            },
            bool: {
                name: "bool",
                wireType: g.WIRE_TYPES.VARINT
            },
            "double": {
                name: "double",
                wireType: g.WIRE_TYPES.BITS64
            },
            string: {
                name: "string",
                wireType: g.WIRE_TYPES.LDELIM
            },
            bytes: {
                name: "bytes",
                wireType: g.WIRE_TYPES.LDELIM
            },
            fixed32: {
                name: "fixed32",
                wireType: g.WIRE_TYPES.BITS32
            },
            sfixed32: {
                name: "sfixed32",
                wireType: g.WIRE_TYPES.BITS32
            },
            fixed64: {
                name: "fixed64",
                wireType: g.WIRE_TYPES.BITS64
            },
            sfixed64: {
                name: "sfixed64",
                wireType: g.WIRE_TYPES.BITS64
            },
            "float": {
                name: "float",
                wireType: g.WIRE_TYPES.BITS32
            },
            "enum": {
                name: "enum",
                wireType: g.WIRE_TYPES.VARINT
            },
            message: {
                name: "message",
                wireType: g.WIRE_TYPES.LDELIM
            }
        };
        g.Long = p.Long;
        g.convertFieldsToCamelCase = !1;
        g.Util = function() {
            Object.create || (Object.create = function(b) {
                function c() {}
                if (1 < arguments.length) throw Error("Object.create implementation only accepts the first parameter.");
                c.prototype = b;
                return new c
            });
            var c = {};
            c.IS_NODE = ("undefined" === typeof window || !window.window) && "function" === typeof require && "undefined" !== typeof process && "function" === typeof process.nextTick;
            c.XHR = function() {
                for (var b = [function() {
                            return new XMLHttpRequest
                        },
                        function() {
                            return new ActiveXObject("Msxml2.XMLHTTP")
                        },
                        function() {
                            return new ActiveXObject("Msxml3.XMLHTTP")
                        },
                        function() {
                            return new ActiveXObject("Microsoft.XMLHTTP")
                        }
                    ], c = null, k = 0; k < b.length; k++) {
                    try {
                        c = b[k]()
                    } catch (a) {
                        continue
                    }
                    break
                }
                if (!c) throw Error("XMLHttpRequest is not supported");
                return c
            };
            c.fetch = function(b, l) {
                l && "function" != typeof l && (l = null);
                if (c.IS_NODE)
                    if (l) require("fs").readFile(b, function(a, b) {
                        a ? l(null) : l("" + b)
                    });
                    else try {
                        return require("fs").readFileSync(b)
                    } catch (k) {
                        return null
                    } else {
                        var a =
                            c.XHR();
                        a.open("GET", b, l ? !0 : !1);
                        a.setRequestHeader("Accept", "text/plain");
                        "function" === typeof a.overrideMimeType && a.overrideMimeType("text/plain");
                        if (l) a.onreadystatechange = function() {
                            4 == a.readyState && (200 == a.status || 0 == a.status && "string" === typeof a.responseText ? l(a.responseText) : l(null))
                        }, 4 != a.readyState && a.send(null);
                        else return a.send(null), 200 == a.status || 0 == a.status && "string" === typeof a.responseText ? a.responseText : null
                    }
            };
            c.isArray = function(b) {
                return b ? b instanceof Array ? !0 : Array.isArray ? Array.isArray(b) :
                    "[object Array]" === Object.prototype.toString.call(b) : !1
            };
            return c
        }();
        g.Lang = {
            OPEN: "{",
            CLOSE: "}",
            OPTOPEN: "[",
            OPTCLOSE: "]",
            OPTEND: ",",
            EQUAL: "=",
            END: ";",
            STRINGOPEN: '"',
            STRINGCLOSE: '"',
            COPTOPEN: "(",
            COPTCLOSE: ")",
            DELIM: /[\s\{\}=;\[\],"\(\)]/g,
            KEYWORD: /^(?:package|option|import|message|enum|extend|service|syntax|extensions)$/,
            RULE: /^(?:required|optional|repeated)$/,
            TYPE: /^(?:double|float|int32|uint32|sint32|int64|uint64|sint64|fixed32|sfixed32|fixed64|sfixed64|bool|string|bytes)$/,
            NAME: /^[a-zA-Z][a-zA-Z_0-9]*$/,
            OPTNAME: /^(?:[a-zA-Z][a-zA-Z_0-9]*|\([a-zA-Z][a-zA-Z_0-9]*\))$/,
            TYPEDEF: /^[a-zA-Z][a-zA-Z_0-9]*$/,
            TYPEREF: /^(?:\.?[a-zA-Z][a-zA-Z_0-9]*)+$/,
            FQTYPEREF: /^(?:\.[a-zA-Z][a-zA-Z_0-9]*)+$/,
            NUMBER: /^-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+|[0-9]*\.[0-9]+)$/,
            NUMBER_DEC: /^(?:[1-9][0-9]*|0)$/,
            NUMBER_HEX: /^0x[0-9a-fA-F]+$/,
            NUMBER_OCT: /^0[0-7]+$/,
            NUMBER_FLT: /^[0-9]*\.[0-9]+$/,
            ID: /^(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
            NEGID: /^\-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
            WHITESPACE: /\s/,
            STRING: /"([^"\\]*(\\.[^"\\]*)*)"/g,
            BOOL: /^(?:true|false)$/i,
            ID_MIN: 1,
            ID_MAX: 536870911
        };
        g.DotProto = {};
        g.DotProto.Tokenizer = function(c) {
            var b = function(b) {
                this.source = "" + b;
                this.index = 0;
                this.line = 1;
                this.stack = [];
                this.readingString = !1
            };
            b.prototype._readString = function() {
                c.STRING.lastIndex = this.index - 1;
                var b;
                if (null !== (b = c.STRING.exec(this.source))) return b = b[1], this.index = c.STRING.lastIndex, this.stack.push(c.STRINGCLOSE), b;
                throw Error("Illegal string value at line " + this.line + ", index " + this.index);
            };
            b.prototype.next = function() {
                if (0 < this.stack.length) return this.stack.shift();
                if (this.index >= this.source.length) return null;
                if (this.readingString) return this.readingString = !1, this._readString();
                var b, k;
                do {
                    for (b = !1; c.WHITESPACE.test(k = this.source.charAt(this.index));)
                        if (this.index++, "\n" === k && this.line++, this.index === this.source.length) return null;
                    if ("/" === this.source.charAt(this.index))
                        if ("/" === this.source.charAt(++this.index)) {
                            for (;
                                "\n" !== this.source.charAt(this.index);)
                                if (this.index++, this.index == this.source.length) return null;
                            this.index++;
                            this.line++;
                            b = !0
                        } else if ("*" ===
                        this.source.charAt(this.index)) {
                        for (k = "";
                            "*/" !== k + (k = this.source.charAt(this.index));)
                            if (this.index++, "\n" === k && this.line++, this.index === this.source.length) return null;
                        this.index++;
                        b = !0
                    } else throw Error("Invalid comment at line " + this.line + ": /" + this.source.charAt(this.index) + " ('/' or '*' expected)");
                } while (b);
                if (this.index === this.source.length) return null;
                b = this.index;
                c.DELIM.lastIndex = 0;
                if (c.DELIM.test(this.source.charAt(b))) b++;
                else
                    for (b++; b < this.source.length && !c.DELIM.test(this.source.charAt(b));) b++;
                b = this.source.substring(this.index, this.index = b);
                b === c.STRINGOPEN && (this.readingString = !0);
                return b
            };
            b.prototype.peek = function() {
                if (0 == this.stack.length) {
                    var b = this.next();
                    if (null === b) return null;
                    this.stack.push(b)
                }
                return this.stack[0]
            };
            b.prototype.toString = function() {
                return "Tokenizer(" + this.index + "/" + this.source.length + " at line " + this.line + ")"
            };
            return b
        }(g.Lang);
        g.DotProto.Parser = function(c, b, g) {
            c = function(b) {
                this.tn = new g(b)
            };
            c.prototype.parse = function() {
                var b = {
                        name: "[ROOT]",
                        "package": null,
                        messages: [],
                        enums: [],
                        imports: [],
                        options: {},
                        services: []
                    },
                    a, d = !0;
                do {
                    a = this.tn.next();
                    if (null == a) break;
                    if ("package" == a) {
                        if (!d) throw Error("Illegal package definition at line " + this.tn.line + ": Must be declared before the first message or enum");
                        if (null !== b["package"]) throw Error("Illegal package definition at line " + this.tn.line + ": Package already declared");
                        b["package"] = this._parsePackage(a)
                    } else if ("import" == a) {
                        if (!d) throw Error("Illegal import definition at line " + this.tn.line + ": Must be declared before the first message or enum");
                        b.imports.push(this._parseImport(a))
                    } else if ("message" === a) this._parseMessage(b, a), d = !1;
                    else if ("enum" === a) this._parseEnum(b, a), d = !1;
                    else if ("option" === a) {
                        if (!d) throw Error("Illegal option definition at line " + this.tn.line + ": Must be declared before the first message or enum");
                        this._parseOption(b, a)
                    } else if ("service" === a) this._parseService(b, a);
                    else if ("extend" === a) this._parseExtend(b, a);
                    else if ("syntax" === a) this._parseIgnoredStatement(b, a);
                    else throw Error("Illegal top level declaration at line " +
                        this.tn.line + ": " + a);
                } while (1);
                delete b.name;
                return b
            };
            c.prototype._parseNumber = function(c) {
                var a = 1;
                "-" == c.charAt(0) && (a = -1, c = c.substring(1));
                if (b.NUMBER_DEC.test(c)) return a * parseInt(c, 10);
                if (b.NUMBER_HEX.test(c)) return a * parseInt(c.substring(2), 16);
                if (b.NUMBER_OCT.test(c)) return a * parseInt(c.substring(1), 8);
                if (b.NUMBER_FLT.test(c)) return a * parseFloat(c);
                throw Error("Illegal number value at line " + this.tn.line + ": " + (0 > a ? "-" : "") + c);
            };
            c.prototype._parseId = function(c, a) {
                var d = -1,
                    e = 1;
                "-" == c.charAt(0) &&
                    (e = -1, c = c.substring(1));
                if (b.NUMBER_DEC.test(c)) d = parseInt(c);
                else if (b.NUMBER_HEX.test(c)) d = parseInt(c.substring(2), 16);
                else if (b.NUMBER_OCT.test(c)) d = parseInt(c.substring(1), 8);
                else throw Error("Illegal ID value at line " + this.tn.line + ": " + (0 > e ? "-" : "") + c);
                d = e * d | 0;
                if (!a && 0 > d) throw Error("Illegal ID range at line " + this.tn.line + ": " + (0 > e ? "-" : "") + c);
                return d
            };
            c.prototype._parsePackage = function(c) {
                c = this.tn.next();
                if (!b.TYPEREF.test(c)) throw Error("Illegal package name at line " + this.tn.line + ": " + c);
                var a = c;
                c = this.tn.next();
                if (c != b.END) throw Error("Illegal end of package definition at line " + this.tn.line + ": " + c + " ('" + b.END + "' expected)");
                return a
            };
            c.prototype._parseImport = function(c) {
                c = this.tn.next();
                "public" === c && (c = this.tn.next());
                if (c !== b.STRINGOPEN) throw Error("Illegal begin of import value at line " + this.tn.line + ": " + c + " ('" + b.STRINGOPEN + "' expected)");
                var a = this.tn.next();
                c = this.tn.next();
                if (c !== b.STRINGCLOSE) throw Error("Illegal end of import value at line " + this.tn.line + ": " + c + " ('" +
                    b.STRINGCLOSE + "' expected)");
                c = this.tn.next();
                if (c !== b.END) throw Error("Illegal end of import definition at line " + this.tn.line + ": " + c + " ('" + b.END + "' expected)");
                return a
            };
            c.prototype._parseOption = function(c, a) {
                a = this.tn.next();
                var d = !1;
                a == b.COPTOPEN && (d = !0, a = this.tn.next());
                if (!b.NAME.test(a) && !/google\.protobuf\./.test(a)) throw Error("Illegal option name in message " + c.name + " at line " + this.tn.line + ": " + a);
                var e = a;
                a = this.tn.next();
                if (d) {
                    if (a !== b.COPTCLOSE) throw Error("Illegal custom option name delimiter in message " +
                        c.name + ", option " + e + " at line " + this.tn.line + ": " + a + " ('" + b.COPTCLOSE + "' expected)");
                    e = "(" + e + ")";
                    a = this.tn.next();
                    b.FQTYPEREF.test(a) && (e += a, a = this.tn.next())
                }
                if (a !== b.EQUAL) throw Error("Illegal option operator in message " + c.name + ", option " + e + " at line " + this.tn.line + ": " + a + " ('" + b.EQUAL + "' expected)");
                a = this.tn.next();
                if (a === b.STRINGOPEN) {
                    if (d = this.tn.next(), a = this.tn.next(), a !== b.STRINGCLOSE) throw Error("Illegal end of option value in message " + c.name + ", option " + e + " at line " + this.tn.line + ": " +
                        a + " ('" + b.STRINGCLOSE + "' expected)");
                } else if (b.NUMBER.test(a)) d = this._parseNumber(a, !0);
                else if (b.TYPEREF.test(a)) d = a;
                else throw Error("Illegal option value in message " + c.name + ", option " + e + " at line " + this.tn.line + ": " + a);
                a = this.tn.next();
                if (a !== b.END) throw Error("Illegal end of option in message " + c.name + ", option " + e + " at line " + this.tn.line + ": " + a + " ('" + b.END + "' expected)");
                c.options[e] = d
            };
            c.prototype._parseIgnoredBlock = function(c, a) {
                var d = this.tn.next();
                if (!b.TYPEREF.test(d)) throw Error("Illegal " +
                    a + " type in " + c.name + ": " + d);
                var e = d,
                    d = this.tn.next();
                if (d !== b.OPEN) throw Error("Illegal OPEN in " + c.name + " after " + a + " " + e + " at line " + this.tn.line + ": " + d);
                var h = 1;
                do {
                    d = this.tn.next();
                    if (null === d) throw Error("Unexpected EOF in " + c.name + ", " + a + " (ignored) at line " + this.tn.line + ": " + e);
                    if (d === b.OPEN) h++;
                    else if (d === b.CLOSE && (d = this.tn.peek(), d === b.END && this.tn.next(), h--, 0 === h)) break
                } while (1)
            };
            c.prototype._parseIgnoredStatement = function(c, a) {
                var d;
                do {
                    d = this.tn.next();
                    if (null === d) throw Error("Unexpected EOF in " +
                        c.name + ", " + a + " (ignored) at line " + this.tn.line);
                    if (d === b.END) break
                } while (1)
            };
            c.prototype._parseService = function(c, a) {
                var d = this.tn.next();
                if (!b.NAME.test(d)) throw Error("Illegal service name at line " + this.tn.line + ": " + d);
                var e = d,
                    h = {
                        name: e,
                        rpc: {},
                        options: {}
                    },
                    d = this.tn.next();
                if (d !== b.OPEN) throw Error("Illegal OPEN after service " + e + " at line " + this.tn.line + ": " + d + " ('" + b.OPEN + "' expected)");
                do
                    if (d = this.tn.next(), "option" === d) this._parseOption(h, d);
                    else if ("rpc" === d) this._parseServiceRPC(h, d);
                else if (d !==
                    b.CLOSE) throw Error("Illegal type for service " + e + " at line " + this.tn.line + ": " + d);
                while (d !== b.CLOSE);
                c.services.push(h)
            };
            c.prototype._parseServiceRPC = function(c, a) {
                var d = a;
                a = this.tn.next();
                if (!b.NAME.test(a)) throw Error("Illegal RPC method name in service " + c.name + " at line " + this.tn.line + ": " + a);
                var e = a,
                    h = {
                        request: null,
                        response: null,
                        options: {}
                    };
                a = this.tn.next();
                if (a !== b.COPTOPEN) throw Error("Illegal start of request type in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('" + b.COPTOPEN +
                    "' expected)");
                a = this.tn.next();
                if (!b.TYPEREF.test(a)) throw Error("Illegal request type in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a);
                h.request = a;
                a = this.tn.next();
                if (a != b.COPTCLOSE) throw Error("Illegal end of request type in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('" + b.COPTCLOSE + "' expected)");
                a = this.tn.next();
                if ("returns" !== a.toLowerCase()) throw Error("Illegal request/response delimiter in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('returns' expected)");
                a = this.tn.next();
                if (a != b.COPTOPEN) throw Error("Illegal start of response type in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('" + b.COPTOPEN + "' expected)");
                a = this.tn.next();
                h.response = a;
                a = this.tn.next();
                if (a !== b.COPTCLOSE) throw Error("Illegal end of response type in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('" + b.COPTCLOSE + "' expected)");
                a = this.tn.next();
                if (a === b.OPEN) {
                    do
                        if (a = this.tn.next(), "option" === a) this._parseOption(h, a);
                        else if (a !== b.CLOSE) throw Error("Illegal start of option in RPC service " +
                        c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('option' expected)"); while (a !== b.CLOSE)
                } else if (a !== b.END) throw Error("Illegal method delimiter in RPC service " + c.name + "#" + e + " at line " + this.tn.line + ": " + a + " ('" + b.END + "' or '" + b.OPEN + "' expected)");
                "undefined" === typeof c[d] && (c[d] = {});
                c[d][e] = h
            };
            c.prototype._parseMessage = function(c, a) {
                var d = {};
                a = this.tn.next();
                if (!b.NAME.test(a)) throw Error("Illegal message name" + (c ? " in message " + c.name : "") + " at line " + this.tn.line + ": " + a);
                d.name = a;
                a = this.tn.next();
                if (a != b.OPEN) throw Error("Illegal OPEN after message " + d.name + " at line " + this.tn.line + ": " + a + " ('" + b.OPEN + "' expected)");
                d.fields = [];
                d.enums = [];
                d.messages = [];
                d.options = {};
                do
                    if (a = this.tn.next(), a === b.CLOSE) {
                        a = this.tn.peek();
                        a === b.END && this.tn.next();
                        break
                    } else if (b.RULE.test(a)) this._parseMessageField(d, a);
                else if ("enum" === a) this._parseEnum(d, a);
                else if ("message" === a) this._parseMessage(d, a);
                else if ("option" === a) this._parseOption(d, a);
                else if ("extensions" === a) d.extensions = this._parseExtensions(d,
                    a);
                else if ("extend" === a) this._parseExtend(d, a);
                else throw Error("Illegal token in message " + d.name + " at line " + this.tn.line + ": " + a + " (type or '" + b.CLOSE + "' expected)");
                while (1);
                c.messages.push(d);
                return d
            };
            c.prototype._parseMessageField = function(c, a) {
                var d = {};
                d.rule = a;
                a = this.tn.next();
                if (!b.TYPE.test(a) && !b.TYPEREF.test(a)) throw Error("Illegal field type in message " + c.name + " at line " + this.tn.line + ": " + a);
                d.type = a;
                a = this.tn.next();
                if (!b.NAME.test(a)) throw Error("Illegal field name in message " + c.name +
                    " at line " + this.tn.line + ": " + a);
                d.name = a;
                a = this.tn.next();
                if (a !== b.EQUAL) throw Error("Illegal field number operator in message " + c.name + "#" + d.name + " at line " + this.tn.line + ": " + a + " ('" + b.EQUAL + "' expected)");
                a = this.tn.next();
                try {
                    d.id = this._parseId(a)
                } catch (e) {
                    throw Error("Illegal field id in message " + c.name + "#" + d.name + " at line " + this.tn.line + ": " + a);
                }
                d.options = {};
                a = this.tn.next();
                a === b.OPTOPEN && (this._parseFieldOptions(c, d, a), a = this.tn.next());
                if (a !== b.END) throw Error("Illegal field delimiter in message " +
                    c.name + "#" + d.name + " at line " + this.tn.line + ": " + a + " ('" + b.END + "' expected)");
                c.fields.push(d)
            };
            c.prototype._parseFieldOptions = function(c, a, d) {
                var e = !0;
                do {
                    d = this.tn.next();
                    if (d === b.OPTCLOSE) break;
                    else if (d === b.OPTEND) {
                        if (e) throw Error("Illegal start of message field options in message " + c.name + "#" + a.name + " at line " + this.tn.line + ": " + d);
                        d = this.tn.next()
                    }
                    this._parseFieldOption(c, a, d);
                    e = !1
                } while (1)
            };
            c.prototype._parseFieldOption = function(c, a, d) {
                var e = !1;
                d === b.COPTOPEN && (d = this.tn.next(), e = !0);
                if (!b.NAME.test(d)) throw Error("Illegal field option in message " +
                    c.name + "#" + a.name + " at line " + this.tn.line + ": " + d);
                var h = d;
                d = this.tn.next();
                if (e) {
                    if (d !== b.COPTCLOSE) throw Error("Illegal custom field option name delimiter in message " + c.name + "#" + a.name + " at line " + this.tn.line + ": " + d + " (')' expected)");
                    h = "(" + h + ")";
                    d = this.tn.next();
                    b.FQTYPEREF.test(d) && (h += d, d = this.tn.next())
                }
                if (d !== b.EQUAL) throw Error("Illegal field option operation in message " + c.name + "#" + a.name + " at line " + this.tn.line + ": " + d + " ('=' expected)");
                d = this.tn.next();
                if (d === b.STRINGOPEN) {
                    if (e = this.tn.next(),
                        d = this.tn.next(), d != b.STRINGCLOSE) throw Error("Illegal end of field value in message " + c.name + "#" + a.name + ", option " + h + " at line " + this.tn.line + ": " + d + " ('" + b.STRINGCLOSE + "' expected)");
                } else if (b.NUMBER.test(d, !0)) e = this._parseNumber(d, !0);
                else if (b.BOOL.test(d)) e = "true" === d.toLowerCase();
                else if (b.TYPEREF.test(d)) e = d;
                else throw Error("Illegal field option value in message " + c.name + "#" + a.name + ", option " + h + " at line " + this.tn.line + ": " + d);
                a.options[h] = e
            };
            c.prototype._parseEnum = function(c, a) {
                var d = {};
                a = this.tn.next();
                if (!b.NAME.test(a)) throw Error("Illegal enum name in message " + c.name + " at line " + this.tn.line + ": " + a);
                d.name = a;
                a = this.tn.next();
                if (a !== b.OPEN) throw Error("Illegal OPEN after enum " + d.name + " at line " + this.tn.line + ": " + a);
                d.values = [];
                d.options = {};
                do {
                    a = this.tn.next();
                    if (a === b.CLOSE) {
                        a = this.tn.peek();
                        a === b.END && this.tn.next();
                        break
                    }
                    if ("option" == a) this._parseOption(d, a);
                    else {
                        if (!b.NAME.test(a)) throw Error("Illegal enum value name in enum " + d.name + " at line " + this.tn.line + ": " + a);
                        this._parseEnumValue(d, a)
                    }
                } while (1);
                c.enums.push(d)
            };
            c.prototype._parseEnumValue = function(c, a) {
                var d = {};
                d.name = a;
                a = this.tn.next();
                if (a !== b.EQUAL) throw Error("Illegal enum value operator in enum " + c.name + " at line " + this.tn.line + ": " + a + " ('" + b.EQUAL + "' expected)");
                a = this.tn.next();
                try {
                    d.id = this._parseId(a, !0)
                } catch (e) {
                    throw Error("Illegal enum value id in enum " + c.name + " at line " + this.tn.line + ": " + a);
                }
                c.values.push(d);
                a = this.tn.next();
                a === b.OPTOPEN && (this._parseFieldOptions(c, {
                    options: {}
                }, a), a = this.tn.next());
                if (a !== b.END) throw Error("Illegal enum value delimiter in enum " + c.name + " at line " + this.tn.line + ": " + a + " ('" + b.END + "' expected)");
            };
            c.prototype._parseExtensions = function(c, a) {
                var d = [];
                a = this.tn.next();
                "min" === a ? d.push(b.ID_MIN) : "max" === a ? d.push(b.ID_MAX) : d.push(this._parseNumber(a));
                a = this.tn.next();
                if ("to" !== a) throw "Illegal extensions delimiter in message " + c.name + " at line " + this.tn.line + " ('to' expected)";
                a = this.tn.next();
                "min" === a ? d.push(b.ID_MIN) : "max" === a ? d.push(b.ID_MAX) : d.push(this._parseNumber(a));
                a = this.tn.next();
                if (a !== b.END) throw Error("Illegal extension delimiter in message " + c.name + " at line " + this.tn.line + ": " + a + " ('" + b.END + "' expected)");
                return d
            };
            c.prototype._parseExtend = function(c, a) {
                a = this.tn.next();
                if (!b.TYPEREF.test(a)) throw Error("Illegal extended message name at line " + this.tn.line + ": " + a);
                var d = {};
                d.ref = a;
                d.fields = [];
                a = this.tn.next();
                if (a !== b.OPEN) throw Error("Illegal OPEN in extend " + d.name + " at line " + this.tn.line + ": " + a + " ('" + b.OPEN + "' expected)");
                do
                    if (a = this.tn.next(), a ===
                        b.CLOSE) {
                        a = this.tn.peek();
                        a == b.END && this.tn.next();
                        break
                    } else if (b.RULE.test(a)) this._parseMessageField(d, a);
                else throw Error("Illegal token in extend " + d.name + " at line " + this.tn.line + ": " + a + " (rule or '" + b.CLOSE + "' expected)");
                while (1);
                c.messages.push(d);
                return d
            };
            c.prototype.toString = function() {
                return "Parser"
            };
            return c
        }(g, g.Lang, g.DotProto.Tokenizer);
        g.Reflect = function(c) {
            var b = {},
                g = function(a, c) {
                    this.parent = a;
                    this.name = c
                };
            g.prototype.fqn = function() {
                var a = this.name,
                    c = this;
                do {
                    c = c.parent;
                    if (null ==
                        c) break;
                    a = c.name + "." + a
                } while (1);
                return a
            };
            g.prototype.toString = function(c) {
                var b = this.fqn();
                c && (this instanceof a ? b = "Message " + b : this instanceof a.Field ? b = "Message.Field " + b : this instanceof e ? b = "Enum " + b : this instanceof e.Value ? b = "Enum.Value " + b : this instanceof h ? b = "Service " + b : this instanceof h.Method ? b = this instanceof h.RPCMethod ? "Service.RPCMethod " + b : "Service.Method " + b : this instanceof k && (b = "Namespace " + b));
                return b
            };
            g.prototype.build = function() {
                throw Error(this.toString(!0) + " cannot be built directly");
            };
            b.T = g;
            var k = function(a, c, b) {
                g.call(this, a, c);
                this.children = [];
                this.options = b || {}
            };
            k.prototype = Object.create(g.prototype);
            k.prototype.getChildren = function(a) {
                a = a || null;
                if (null == a) return this.children.slice();
                for (var c = [], b = 0; b < this.children.length; b++) this.children[b] instanceof a && c.push(this.children[b]);
                return c
            };
            k.prototype.addChild = function(c) {
                var b;
                if (b = this.getChild(c.name))
                    if (b instanceof a.Field && b.name !== b.originalName && !this.hasChild(b.originalName)) b.name = b.originalName;
                    else if (c instanceof a.Field && c.name !== c.originalName && !this.hasChild(c.originalName)) c.name = c.originalName;
                else throw Error("Duplicate name in namespace " + this.toString(!0) + ": " + c.name);
                this.children.push(c)
            };
            k.prototype.hasChild = function(a) {
                var c;
                if ("number" == typeof a)
                    for (c = 0; c < this.children.length; c++) {
                        if ("undefined" !== typeof this.children[c].id && this.children[c].id == a) return !0
                    } else
                        for (c = 0; c < this.children.length; c++)
                            if ("undefined" !== typeof this.children[c].name && this.children[c].name == a) return !0;
                return !1
            };
            k.prototype.getChild =
                function(a) {
                    var c;
                    if ("number" == typeof a)
                        for (c = 0; c < this.children.length; c++) {
                            if ("undefined" !== typeof this.children[c].id && this.children[c].id == a) return this.children[c]
                        } else
                            for (c = 0; c < this.children.length; c++)
                                if ("undefined" !== typeof this.children[c].name && this.children[c].name == a) return this.children[c];
                    return null
                };
            k.prototype.resolve = function(a, c) {
                var d = a.split("."),
                    e = this,
                    h = 0;
                if ("" == d[h]) {
                    for (; null != e.parent;) e = e.parent;
                    h++
                }
                do {
                    do {
                        e = e.getChild(d[h]);
                        if (!(e && e instanceof b.T) || c && e instanceof b.Message.Field) {
                            e =
                                null;
                            break
                        }
                        h++
                    } while (h < d.length);
                    if (null != e) break;
                    if (null !== this.parent) return this.parent.resolve(a, c)
                } while (null != e);
                return e
            };
            k.prototype.build = function() {
                for (var a = {}, c = this.getChildren(), b, d = 0; d < c.length; d++) b = c[d], b instanceof k && (a[b.name] = b.build());
                Object.defineProperty && Object.defineProperty(a, "$options", {
                    value: this.buildOpt(),
                    enumerable: !1,
                    configurable: !1,
                    writable: !1
                });
                return a
            };
            k.prototype.buildOpt = function() {
                for (var a = {}, c = Object.keys(this.options), b = 0; b < c.length; b++) a[c[b]] = this.options[c[b]];
                return a
            };
            k.prototype.getOption = function(a) {
                return "undefined" == typeof a ? this.options : "undefined" != typeof this.options[a] ? this.options[a] : null
            };
            b.Namespace = k;
            var a = function(a, b, d) {
                k.call(this, a, b, d);
                this.extensions = [c.Lang.ID_MIN, c.Lang.ID_MAX];
                this.clazz = null
            };
            a.prototype = Object.create(k.prototype);
            a.prototype.build = function(d) {
                if (this.clazz && !d) return this.clazz;
                d = function(a, c) {
                    var d = c.getChildren(b.Message.Field),
                        f = function(c) {
                            a.Builder.Message.call(this);
                            var b, f;
                            for (b = 0; b < d.length; b++) f = d[b], this[f.name] =
                                f.repeated ? [] : null;
                            for (b = 0; b < d.length; b++)
                                if (f = d[b], "undefined" != typeof f.options["default"]) try {
                                    this.set(f.name, f.options["default"])
                                } catch (e) {
                                    throw Error("[INTERNAL] " + e);
                                }
                            if (1 != arguments.length || "object" != typeof c || "function" == typeof c.encode || a.Util.isArray(c) || c instanceof p || c instanceof ArrayBuffer || a.Long && c instanceof a.Long)
                                for (b = 0; b < arguments.length; b++) b < d.length && this.set(d[b].name, arguments[b]);
                            else
                                for (f = Object.keys(c), b = 0; b < f.length; b++) this.set(f[b], c[f[b]])
                        };
                    f.prototype = Object.create(a.Builder.Message.prototype);
                    f.prototype.add = function(b, d) {
                        var f = c.getChild(b);
                        if (!f) throw Error(this + "#" + b + " is undefined");
                        if (!(f instanceof a.Reflect.Message.Field)) throw Error(this + "#" + b + " is not a field: " + f.toString(!0));
                        if (!f.repeated) throw Error(this + "#" + b + " is not a repeated field");
                        null === this[f.name] && (this[f.name] = []);
                        this[f.name].push(f.verifyValue(d, !0))
                    };
                    f.prototype.set = function(b, d) {
                        var f = c.getChild(b);
                        if (!f) throw Error(this + "#" + b + " is not a field: undefined");
                        if (!(f instanceof a.Reflect.Message.Field)) throw Error(this +
                            "#" + b + " is not a field: " + f.toString(!0));
                        this[f.name] = f.verifyValue(d)
                    };
                    f.prototype.get = function(b) {
                        var d = c.getChild(b);
                        if (!(d && d instanceof a.Reflect.Message.Field)) throw Error(this + "#" + b + " is not a field: undefined");
                        if (!(d instanceof a.Reflect.Message.Field)) throw Error(this + "#" + b + " is not a field: " + d.toString(!0));
                        return this[d.name]
                    };
                    for (var e = 0; e < d.length; e++)(function(a) {
                        var b = a.originalName.replace(/(_[a-zA-Z])/g, function(a) {
                                return a.toUpperCase().replace("_", "")
                            }),
                            b = b.substring(0, 1).toUpperCase() +
                            b.substring(1),
                            d = a.originalName.replace(/([A-Z])/g, function(a) {
                                return "_" + a
                            });
                        c.hasChild("set" + b) || (f.prototype["set" + b] = function(c) {
                            this.set(a.name, c)
                        });
                        c.hasChild("set_" + d) || (f.prototype["set_" + d] = function(c) {
                            this.set(a.name, c)
                        });
                        c.hasChild("get" + b) || (f.prototype["get" + b] = function() {
                            return this.get(a.name)
                        });
                        c.hasChild("get_" + d) || (f.prototype["get_" + d] = function() {
                            return this.get(a.name)
                        })
                    })(d[e]);
                    f.prototype.encode = function(a) {
                        a = a || new p;
                        var b = a.littleEndian;
                        try {
                            return c.encode(this, a.LE()).flip().LE(b)
                        } catch (d) {
                            throw a.LE(b),
                                d;
                        }
                    };
                    f.prototype.encodeAB = function() {
                        try {
                            return this.encode().toArrayBuffer()
                        } catch (a) {
                            throw a.encoded && (a.encoded = a.encoded.toArrayBuffer()), a;
                        }
                    };
                    f.prototype.toArrayBuffer = f.prototype.encodeAB;
                    f.prototype.encodeNB = function() {
                        try {
                            return this.encode().toBuffer()
                        } catch (a) {
                            throw a.encoded && (a.encoded = a.encoded.toBuffer()), a;
                        }
                    };
                    f.prototype.toBuffer = f.prototype.encodeNB;
                    f.prototype.encode64 = function() {
                        try {
                            return this.encode().toBase64()
                        } catch (a) {
                            throw a.encoded && (a.encoded = a.encoded.toBase64()), a;
                        }
                    };
                    f.prototype.toBase64 =
                        f.prototype.encode64;
                    f.prototype.encodeHex = function() {
                        try {
                            return this.encode().toHex()
                        } catch (a) {
                            throw a.encoded && (a.encoded = a.encoded.toHex()), a;
                        }
                    };
                    f.prototype.toHex = f.prototype.encodeHex;
                    f.decode = function(a, b) {
                        if (null === a) throw Error("buffer must not be null");
                        "string" === typeof a && (a = p.wrap(a, b ? b : "base64"));
                        a = a instanceof p ? a : p.wrap(a);
                        var d = a.littleEndian;
                        try {
                            var f = c.decode(a.LE());
                            a.LE(d);
                            return f
                        } catch (e) {
                            throw a.LE(d), e;
                        }
                    };
                    f.decode64 = function(a) {
                        return f.decode(a, "base64")
                    };
                    f.decodeHex = function(a) {
                        return f.decode(a,
                            "hex")
                    };
                    f.prototype.toString = function() {
                        return c.toString()
                    };
                    Object.defineProperty && Object.defineProperty(f, "$options", {
                        value: c.buildOpt(),
                        enumerable: !1,
                        configurable: !1,
                        writable: !1
                    });
                    return f
                }(c, this);
                for (var m = this.getChildren(), q = 0; q < m.length; q++)
                    if (m[q] instanceof e) d[m[q].name] = m[q].build();
                    else if (m[q] instanceof a) d[m[q].name] = m[q].build();
                else if (!(m[q] instanceof a.Field)) throw Error("Illegal reflect child of " + this.toString(!0) + ": " + m[q].toString(!0));
                return this.clazz = d
            };
            a.prototype.encode =
                function(c, b) {
                    for (var d = this.getChildren(a.Field), e = null, h = 0; h < d.length; h++) {
                        var g = c.get(d[h].name);
                        d[h].required && null === g ? null === e && (e = d[h]) : d[h].encode(g, b)
                    }
                    if (null !== e) throw d = Error("Missing at least one required field for " + this.toString(!0) + ": " + e), d.encoded = b, d;
                    return b
                };
            a.prototype.decode = function(a, b) {
                b = "number" === typeof b ? b : -1;
                for (var d = a.offset, e = new this.clazz; a.offset < d + b || -1 == b && 0 < a.remaining();) {
                    var h = a.readVarint32(),
                        g = h & 7,
                        h = h >> 3,
                        k = this.getChild(h);
                    if (k) k.repeated && !k.options.packed ?
                        e.add(k.name, k.decode(g, a)) : e.set(k.name, k.decode(g, a));
                    else switch (g) {
                        case c.WIRE_TYPES.VARINT:
                            a.readVarint32();
                            break;
                        case c.WIRE_TYPES.BITS32:
                            a.offset += 4;
                            break;
                        case c.WIRE_TYPES.BITS64:
                            a.offset += 8;
                            break;
                        case c.WIRE_TYPES.LDELIM:
                            g = a.readVarint32();
                            a.offset += g;
                            break;
                        default:
                            throw Error("Illegal wire type of unknown field " + h + " in " + this.toString(!0) + "#decode: " + g);
                    }
                }
                d = this.getChildren(c.Reflect.Field);
                for (g = 0; g < d.length; g++)
                    if (d[g].required && null === e[d[g].name]) throw d = Error("Missing at least one required field for " +
                        this.toString(!0) + ": " + d[g].name), d.decoded = e, d;
                return e
            };
            b.Message = a;
            var d = function(a, b, d, e, h, k) {
                g.call(this, a, e);
                this.required = "required" == b;
                this.repeated = "repeated" == b;
                this.type = d;
                this.resolvedType = null;
                this.id = h;
                this.options = k || {};
                this.originalName = this.name;
                c.convertFieldsToCamelCase && (this.name = this.name.replace(/_([a-zA-Z])/g, function(a, c) {
                    return c.toUpperCase()
                }))
            };
            d.prototype = Object.create(g.prototype);
            d.prototype.verifyValue = function(a, b) {
                b = b || !1;
                if (null === a) {
                    if (this.required) throw Error("Illegal value for " +
                        this.toString(!0) + ": " + a + " (required)");
                    return null
                }
                var d;
                if (this.repeated && !b) {
                    c.Util.isArray(a) || (a = [a]);
                    var h = [];
                    for (d = 0; d < a.length; d++) h.push(this.verifyValue(a[d], !0));
                    return h
                }
                if (!this.repeated && c.Util.isArray(a)) throw Error("Illegal value for " + this.toString(!0) + ": " + a + " (no array expected)");
                if (this.type == c.TYPES.int32 || this.type == c.TYPES.sint32 || this.type == c.TYPES.sfixed32) return isNaN(d = parseInt(a, 10)) ? d : d | 0;
                if (this.type == c.TYPES.uint32 || this.type == c.TYPES.fixed32) return isNaN(d = parseInt(a,
                    10)) ? d : d >>> 0;
                if (c.Long) {
                    if (this.type == c.TYPES.int64 || this.type == c.TYPES.sint64 || this.type == c.TYPES.sfixed64) return "object" == typeof a && a instanceof c.Long ? a.unsigned ? a.toSigned() : a : c.Long.fromNumber(a, !1);
                    if (this.type == c.TYPES.uint64 || this.type == c.TYPES.fixed64) return "object" == typeof a && a instanceof c.Long ? a.unsigned ? a : a.toUnsigned() : c.Long.fromNumber(a, !0)
                }
                if (this.type == c.TYPES.bool) return "string" === typeof a ? "true" === a : !!a;
                if (this.type == c.TYPES["float"] || this.type == c.TYPES["double"]) return parseFloat(a);
                if (this.type == c.TYPES.string) return "" + a;
                if (this.type == c.TYPES.bytes) return a && a instanceof p ? a : p.wrap(a);
                if (this.type == c.TYPES["enum"]) {
                    h = this.resolvedType.getChildren(e.Value);
                    for (d = 0; d < h.length; d++)
                        if (h[d].name == a || h[d].id == a) return h[d].id;
                    throw Error("Illegal value for " + this.toString(!0) + ": " + a + " (not a valid enum value)");
                }
                if (this.type == c.TYPES.message) {
                    if ("object" !== typeof a) throw Error("Illegal value for " + this.toString(!0) + ": " + a + " (object expected)");
                    return a instanceof this.resolvedType.clazz ?
                        a : new this.resolvedType.clazz(a)
                }
                throw Error("[INTERNAL] Illegal value for " + this.toString(!0) + ": " + a + " (undefined type " + this.type + ")");
            };
            d.prototype.encode = function(a, b) {
                a = this.verifyValue(a);
                if (null == this.type || "object" != typeof this.type) throw Error("[INTERNAL] Unresolved type in " + this.toString(!0) + ": " + this.type);
                if (null === a || this.repeated && 0 == a.length) return b;
                try {
                    if (this.repeated) {
                        var d;
                        if (this.options.packed) {
                            b.writeVarint32(this.id << 3 | c.WIRE_TYPES.LDELIM);
                            b.ensureCapacity(b.offset += 1);
                            var e =
                                b.offset;
                            for (d = 0; d < a.length; d++) this.encodeValue(a[d], b);
                            var h = b.offset - e,
                                g = p.calculateVarint32(h);
                            if (1 < g) {
                                var k = b.slice(e, b.offset),
                                    e = e + (g - 1);
                                b.offset = e;
                                b.append(k)
                            }
                            b.writeVarint32(h, e - g)
                        } else
                            for (d = 0; d < a.length; d++) b.writeVarint32(this.id << 3 | this.type.wireType), this.encodeValue(a[d], b)
                    } else b.writeVarint32(this.id << 3 | this.type.wireType), this.encodeValue(a, b)
                } catch (l) {
                    throw Error("Illegal value for " + this.toString(!0) + ": " + a + " (" + l + ")");
                }
                return b
            };
            d.prototype.encodeValue = function(a, b) {
                if (null !==
                    a) {
                    if (this.type == c.TYPES.int32 || this.type == c.TYPES.uint32) b.writeVarint32(a);
                    else if (this.type == c.TYPES.sint32) b.writeZigZagVarint32(a);
                    else if (this.type == c.TYPES.fixed32) b.writeUint32(a);
                    else if (this.type == c.TYPES.sfixed32) b.writeInt32(a);
                    else if (this.type == c.TYPES.int64 || this.type == c.TYPES.uint64) b.writeVarint64(a);
                    else if (this.type == c.TYPES.sint64) b.writeZigZagVarint64(a);
                    else if (this.type == c.TYPES.fixed64) b.writeUint64(a);
                    else if (this.type == c.TYPES.sfixed64) b.writeInt64(a);
                    else if (this.type ==
                        c.TYPES.bool) "string" === typeof a ? b.writeVarint32("false" === a.toLowerCase() ? 0 : !!a) : b.writeVarint32(a ? 1 : 0);
                    else if (this.type == c.TYPES["enum"]) b.writeVarint32(a);
                    else if (this.type == c.TYPES["float"]) b.writeFloat32(a);
                    else if (this.type == c.TYPES["double"]) b.writeFloat64(a);
                    else if (this.type == c.TYPES.string) b.writeVString(a);
                    else if (this.type == c.TYPES.bytes) a.offset > a.length && (b = b.clone().flip()), b.writeVarint32(a.remaining()), b.append(a);
                    else if (this.type == c.TYPES.message) {
                        var d = (new p).LE();
                        this.resolvedType.encode(a,
                            d);
                        b.writeVarint32(d.offset);
                        b.append(d.flip())
                    } else throw Error("[INTERNAL] Illegal value to encode in " + this.toString(!0) + ": " + a + " (unknown type)");
                    return b
                }
            };
            d.prototype.decode = function(a, b, d) {
                if (a != this.type.wireType && (d || a != c.WIRE_TYPES.LDELIM || !this.repeated)) throw Error("Illegal wire type for field " + this.toString(!0) + ": " + a + " (" + this.type.wireType + " expected)");
                if (a == c.WIRE_TYPES.LDELIM && this.repeated && this.options.packed && !d) {
                    a = b.readVarint32();
                    a = b.offset + a;
                    for (d = []; b.offset < a;) d.push(this.decode(this.type.wireType,
                        b, !0));
                    return d
                }
                if (this.type == c.TYPES.int32) return b.readVarint32() | 0;
                if (this.type == c.TYPES.uint32) return b.readVarint32() >>> 0;
                if (this.type == c.TYPES.sint32) return b.readZigZagVarint32() | 0;
                if (this.type == c.TYPES.fixed32) return b.readUint32() >>> 0;
                if (this.type == c.TYPES.sfixed32) return b.readInt32() | 0;
                if (this.type == c.TYPES.int64) return b.readVarint64();
                if (this.type == c.TYPES.uint64) return b.readVarint64().toUnsigned();
                if (this.type == c.TYPES.sint64) return b.readZigZagVarint64();
                if (this.type == c.TYPES.fixed64) return b.readUint64();
                if (this.type == c.TYPES.sfixed64) return b.readInt64();
                if (this.type == c.TYPES.bool) return !!b.readVarint32();
                if (this.type == c.TYPES["enum"]) return b.readVarint32();
                if (this.type == c.TYPES["float"]) return b.readFloat();
                if (this.type == c.TYPES["double"]) return b.readDouble();
                if (this.type == c.TYPES.string) return b.readVString();
                if (this.type == c.TYPES.bytes) {
                    a = b.readVarint32();
                    if (b.remaining() < a) throw Error("Illegal number of bytes for " + this.toString(!0) + ": " + a + " required but got only " + b.remaining());
                    d = b.clone();
                    d.length = d.offset + a;
                    b.offset += a;
                    return d
                }
                if (this.type == c.TYPES.message) return a = b.readVarint32(), this.resolvedType.decode(b, a);
                throw Error("[INTERNAL] Illegal wire type for " + this.toString(!0) + ": " + a);
            };
            b.Message.Field = d;
            var e = function(a, b, c) {
                k.call(this, a, b, c);
                this.object = null
            };
            e.prototype = Object.create(k.prototype);
            e.prototype.build = function() {
                for (var a = {}, b = this.getChildren(e.Value), c = 0; c < b.length; c++) a[b[c].name] = b[c].id;
                Object.defineProperty && Object.defineProperty(a, "$options", {
                    value: this.buildOpt(),
                    enumerable: !1,
                    configurable: !1,
                    writable: !1
                });
                return this.object = a
            };
            b.Enum = e;
            d = function(a, b, c) {
                g.call(this, a, b);
                this.id = c
            };
            d.prototype = Object.create(g.prototype);
            b.Enum.Value = d;
            var h = function(a, b, c) {
                k.call(this, a, b, c);
                this.clazz = null
            };
            h.prototype = Object.create(k.prototype);
            h.prototype.build = function(a) {
                return this.clazz && !a ? this.clazz : this.clazz = function(a, c) {
                    var d = function(b) {
                        a.Builder.Service.call(this);
                        this.rpcImpl = b || function(a, b, c) {
                            setTimeout(c.bind(this, Error("Not implemented, see: https://github.com/dcodeIO/ProtoBuf.js/wiki/Services")),
                                0)
                        }
                    };
                    d.prototype = Object.create(a.Builder.Service.prototype);
                    Object.defineProperty && (Object.defineProperty(d, "$options", {
                        value: c.buildOpt(),
                        enumerable: !1,
                        configurable: !1,
                        writable: !1
                    }), Object.defineProperty(d.prototype, "$options", {
                        value: d.$options,
                        enumerable: !1,
                        configurable: !1,
                        writable: !1
                    }));
                    for (var e = c.getChildren(b.Service.RPCMethod), f = 0; f < e.length; f++)(function(a) {
                        d.prototype[a.name] = function(b, d) {
                            try {
                                b && b instanceof a.resolvedRequestType.clazz || setTimeout(d.bind(this, Error("Illegal request type provided to service method " +
                                    c.name + "#" + a.name))), this.rpcImpl(a.fqn(), b, function(b, e) {
                                    if (b) d(b);
                                    else {
                                        try {
                                            e = a.resolvedResponseType.clazz.decode(e)
                                        } catch (f) {}
                                        e && e instanceof a.resolvedResponseType.clazz ? d(null, e) : d(Error("Illegal response type received in service method " + c.name + "#" + a.name))
                                    }
                                })
                            } catch (e) {
                                setTimeout(d.bind(this, e), 0)
                            }
                        };
                        d[a.name] = function(b, c, e) {
                            (new d(b))[a.name](c, e)
                        };
                        Object.defineProperty && (Object.defineProperty(d[a.name], "$options", {
                            value: a.buildOpt(),
                            enumerable: !1,
                            configurable: !1,
                            writable: !1
                        }), Object.defineProperty(d.prototype[a.name],
                            "$options", {
                                value: d[a.name].$options,
                                enumerable: !1,
                                configurable: !1,
                                writable: !1
                            }))
                    })(e[f]);
                    return d
                }(c, this)
            };
            b.Service = h;
            var n = function(a, b, c) {
                g.call(this, a, b);
                this.options = c || {}
            };
            n.prototype = Object.create(g.prototype);
            n.prototype.buildOpt = k.prototype.buildOpt;
            b.Service.Method = n;
            d = function(a, b, c, d, e) {
                n.call(this, a, b, e);
                this.requestName = c;
                this.responseName = d;
                this.resolvedResponseType = this.resolvedRequestType = null
            };
            d.prototype = Object.create(n.prototype);
            b.Service.RPCMethod = d;
            return b
        }(g);
        g.Builder =
            function(c, b, g) {
                var k = function() {
                    this.ptr = this.ns = new g.Namespace(null, "");
                    this.resolved = !1;
                    this.result = null;
                    this.files = {};
                    this.importRoot = null
                };
                k.prototype.reset = function() {
                    this.ptr = this.ns
                };
                k.prototype.define = function(a, c) {
                    if ("string" !== typeof a || !b.TYPEREF.test(a)) throw Error("Illegal package name: " + a);
                    var e = a.split("."),
                        h;
                    for (h = 0; h < e.length; h++)
                        if (!b.NAME.test(e[h])) throw Error("Illegal package name: " + e[h]);
                    for (h = 0; h < e.length; h++) this.ptr.hasChild(e[h]) || this.ptr.addChild(new g.Namespace(this.ptr,
                        e[h], c)), this.ptr = this.ptr.getChild(e[h]);
                    return this
                };
                k.isValidMessage = function(a) {
                    if ("string" !== typeof a.name || !b.NAME.test(a.name) || "undefined" !== typeof a.values || "undefined" !== typeof a.rpc) return !1;
                    var d;
                    if ("undefined" !== typeof a.fields) {
                        if (!c.Util.isArray(a.fields)) return !1;
                        var e = [],
                            h;
                        for (d = 0; d < a.fields.length; d++) {
                            if (!k.isValidMessageField(a.fields[d])) return !1;
                            h = parseInt(a.id, 10);
                            if (0 <= e.indexOf(h)) return !1;
                            e.push(h)
                        }
                    }
                    if ("undefined" !== typeof a.enums) {
                        if (!c.Util.isArray(a.enums)) return !1;
                        for (d =
                            0; d < a.enums.length; d++)
                            if (!k.isValidEnum(a.enums[d])) return !1
                    }
                    if ("undefined" !== typeof a.messages) {
                        if (!c.Util.isArray(a.messages)) return !1;
                        for (d = 0; d < a.messages.length; d++)
                            if (!k.isValidMessage(a.messages[d]) && !k.isValidExtend(a.messages[d])) return !1
                    }
                    return "undefined" === typeof a.extensions || c.Util.isArray(a.extensions) && 2 === a.extensions.length && "number" === typeof a.extensions[0] && "number" === typeof a.extensions[1] ? !0 : !1
                };
                k.isValidMessageField = function(a) {
                    if ("string" !== typeof a.rule || "string" !== typeof a.name ||
                        "string" !== typeof a.type || "undefined" === typeof a.id || !(b.RULE.test(a.rule) && b.NAME.test(a.name) && b.TYPEREF.test(a.type) && b.ID.test("" + a.id))) return !1;
                    if ("undefined" != typeof a.options) {
                        if ("object" != typeof a.options) return !1;
                        for (var c = Object.keys(a.options), e = 0; e < c.length; e++)
                            if (!b.OPTNAME.test(c[e]) || "string" !== typeof a.options[c[e]] && "number" !== typeof a.options[c[e]] && "boolean" !== typeof a.options[c[e]]) return !1
                    }
                    return !0
                };
                k.isValidEnum = function(a) {
                    if ("string" !== typeof a.name || !b.NAME.test(a.name) ||
                        "undefined" === typeof a.values || !c.Util.isArray(a.values) || 0 == a.values.length) return !1;
                    for (var d = 0; d < a.values.length; d++)
                        if ("object" != typeof a.values[d] || "string" !== typeof a.values[d].name || "undefined" === typeof a.values[d].id || !b.NAME.test(a.values[d].name) || !b.NEGID.test("" + a.values[d].id)) return !1;
                    return !0
                };
                k.prototype.create = function(a) {
                    if (a && (c.Util.isArray(a) || (a = [a]), 0 != a.length)) {
                        var d = [],
                            e, h, n, f, m;
                        for (d.push(a); 0 < d.length;) {
                            a = d.pop();
                            if (c.Util.isArray(a))
                                for (; 0 < a.length;)
                                    if (e = a.shift(), k.isValidMessage(e)) {
                                        h =
                                            new g.Message(this.ptr, e.name, e.options);
                                        if (e.fields && 0 < e.fields.length)
                                            for (f = 0; f < e.fields.length; f++) {
                                                if (h.hasChild(e.fields[f].id)) throw Error("Duplicate field id in message " + h.name + ": " + e.fields[f].id);
                                                if (e.fields[f].options)
                                                    for (n = Object.keys(e.fields[f].options), m = 0; m < n.length; m++) {
                                                        if (!b.OPTNAME.test(n[m])) throw Error("Illegal field option name in message " + h.name + "#" + e.fields[f].name + ": " + n[m]);
                                                        if ("string" !== typeof e.fields[f].options[n[m]] && "number" !== typeof e.fields[f].options[n[m]] && "boolean" !==
                                                            typeof e.fields[f].options[n[m]]) throw Error("Illegal field option value in message " + h.name + "#" + e.fields[f].name + "#" + n[m] + ": " + e.fields[f].options[n[m]]);
                                                    }
                                                h.addChild(new g.Message.Field(h, e.fields[f].rule, e.fields[f].type, e.fields[f].name, e.fields[f].id, e.fields[f].options))
                                            }
                                        n = [];
                                        if ("undefined" !== typeof e.enums && 0 < e.enums.length)
                                            for (f = 0; f < e.enums.length; f++) n.push(e.enums[f]);
                                        if (e.messages && 0 < e.messages.length)
                                            for (f = 0; f < e.messages.length; f++) n.push(e.messages[f]);
                                        e.extensions && (h.extensions = e.extensions,
                                            h.extensions[0] < c.Lang.ID_MIN && (h.extensions[0] = c.Lang.ID_MIN), h.extensions[1] > c.Lang.ID_MAX && (h.extensions[1] = c.Lang.ID_MAX));
                                        this.ptr.addChild(h);
                                        0 < n.length && (d.push(a), a = n, this.ptr = h)
                                    } else if (k.isValidEnum(e)) {
                                h = new g.Enum(this.ptr, e.name, e.options);
                                for (f = 0; f < e.values.length; f++) h.addChild(new g.Enum.Value(h, e.values[f].name, e.values[f].id));
                                this.ptr.addChild(h)
                            } else if (k.isValidService(e)) {
                                h = new g.Service(this.ptr, e.name, e.options);
                                for (f in e.rpc) e.rpc.hasOwnProperty(f) && h.addChild(new g.Service.RPCMethod(h,
                                    f, e.rpc[f].request, e.rpc[f].response, e.rpc[f].options));
                                this.ptr.addChild(h)
                            } else if (k.isValidExtend(e))
                                if (h = this.ptr.resolve(e.ref))
                                    for (f = 0; f < e.fields.length; f++) {
                                        if (h.hasChild(e.fields[f].id)) throw Error("Duplicate extended field id in message " + h.name + ": " + e.fields[f].id);
                                        if (e.fields[f].id < h.extensions[0] || e.fields[f].id > h.extensions[1]) throw Error("Illegal extended field id in message " + h.name + ": " + e.fields[f].id + " (" + h.extensions.join(" to ") + " expected)");
                                        h.addChild(new g.Message.Field(h, e.fields[f].rule,
                                            e.fields[f].type, e.fields[f].name, e.fields[f].id, e.fields[f].options))
                                    } else {
                                        if (!/\.?google\.protobuf\./.test(e.ref)) throw Error("Extended message " + e.ref + " is not defined");
                                    } else throw Error("Not a valid message, enum, service or extend definition: " + JSON.stringify(e));
                                else throw Error("Not a valid namespace definition: " + JSON.stringify(a));
                            this.ptr = this.ptr.parent
                        }
                        this.resolved = !1;
                        this.result = null;
                        return this
                    }
                };
                k.isValidImport = function(a) {
                    return !/google\/protobuf\//.test(a)
                };
                k.prototype["import"] =
                    function(a, b) {
                        if ("string" === typeof b) {
                            c.Util.IS_NODE && (b = require("path").resolve(b));
                            if (this.files[b]) return this.reset(), this;
                            this.files[b] = !0
                        }
                        if (a.imports && 0 < a.imports.length) {
                            var e, h = "/",
                                g = !1;
                            if ("object" === typeof b) {
                                if (this.importRoot = b.root, g = !0, e = this.importRoot, b = b.file, 0 <= e.indexOf("\\") || 0 <= b.indexOf("\\")) h = "\\"
                            } else "string" === typeof b ? this.importRoot ? e = this.importRoot : 0 <= b.indexOf("/") ? (e = b.replace(/\/[^\/]*$/, ""), "" === e && (e = "/")) : 0 <= b.indexOf("\\") ? (e = b.replace(/\\[^\\]*$/, ""), h = "\\") :
                                e = "." : e = null;
                            for (var f = 0; f < a.imports.length; f++)
                                if ("string" === typeof a.imports[f]) {
                                    if (!e) throw Error("Cannot determine import root: File name is unknown");
                                    var m = e + h + a.imports[f];
                                    if (k.isValidImport(m)) {
                                        /\.proto$/i.test(m) && !c.DotProto && (m = m.replace(/\.proto$/, ".json"));
                                        var l = c.Util.fetch(m);
                                        if (null === l) throw Error("Failed to import '" + m + "' in '" + b + "': File not found");
                                        if (/\.json$/i.test(m)) this["import"](JSON.parse(l + ""), m);
                                        else this["import"]((new c.DotProto.Parser(l + "")).parse(), m)
                                    }
                                } else if (b)
                                if (/\.(\w+)$/.test(b)) this["import"](a.imports[f],
                                    b.replace(/^(.+)\.(\w+)$/, function(a, b, c) {
                                        return b + "_import" + f + "." + c
                                    }));
                                else this["import"](a.imports[f], b + "_import" + f);
                            else this["import"](a.imports[f]);
                            g && (this.importRoot = null)
                        }
                        a.messages && (a["package"] && this.define(a["package"], a.options), this.create(a.messages), this.reset());
                        a.enums && (a["package"] && this.define(a["package"], a.options), this.create(a.enums), this.reset());
                        a.services && (a["package"] && this.define(a["package"], a.options), this.create(a.services), this.reset());
                        a["extends"] && (a["package"] &&
                            this.define(a["package"], a.options), this.create(a["extends"]), this.reset());
                        return this
                    };
                k.isValidService = function(a) {
                    return "string" === typeof a.name && b.NAME.test(a.name) && "object" === typeof a.rpc ? !0 : !1
                };
                k.isValidExtend = function(a) {
                    if ("string" !== typeof a.ref || !b.TYPEREF.test(a.name)) return !1;
                    var d;
                    if ("undefined" !== typeof a.fields) {
                        if (!c.Util.isArray(a.fields)) return !1;
                        var e = [],
                            g;
                        for (d = 0; d < a.fields.length; d++) {
                            if (!k.isValidMessageField(a.fields[d])) return !1;
                            g = parseInt(a.id, 10);
                            if (0 <= e.indexOf(g)) return !1;
                            e.push(g)
                        }
                    }
                    return !0
                };
                k.prototype.resolveAll = function() {
                    var a;
                    if (null != this.ptr && "object" !== typeof this.ptr.type) {
                        if (this.ptr instanceof g.Namespace) {
                            a = this.ptr.getChildren();
                            for (var d = 0; d < a.length; d++) this.ptr = a[d], this.resolveAll()
                        } else if (this.ptr instanceof g.Message.Field)
                            if (b.TYPE.test(this.ptr.type)) this.ptr.type = c.TYPES[this.ptr.type];
                            else {
                                if (!b.TYPEREF.test(this.ptr.type)) throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                                a = this.ptr.parent.resolve(this.ptr.type, !0);
                                if (!a) throw Error("Unresolvable type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                                this.ptr.resolvedType = a;
                                if (a instanceof g.Enum) this.ptr.type = c.TYPES["enum"];
                                else if (a instanceof g.Message) this.ptr.type = c.TYPES.message;
                                else throw Error("Illegal type reference in " + this.ptr.toString(!0) + ": " + this.ptr.type);
                            }
                        else if (!(this.ptr instanceof c.Reflect.Enum.Value))
                            if (this.ptr instanceof c.Reflect.Service.Method)
                                if (this.ptr instanceof c.Reflect.Service.RPCMethod) {
                                    a = this.ptr.parent.resolve(this.ptr.requestName);
                                    if (!(a && a instanceof c.Reflect.Message)) throw Error("Illegal request type reference in " + this.ptr.toString(!0) + ": " + this.ptr.requestName);
                                    this.ptr.resolvedRequestType = a;
                                    a = this.ptr.parent.resolve(this.ptr.responseName);
                                    if (!(a && a instanceof c.Reflect.Message)) throw Error("Illegal response type reference in " + this.ptr.toString(!0) + ": " + this.ptr.responseName);
                                    this.ptr.resolvedResponseType = a
                                } else throw Error("Illegal service method type in " + this.ptr.toString(!0));
                        else throw Error("Illegal object type in namespace: " +
                            typeof this.ptr + ":" + this.ptr);
                        this.reset()
                    }
                };
                k.prototype.build = function(a) {
                    this.reset();
                    this.resolved || (this.resolveAll(), this.resolved = !0, this.result = null);
                    null == this.result && (this.result = this.ns.build());
                    if (a) {
                        a = a.split(".");
                        for (var b = this.result, c = 0; c < a.length; c++)
                            if (b[a[c]]) b = b[a[c]];
                            else {
                                b = null;
                                break
                            }
                        return b
                    }
                    return this.result
                };
                k.prototype.lookup = function(a) {
                    return a ? this.ns.resolve(a) : this.ns
                };
                k.prototype.toString = function() {
                    return "Builder"
                };
                k.Message = function() {};
                k.Service = function() {};
                return k
            }(g,
                g.Lang, g.Reflect);
        g.loadProto = function(c, b, l) {
            if ("string" == typeof b || b && "string" === typeof b.file && "string" === typeof b.root) l = b, b = null;
            return g.loadJson((new g.DotProto.Parser(c + "")).parse(), b, l)
        };
        g.protoFromString = g.loadProto;
        g.loadProtoFile = function(c, b, l) {
            b && "object" === typeof b ? (l = b, b = null) : b && "function" === typeof b || (b = null);
            if (b) g.Util.fetch("object" === typeof c ? c.root + "/" + c.file : c, function(a) {
                b(g.loadProto(a, l, c))
            });
            else {
                var k = g.Util.fetch("object" === typeof c ? c.root + "/" + c.file : c);
                return null !==
                    k ? g.protoFromString(k, l, c) : null
            }
        };
        g.protoFromFile = g.loadProtoFile;
        g.newBuilder = function(c, b) {
            var l = new g.Builder;
            "undefined" !== typeof c && null !== c && l.define(c, b);
            return l
        };
        g.loadJson = function(c, b, l) {
            if ("string" === typeof b || b && "string" === typeof b.file && "string" === typeof b.root) l = b, b = null;
            b && "object" === typeof b || (b = g.newBuilder());
            "string" === typeof c && (c = JSON.parse(c));
            b["import"](c, l);
            b.resolveAll();
            b.build();
            return b
        };
        g.loadJsonFile = function(c, b, l) {
            b && "object" === typeof b ? (l = b, b = null) : b && "function" ===
                typeof b || (b = null);
            if (b) g.Util.fetch("object" === typeof c ? c.root + "/" + c.file : c, function(a) {
                try {
                    b(g.loadJson(JSON.parse(a), l, c))
                } catch (d) {
                    b(d)
                }
            });
            else {
                var k = g.Util.fetch("object" === typeof c ? c.root + "/" + c.file : c);
                return null !== k ? g.loadJson(JSON.parse(k), l, c) : null
            }
        };
        return g
    }
    "undefined" != typeof module && module.exports ? module.exports = s(require("bytebuffer")) : "undefined" != typeof define && define.amd ? define("ProtoBuf", ["ByteBuffer"], s) : (r.dcodeIO || (r.dcodeIO = {}), r.dcodeIO.ProtoBuf = s(r.dcodeIO.ByteBuffer))
})(this);
