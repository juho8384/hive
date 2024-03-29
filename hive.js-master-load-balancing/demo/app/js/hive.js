var Transport = {};
Transport.MsgTypes = {
    Have: 1,
    Fragment: 2,
    Request: 3,
    Cancel: 4,
    Ping: 5,
    Pong: 6,
    Ack: 7,
    Close: 8
}, Transport.ChunkSize = 64e3, Transport.TimeOut = 5e3;
var Overlay = {};
Overlay.Choking = 3e4, Overlay.MaxPartners = 10;
var Discovery = {},
    service;
service = "https:" === location.protocol ? "wss://" + document.location.host + "/hive" : "ws://" + document.location.host + "/hive";
var ByteBuffer = dcodeIO.ByteBuffer,
    ProtoBuf = dcodeIO.ProtoBuf,
    protoFile = ProtoBuf.loadProtoFile("app/proto/hive-messages.proto"),
    Response = protoFile.build("Response"),
    Have = protoFile.build("Have"),
    Request = protoFile.build("Request"),
    Ping = protoFile.build("Ping"),
    Pong = protoFile.build("Pong"),
    Ack = protoFile.build("Ack"),
    Cancel = protoFile.build("Cancel"),
    Close = protoFile.build("Close");
Counter = function() {
    var a = 0;
    this.next = function() {
        return a += 1
    }
};

var fragmentLimit = 300;
var debugPram = 1;
$(document).ready(function(){
    $("#debugOn").on("click", function() {
        debugPram = 1;
        alert("debugOn");
    });
    $("#debugOff").on("click", function() {
        debugPram = 0;
        alert("debugOff");
	Discovery.stopping();
    });
});

var FragmentCounter = new Counter,
    Log = {};
Log.error = function(a) {
    console.error("ERROR", a)
}, Log.info = function(a) {
    console.log.apply(console, a)
};
var Fragment = function(a, b) {
        this.request = a, this.data = b
    },
    Utils = {};
Utils.genFragmentId = function(a, b) {
    return b ? a + "-" + b : a
}, Utils.appendBuffer = function(a, b) {
    var c = new Uint8Array(a.byteLength + b.byteLength);
    return c.set(new Uint8Array(a), 0), c.set(new Uint8Array(b), a.byteLength), c.buffer
}, Utils.removeArrayItem = function(a, b) {
    for (var c in a)
        if (a[c] === b) {
            a.splice(c, 1);
            break
        }
}, UUID = function() {
    var a = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
        var b = 16 * Math.random() | 0,
            c = "x" == a ? b : 3 & b | 8;
        return c.toString(16)
    });
    return a
}, Utils.getParameterByName = function(a) {
    a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var b = new RegExp("[\\?&]" + a + "=([^&#]*)"),
        c = b.exec(location.search);
    return null == c ? "" : decodeURIComponent(c[1].replace(/\+/g, " "))
}, $(function() {
    console.info("Initializing autoplay: ", location.search), video = $("#player"), context = new Hive.gen.HiveContext, player = new MediaPlayer(context), player.startup(), player.setAutoPlay(!0), player.attachSource("http://dash.edgesuite.net/dash264/TestCases/1a/netflix/exMPD_BIP_TC1.mpd"), player.attachView(video)
}), Channel = function(a, b, c) {
    var d = {};
    d.guid, d.channelOptions = b, d.candidates = [], d.label = a, d.ice = c, d.pc = null, d.channel = null, d.remotePeer = null, d.p2pTransport = new P2PTransport(d), d.connectTimer = null, d.connectRetries = 15;
    var e = 1e3,
        f = function() {
            d.pc = new RTCPeerConnection(d.ice, d.channelOptions), d.pc.onicecandidate = function(a) {
                a.candidate && d.candidates.push(a.candidate), "complete" == a.target.iceGatheringState && Discovery.updateICE(Peer.guid, d, d.candidates).then(function() {
                    d.candidates = []
                }).catch(Log.error)
            }, d.pc.oniceconnectionstatechange = function(a) {
                "disconnected" == a.target.iceConnectionState && d.close()
            }, d.pc.onsignalingstatechange = function(a) {
                "closed" == a.signalingState && d.close()
            }
        };
    d.checkConnection = function() {
        return console.debug("Check connection", d), d.connectRetries <= 0 ? (console.warn("Closing channel since it couldnt be established: " + d.label), void d.close()) : void(d.channel && "open" != d.channel.readyState && (d.connectRetries -= 1, d.connectTimer = setTimeout(d.checkConnection, e)))
    }, d.close = function() {
        Peer.closeConnection(d), d.pc && "closed" != d.pc.signalingState && d.pc.close(), d.channel && d.channel.close()
    }, d.isConnecting = function() {
        return d.channel ? "connecting" === d.channel.readyState : !1
    }, d.connect = function(a) {
        console.log(d.label, " connecting to ", a), d.remotePeer = a, f(), d.channel = d.pc.createDataChannel(d.label);
        var b = g();
        return d.connectTimer = setTimeout(d.checkConnection, e), createOffer().then(setLocal).then(function(b) {
            return Peer.initOffer(a, d, b)
        }).catch(console.error), b
    }, setRemote = function(a) {
        return new Promise(function(b, c) {
            d.pc.setRemoteDescription(a, function() {
                b()
            }, c)
        })
    }, setLocal = function(a) {
        return new Promise(function(b, c) {
            d.pc.setLocalDescription(a, function() {
                b(d.pc.localDescription)
            }, c)
        })
    }, createOffer = function() {
        return new Promise(function(a) {
            d.pc.createOffer(a, Log.error)
        })
    }, createAnswer = function() {
        return new Promise(function(a, b) {
            d.pc.createAnswer(a, b)
        })
    }, d.offer = function(a) {
        f(), d.pc.ondatachannel = function(a) {
            d.channel = a.channel, g()
        };
        var b = new RTCSessionDescription(a.channel.offer);
        console.log("Channel ", d.label, " received an offer", a, "created sdp", b), d.remotePeer = a.peer.guid, setRemote(b).then(createAnswer).then(setLocal).then(function(a) {
            Discovery.answer(Peer, d, a)
        }).then(function() {
            var b = a.channel.ice_candidates;
            for (var c in b) {
                var e = new RTCIceCandidate(b[c]);
                d.pc.addIceCandidate(e)
            }
        }).catch(console.error)
    }, d.answer = function(a) {
        var b = new RTCSessionDescription(a.answer);
        setRemote(b).catch(console.error)
    }, d.update_ice_candidates = function(a) {
        var b = a.channel.ice_candidates;
        for (var c in b) {
            var e = new RTCIceCandidate(b[c]);
            d.pc.addIceCandidate(e)
        }
    };
    var g = function() {
        var a = new Promise(function(a, b) {
            d.channel.onopen = function() {
                a(d), Peer.sendAllHaves(d.remotePeer)
            }, d.channel.onclose = function() {
                d.close(), b(d)
            }
        });
        return d.channel.onmessage = function(a) {
            d.p2pTransport.receiveMessage(a)
        }, d.channel.onerror = function(a) {
            console.error("-- WebRTC channel error", a)
        }, a
    };
    return d
}, Discovery = function() {
    var a = {},
        b = {},
        c = {},
        d = new Counter;
    b.peers = {}, b.init = function() {
        a = new WebSocket(service);
        var b = new Promise(function(b) {
            a.onopen = function(a) {
                console.log("Discovery service connection is ready.", a), b(a)
            }
        });
        return a.onclose = function() {
            console.error("Discovery service connection closed.")
        }, a.onerror = function(a) {
            console.error("Discovery service connection error: ", a)
        }, a.onmessage = function(a) {
            var b = JSON.parse(a.data);
            if (b.id) {
                var d = c[b.id];
                d && (delete c[b.id], d(b))
            } else Peer.trigger(b)
        }, b
    }, b.event = function(a, b) {
        return {
            id: d.next(),
            name: a,
            msg: b
        }
    };
    var e = function(b) {
            var d = new Promise(function(d) {
                a.send(JSON.stringify(b)), c[b.id] = d
            });
            return d
        },
        f = function(b) {
            return a.send(JSON.stringify(b)), Promise.resolve()
        };
    return b.echo = function() {
        var a = b.event("echo", {
            hello: "world!"
        });
        return console.log("Sending echo", a), e(a)
    }, b.all_peers = function() {
        var a = b.event("all_peers", {});
        return console.debug("Discovery service asks for all peers"), e(a)
    }, b.register = function(a) {
	    var p2pbytes = Metrics.summary.traffic.p2pSubRespQt || 0,
            srcbytes = Metrics.summary.traffic.srcRespQt || 0;
        var save = p2pbytes / (p2pbytes + srcbytes + 1) * 100;
        var c = b.event("register", {
            guid: a.guid,
	        saving: p2pbytes / (p2pbytes + srcbytes + 1) * 100
        });
        return console.log("Discovery service register peer", c), e(c).then(function(a) {
            peers = a.msg.peers;
            for (var c in peers) b.peers[peers[c]] = !0;
            return peers
        })
    }, b.debugging = function(a) {
        var p2pbytes = Metrics.summary.traffic.p2pSubRespQt || 0,
            srcbytes = Metrics.summary.traffic.srcRespQt || 0;
        var save = p2pbytes / (p2pbytes + srcbytes + 1) * 100;
        var c = b.event("debugging", {
            guid: a.guid,
            saving: p2pbytes / (p2pbytes + srcbytes + 1) * 100,
	    p2pbyte: p2pbytes,
	    scrbyte: srcbytes,
	zBL: BL
        });
        return f(c)
    }, b.stopping = function(){
	var c = b.event("debugging",{
	    guid: "stop",
	    saving: "stop"
	});
	return f(c)
    }, b.updateICE = function(a, c, d) {
        var e = b.event("update_ice", {
            guid: a,
            channel: c.label,
            candidates: d
        });
        return f(e)
    }, b.offer = function(a, c, d, e) {
        var g = b.event("offer", {
            guid: a,
            offer_to_guid: c,
            channel: d.label,
            candidates: [],
            offer: e
        });
        return f(g)
    }, b.rejectOffer = function(a, c, d) {
        console.log("Discovery service rejects offer from peer", c);
        var e = b.event("reject_offer", {
            guid: a,
            offer_from_guid: c,
            channel: d
        });
        return f(e)
    }, b.answer = function(a, c, d) {
        console.log("Sending back an answer: ", a, c, d);
        var e = b.event("answer", {
            guid: a.guid,
            channel: c.label,
            answer: d
        });
        return f(e)
    }, b
}(), FragmentCache = function() {
    var a = {};
        a.fragmentNum = 0;
        a.fragmentNum2 = 0;
    return a.idx = {}, a.putFragment = function(b, c) {
        var d = Utils.genFragmentId(b.url, b.range),
            e = new Fragment(b, c);
            console.log("**put fragment :" + a.fragmentNum);
            if(a.fragmentNum >= fragmentLimit){
                console.log("**too much fragment")
                delete a.idx[Object.keys(a.idx)[0]];
                a.fragmentNum -= 1;
            }
            a.fragmentNum += 1;
            a.fragmentNum2 += 1;
            a.idx[d] = e;
        return d;
    }, a.getFragment = function(b) {
        return a.idx[b]
    }, a.contains = function(b) {
        return b in a.idx
    }, a.getKeys = function() {
        var b = [];
        for (var c in a.idx) b.push(c);
        return b
    }, a
}(), Hive = function() {
    "use strict";
    return {
        p2p: {},
        gen: {}
    }
}(), Hive.gen.HiveContext = function() {
    "use strict";
    return {
        system: void 0,
        setup: function() {
            this.system.autoMapOutlets = !0, Hive.gen.HiveContext.prototype.setup.call(this), console.debug("HIVE Context Loaded"), this.system.mapClass("fragmentLoader", Hive.p2p.HiveFragmentLoader)
        }
    }
}, Hive.gen.HiveContext.prototype = new Dash.di.DashContext, Hive.gen.HiveContext.prototype.constructor = Hive.gen.HiveContext, Hive.p2p.HiveFragmentLoader = function() {
    "use strict";
    var a = 500,
        b = [],
        c = {},
        d = function() {
            var a = this;
            if (b.length > 0) {
                var c = b.shift();
                c.requestStartDate = new Date, c.firstByteDate = c.requestStartDate;
                var f = Utils.genFragmentId(c.url, c.range);
                ObjectIndex.contains(f) ? e(a, c, f) : i(a, c), d.call(a)
            }
        },
        e = function(a, b, d) {
            console.debug("FRL ISSUE REQ FOR FRAGMENT " + d + " TO P2P ");
            var e = new P2PRequest;
            e.transferId = FragmentCounter.next(), e.fragmentId = d, e.requestedTs = new Date, c[e.transferId] = e, e.onLoad = function() {
                Metrics.increase("traffic", "reqN", 1), b.firstByteDate = new Date
            }, e.onComplete = function(d, e) {
                console.debug("FRL PROMISED FRAGMENT " + d + " RETURNED");
                var g = e.toArrayBuffer();
                Metrics.increase("traffic", "p2pSubReqN", 1), Metrics.increase("traffic", "p2pSubRespN", 1), Metrics.increase("traffic", "p2pSubRespQt", g.byteLength), h(a, b, g, 200, "p2p"), f(b, g), console.debug("FRL GOT " + d + " " + g.byteLength), delete c[b], b = null
            }, e.onError = function(d) {
                console.error("FRL FAILED TO DOWN FROM P2P " + d + " FOR " + b), Metrics.increase("traffic", "p2pSubReqN", 1), Metrics.increase("traffic", "p2pSubRespErrN", 1), console.warn("FRL P2P FAILED FOR " + b.url + " SEND TO FALLBACK"), delete c[b], i(a, b)
            }, Peer.sendRequest(e)
        },
        f = function(a, b, c) {
            if (a.deferred.resolve({
                    data: b,
                    request: a
                }), "Initialization Segment" !== a.type) {
                var e = FragmentCache.putFragment(a, b);
                Peer.sendHaves(e)
            }
            d.call(c), a.deferred = null, a = null
        },
        g = function(a, b, c, d, e) {
            var f = null;
            b.requestEndDate = new Date;
            var g = b.firstByteDate.getTime() - b.requestStartDate.getTime(),
                h = b.requestEndDate.getTime() - b.firstByteDate.getTime(),
                i = b.requestEndDate.getTime() - b.requestStartDate.getTime(),
                j = Utils.genFragmentId(b.url, b.range),
                k = 0;
            null != c && (k = c.byteLength), console.debug("FRL SEGMENT LOADED: ( " + g + " ms, " + h + " ms, " + i + " ms, " + k + " bytes, " + b.type + " " + e + " ) " + j + " BY " + Peer.guid);
            var l = [g, h, i, k, e, b.type, b.streamType, b.quality, b.index, j, Peer.guid, _.size(Peer.connections), Peer.targetPeerCount];
            console.debug("SEGMENT STATS " + l.join(","));
            var m = d;
            return null === m && (m = 200), f = a.metricsModel.addHttpRequest(b.streamType, null, b.type, b.url, null, b.range, b.requestStartDate, b.firstByteDate, b.requestEndDate, m, null, b.duration)
        },
        h = function(a, b, c, d, e) {
            var f = g(a, b, c, d, e);
            a.metricsModel.appendHttpTrace(f, b.requestEndDate.getTime(), (new Date).getTime() - b.requestEndDate.getTime(), [c.byteLength])
        },
        i = function(b, c, d) {
            var e = new XMLHttpRequest,
                g = !0,
                k = !1;
            "Initialization Segment" !== c.type && Metrics.increase("traffic", "reqN", 1), e.open("GET", c.url, !0);
            var l = Utils.genFragmentId(c.url, c.range);
            console.debug("FRL ISSUE REQ FOR FRAGMENT " + l + " TO FALLBACK "), e.responseType = "arraybuffer", c.range && e.setRequestHeader("Range", "bytes=" + c.range), e.onprogress = function(a) {
                g && (g = !1, (!a.lengthComputable || a.lengthComputable && a.total != a.loaded) && (c.firstByteDate = new Date))
            }, e.onload = function() {
                if (e.status < 200 || e.status > 299) return void console.debug("FRL SERVER RETURNED ERROR CODE " + e.status);
                k = !0, c.requestEndDate = new Date;
                var a = e.response;
                "Initialization Segment" !== c.type && (Metrics.increase("traffic", "srcRespN", 1), Metrics.increase("traffic", "srcRespQt", a.byteLength), Metrics.increase("traffic", "srcReqN", 1)), h(b, c, a, e.status, "src"), f(c, a, b), e = null
            }, e.onloadend = e.onerror = function() {
                k || ("Initialization Segment" !== c.type && (Metrics.increase("traffic", "srcReqN", 1), Metrics.increase("traffic", "srcRespErrN", 1)), console.debug("FRL CANNOT RETRIEVE " + c.url), d > 0 ? (b.debug.log("FRL Failed loading segment: " + c.streamType + ":" + c.type + ":" + c.startTime + ", retry in " + a + "ms attempts: " + d), d--, setTimeout(function() {
                    i(b, c, d)
                }, a)) : (b.debug.log("FRL Failed loading segment: " + c.streamType + ":" + c.type + ":" + c.startTime + " no retry attempts left"), b.errHandler.downloadError("content", c.url, e), j(b, c, e.status, "Error loading fragment.", "src")))
            }, e.send()
        },
        j = function(a, b, c, e, f) {
            g(a, b, null, c, f + "_error"), b.deferred.reject(e), d.call(a)
        },
        k = function(a, b) {
            var c = new XMLHttpRequest,
                d = !1,
                e = this;
            c.open("HEAD", a.url, !0), console.debug("FRL CHECKING FOR EXISTENCE OF " + a.url), c.onload = function() {
                c.status < 200 || c.status > 299 || (d = !0, console.debug("FRL EXISTENCE CONFIRMED FOR " + a.url), a.deferred.resolve(a))
            }, c.onloadend = c.onerror = function() {
                d || (b > 0 ? (console.debug("FRL DOES NOT EXIST, RETRY " + a.url), b--, setTimeout(function() {
                    k.call(e, a, b)
                }, 3)) : (console.debug("FRL DOES NOT EXIST, GIVE UP " + a.url), a.deferred.reject(c)))
            }, c.send()
        };
    return {
        metricsModel: void 0,
        errHandler: void 0,
        debug: void 0,
        load: function(a) {
            return console.info("FRL ADD REQ"), a ? (a.deferred = Q.defer(), b.push(a), d.call(this, a), a.deferred.promise) : Q.when(null)
        },
        checkForExistence: function(a) {
            return a ? (a.deferred = Q.defer(), k.call(this, a, 3), a.deferred.promise) : Q.when(null)
        },
        abort: function() {
            console.debug("FRL ABORT CALLED");
            for (var a in self.pendingP2PRequests) {
                var c = self.pendingP2PRequests[a];
                Peer.cancelRequest(c), delete self.pendingP2PRequests[a]
            }
            b = []
        }
    }
}, Hive.p2p.HiveFragmentLoader.prototype = new MediaPlayer.dependencies.FragmentLoader, Hive.p2p.HiveFragmentLoader.prototype.constructor = Hive.p2p.HiveFragmentLoader, $(function() {
    jQuery.support.cors = !0, "" != Utils.getParameterByName("disable_haves") && (Peer.isSendHaves = !1);
    var a = Utils.getParameterByName("max_partners");
    "" != a && (Peer.targetPeerCount = parseInt(a)), console.debug("Peer: ", Peer), Discovery.init().then(function() {
        return Peer.init()
    }).then(function(a) {
        console.log("Register done, connected peers", a)
    }).catch(console.error), $("#peer-guid").html(Peer.guid)
}), console.logCopy = console.log.bind(console), console.log = function() {
    if (arguments.length) {
        var a = arguments;
        a[0] = (new Date).toJSON() + " " + arguments[0];
        for (var b = 1; b < a.length; b++) try {
            a[b] = JSON.stringify(a[b])
        } catch (c) {}
        console.logCopy.apply(this, a)
    }
}, console.debugCopy = console.debug.bind(console), console.debug = function() {
    if (arguments.length) {
        var a = arguments;
        a[0] = (new Date).toJSON() + " " + arguments[0];
        for (var b = 1; b < a.length; b++) try {
            a[b] = JSON.stringify(a[b])
        } catch (c) {}
        console.debugCopy.apply(this, a)
    }
}, Message = function() {
    this.msgId, this.length, this.hash, this.rcvMesgData = null, this.onLoad = function() {}
};
var Metrics = function() {
    self = {};
    var a = ["reqN", "srcReqN", "srcRespN", "srcRespErrN", "srcRespQt", "p2pSubReqN", "p2pSubRespN", "p2pSubRespErrN", "p2pSubRespQt", "p2pAgenTrafficSuccessQt"],
        b = ["videoBufN", "audioBufN"],
        c = ["videoAvgBufQt", "audioAvgBufQt"];
    return self.startTs = (new Date).toISOString().slice(0, 10), self.summary = {}, self.summary.traffic = {}, self.summary.metrics = {}, self.snapshot = {}, self.snapshot.eventId = {
        partnerId: "9001",
        customerId: "hive-browser",
        contentId: null
    }, self.snapshot.streamInfo = {}, self.metricGauges = {}, self.reset = function() {
        self.snapshot.metrics = {}, self.snapshot.traffic = {}, self.snapshot.traffic.total = {};
        for (var d in a) self.snapshot.traffic.total[a[d]] = 0;
        for (var d in b) self.snapshot.metrics[b[d]] = 0;
        for (var d in c) self.metricGauges[c[d]] = []
    }, self.reset(), self.increase = function(a, b, c) {
        if ("traffic" == a) {
            var d = self.snapshot.traffic.total[b] || 0;
            self.snapshot.traffic.total[b] = d + c;
            var e = self.summary.traffic[b] || 0;
            self.summary.traffic[b] = e + c
        } else if ("metrics" == a) {
            var d = self.snapshot.metrics[b] || 0;
            self.snapshot.metrics[b] = d + c
        } else console.warn("Invalid metric type", a, b);
        self.renderSummary()
    }, self.record = function(a, b, c) {
        "metrics" == a ? self.metricGauges[b].push(c) : console.warn("Invalid gauge type", a, b)
    }, self.renderSummary = function() {
        var a = $("#metrics-summary");
        a.empty();
        var b = self.summary.traffic.p2pSubRespQt || 0,
            c = self.summary.traffic.srcRespQt || 0;
        a.append("<tr>           <td>Source</td>           <td>" + self.summary.traffic.srcReqN + "/" + self.summary.traffic.srcRespN + "</td>           <td>" + self.summary.traffic.srcRespQt + "</td>           <td>" + self.summary.traffic.srcRespErrN + "</td>           </tr>"), a.append("<tr>           <td>P2P</td>           <td>" + self.summary.traffic.p2pSubReqN + "/" + self.summary.traffic.p2pSubRespN + "</td>           <td>" + self.summary.traffic.p2pSubRespQt + "</td>           <td>" + self.summary.traffic.p2pSubRespErrN + "</td>           </tr>");
        var d = b / (c + b) * 100;
        $("#metrics-savings").html(d.toFixed(2))
    }, self
}();
ObjectIndex = function() {
    var a = {};
    return a.idx = {}, a.put = function(b, c) {
        a.contains(b) || (a.idx[b] = []), a.idx[b].push(c)
    }, a.getPartners = function(b) {
        return a.idx[b]
    }, a.contains = function(b) {
        return b in a.idx
    }, a.removePeer = function(b) {
        for (var c in a.idx) {
            var d = a.idx[c];
            Utils.removeArrayItem(d, b), 0 === d.length && delete a.idx[c]
        }
    }, a
}(), P2PRequest = function() {
    var a = this;
    a.fragmentId, a.requestedTs, a.fragmentData, a.transferId, a.timerId, a.channel, a.onComplete = function() {}, a.onError = function() {}
}, P2PRequest.prototype = new Message, P2PRequest.prototype.constructor = P2PRequest, P2PResponse = function() {
    var a = {};
    return a.fragmentId, a.msgId, a.dataToSend, a.dataToSendLength, a.chunkNums, a.sentAlready, a.transferId, a
}, P2PTransport = function(a) {
    var b = {};
    return b.channel = a, b.pendingRequests = {}, b.inMsg = null, b.outMsg = null, b.pendingOutRequests = [], b.sendHave = function(a) {
        console.debug("SEND HAVE TO " + b.channel.remotePeer + " FOR " + a);
        var c = new Have(a);
        b.sendMessage(Transport.MsgTypes.Have, c)
    },  b.sendPing = function(fragmentId) {
        console.debug("**send ping");
        var ping = new Ping(fragmentId);
        b.sendMessage(Transport.MsgTypes.Ping,ping);
    },  b.sendPong = function(fragmentId){
        console.debug("**send pong");
        var pong = new Pong(fragmentId);
        b.sendMessage(Transport.MsgTypes.Pong,pong);
    },  b.sendClose = function() {
        console.debug("SEND CLOSE TO " + b.channel.remotePeer);
        var a = new Close;
        b.sendMessage(Transport.MsgTypes.Close, a)
    }, b.sendRequest = function(a) {
        var c = a.fragmentId,
            d = a.transferId,
            e = new Request(c, d);
        a.timerId = setTimeout(function() {
            b.requestTimedout(d)
        }, Transport.TimeOut), console.info("INITIATING TR-" + d + " WITH TO " + Transport.TimeOut + " FOR FRAGMENT " + c), b.pendingRequests[d] = a, b.sendMessage(Transport.MsgTypes.Request, e)
    }, b.inUse = function() {
        return 0 === b.pendingOutRequests.length && null === b.outMsg && 0 === Object.keys(b.pendingRequests).length && null === b.inMsg ? !1 : !0
    }, b.stopTransfer = function(a, c) {
        if (a in b.pendingRequests) {
            var d = new Cancel(a);
            b.sendMessage(Transport.MsgTypes.Cancel, d);
            var e = b.pendingRequests[a];
            e.onError(c), null !== b.inMsg && b.inMsg.transferId === a && (b.inMsg = null), delete b.pendingRequests[a]
        } else console.warn("CLEAN UP NOT PENDING " + a)
    }, b.requestTimedout = function(a) {
        console.info("TIMED OUT " + a), b.stopTransfer(a, "TIMED OUT")
    }, b.sendFragment = function(a, c, d) {
        console.info("SEND FRAGMENT " + a + " TO " + b.channel.label);
        var e = new Response(a, c, d);
        b.pendingOutRequests.push(e), null === b.outMsg && b.sendFragmentChunks()
    }, b.sendAck = function(a) {
        var c = new Ack(a);
        b.sendMessage(Transport.MsgTypes.Ack, c)
    }, b.sendFragmentChunks = function() {
        try {
            if (null === b.outMsg)
                if (0 !== b.pendingOutRequests.length) {
                    var a = b.pendingOutRequests.shift();
                    console.debug("START SENDING " + a.fragmentId);
                    var c = a.encode(),
                        d = c.toArrayBuffer(),
                        e = d.byteLength,
                        f = CryptoJS.lib.WordArray.create(d),
                        g = CryptoJS.MD5(f),
                        h = a.transferId,
                        i = new ByteBuffer;
                    i.writeByte(Transport.MsgTypes.Fragment), i.writeInt(h), i.writeInt(e), i.writeLString(g.toString()), i.append(c), b.outMsg = new P2PResponse, b.outMsg.transferId = h, b.outMsg.msgId = a.fragmentId, b.outMsg.dataToSend = i.toArrayBuffer(), b.outMsg.dataToSendLength = b.outMsg.dataToSend.byteLength, b.outMsg.chunkNums = Math.ceil(b.outMsg.dataToSendLength / Transport.ChunkSize), b.outMsg.sentAlready = 0, console.debug("DATA TO SEND LENGTH " + b.outMsg.dataToSendLength + " IN " + b.outMsg.chunkNums + " CHUNKS WITH TR-" + b.outMsg.transferId), b.sendChunks(!0)
                } else console.info("NO MORE FRAGMENTS TO SEND")
        } catch (j) {
            console.error(j), b.resetSendState()
        }
    }, b.resetSendState = function() {
        b.outMsg = null
    }, b.sendChunks = function(a) {
        try {
            if (null !== b.outMsg)
                if (0 === b.outMsg.chunkNums) console.debug("FINISHED SENDING " + b.outMsg.msgId), b.outMsg = null, b.sendFragmentChunks();
                else {
                    var c = Math.min(b.outMsg.sentAlready + Transport.ChunkSize, b.outMsg.dataToSendLength),
                        d = new ByteBuffer;
                    a || d.writeInt(b.outMsg.transferId);
                    var e = b.outMsg.dataToSend.slice(b.outMsg.sentAlready, c);
                    d.append(e), b.outMsg.sentAlready = b.outMsg.sentAlready + (c - b.outMsg.sentAlready), b.channel.channel.send(d.toArrayBuffer()), b.outMsg.chunkNums--
                }
            else console.debug("NO MESSAGE TO SEND")
        } catch (f) {
            b.resetSendState()
        }
    }, b.sendMessage = function(a, c) {
        try {
            var d = b.channel.channel,
                e = c.encode(),
                f = e.toArrayBuffer(),
                g = f.byteLength,
                h = CryptoJS.lib.WordArray.create(f),
                i = CryptoJS.MD5(h),
                j = new ByteBuffer;
            j.writeByte(a), j.writeInt(g), j.writeLString(i.toString()), j.append(e);
            var k = j.toArrayBuffer();
            d.send(k)
        } catch (l) {
            console.error(l)
        }
    }, b.receiveMessage = function(a) {
        var c = a.data,
            d = b.inMsg;
        try {
            if (null === d) {
                var e = ByteBuffer.wrap(c),
                    f = e.readByte();
                if (f === Transport.MsgTypes.Fragment) {
                    var g = e.readInt();
                    if (!(g in b.pendingRequests)) return void console.debug("Received chunk of not existing transfer id " + g);
                    console.debug("INITIATED TR-" + g), d = b.inMsg = b.pendingRequests[g], d.transferId = g
                } else {
                    if (!(f <= Transport.MsgTypes.Ack)) return console.debug("MSG OF WRONG ID RECEIVED "), void(b.inMsg = null);
                    d = b.inMsg = new Message
                }
                d.msgId = f, d.length = e.readInt(), d.hash = e.readLString(), d.rcvMesgData = e.toArrayBuffer(), d.onLoad(d.rcvMesgData)
            } else {
                if (d.msgId === Transport.MsgTypes.Fragment) {
                    var e = new ByteBuffer.wrap(c),
                        g = e.readInt();
                    if (g !== d.transferId) return void console.debug("RCV CHUNK OF WRONG TR-" + g);
                    c = e.toArrayBuffer()
                }
                d.rcvMesgData = Utils.appendBuffer(d.rcvMesgData, c)
            }
            if (d.msgId === Transport.MsgTypes.Fragment && b.sendAck(d.transferId), d.rcvMesgData.byteLength === d.length) {
                clearTimeout(d.timerId);
                var h = CryptoJS.lib.WordArray.create(d.rcvMesgData),
                    i = CryptoJS.MD5(h);
                if (i.toString() !== d.hash) {
                    var j = " INTEGRITY FAILED ";
                    console.warn(j), b.fragmentDownloadError(j)
                } else d.msgId === Transport.MsgTypes.Fragment && console.debug("RCV ALL DATA " + d.rcvMesgData.byteLength + " TR-" + d.transferId), b.deliverMessage(d), b.inMsg = null
            }
        } catch (j) {
            console.error("ERROR RECEIVING MESSAGE ", j), b.inMsg = null
        }
    }, b.deliverMessage = function(c) {
        switch (c.msgId) {
            case Transport.MsgTypes.Fragment:
                var d = Response.decode(c.rcvMesgData);
                c.fragmentData = d.data, delete b.pendingRequests[c.transferId], Peer.deliverFragment(c);
                break;
            case Transport.MsgTypes.Ack:
                var e = Ack.decode(c.rcvMesgData);
                null !== b.outMsg && b.outMsg.transferId.toString() === e.transferId.toString() ? b.sendChunks() : console.warn("RECEIVED ACK FOR UNKNOWN TR-" + e.transferId);
                break;
            case Transport.MsgTypes.Ping:
                    var ping = Ping.decode(c.rcvMesgData);
                    console.debug("**receive ping" + ping);
                    b.sendPong(ping.fragmentId);
                break;
            case Transport.MsgTypes.Pong:
                    var pong = Pong.decode(c.rcvMesgData);
                    console.debug("**receive pong" + pong);
                    if(Peer.pendingPing[pong.fragmentId]){
                        console.debug("** pendingPing exist " + Peer.pendingPing[pong.fragmentId]);
                        var pp = Peer.pendingPing[pong.fragmentId];
                        delete Peer.pendingPing[pong.fragmentId];
                        console.debug("** guid to send request" + b.channel.remotePeer);
                        pp(b.channel.remotePeer);
                    }
                break;            
            case Transport.MsgTypes.Cancel:
                var f = Cancel.decode(c.rcvMesgData);
                null != b.outMsg && b.outMsg.transferId === f.transferId ? (console.debug("GOT CANCEL FOR ONGOING TR-" + f.transferId), console.debug("TRANSPORT CANCEL STATS " + Peer.guid + "," + a.remotePeer + "," + f.transferId), b.outMsg = null, b.sendFragmentChunks()) : b.pendingOutRequests = _.filter(b.pendingOutRequests, function(a) {
                    a.transferId !== f.transferId
                });
                break;
            case Transport.MsgTypes.Have:
                var g = Have.decode(c.rcvMesgData);
                console.debug("RECEIVED HAVE FOR " + g.fragmentId + " FROM " + a.remotePeer), ObjectIndex.put(g.fragmentId, a.remotePeer);
                break;
            case Transport.MsgTypes.Close:
                {
                    Close.decode(c.rcvMesgData)
                }
                console.debug("RECEIVED CLOSE FROM " + a.remotePeer), Peer.closeConnection(a);
                break;
            case Transport.MsgTypes.Request:
                var h = Request.decode(c.rcvMesgData);
                if (console.debug("RECEIVED REQUEST FOR " + h.fragmentId + " FROM " + a.remotePeer), FragmentCache.contains(h.fragmentId)) {
                    var d = FragmentCache.getFragment(h.fragmentId);
                    b.sendFragment(h.fragmentId, h.transferId, d.data), console.debug("TRANSPORT REQUEST STATS " + Peer.guid + "," + a.remotePeer + "," + h.fragmentId + "," + h.transferId + "," + d.data.byteLength)
                }
                break;
            default:
                console.warn("UNKNOWN MESSAGE TYPE " + c.msgId)
        }
        c.rcvMesgData = null
    }, b.fragmentDownloadError = function(a) {
        if (null !== b.inMsg && b.inMsg.transferId in b.pendingOutRequests) {
            var c = b.pendingOutRequests[b.inMsg.transferId];
            c.onError(a), delete b.pendingOutRequests[b.inMsg.transferId]
        }
    }, b
};
var Peer = function() {
    var a = {},
        b = null;
    a.pendingPing = {},
    a.targetPeerCount = Overlay.MaxPartners, a.counter = new Counter, a.networkChanges = new Counter, a.guid = UUID(), a.channels = {}, a.connections = {}, a.isSendHaves = !0, a.ice = {
        iceServers: [{
            url: "stun:stun.l.google.com:19302"
        }, {
            url: "turn:psm-hive-sig.cloudapp.net:3478",
            username: "hive",
            credential: "hiveturnSecret"
        }]
    };
    var c = function(c, d) {
        var e = new Channel(c, b, a.ice);
        return a.channels[c] = e, a.connections[d] = e, e
    };
    return a.renderPeers = function() {
        var b = $("#peers"),
            c = a.networkChanges.next();
        console.debug("[NetworkUpdate-" + c + "] for " + Peer.guid), console.debug("NETWORK STATS " + Peer.guid + "," + a.targetPeerCount + "," + _.size(a.connections)), b.empty();
        for (var d in a.connections) {
            var e, f = a.connections[d];
            e = null == f.channel ? "unknown" : f.channel.readyState, console.debug("[NetworkUpdate-" + c + "] " + d + ", " + f.pc.signalingState + ", " + e + ", " + f.pc.iceConnectionState + ", " + f.pc.iceGatheringState), b.append("<tr>           <td>" + d + "</td>           <td>" + f.pc.signalingState + "</td>           <td>" + e + "</td>           <td>" + f.pc.iceConnectionState + "</td>           <td>" + f.pc.iceGatheringState + "</td>           </tr>")
        }
    }, a.update = function() {
        return console.log("Update called with ", _.size(a.connections), " existing peers, target: ", a.targetPeerCount, a.connections), a.renderPeers(), _.size(a.connections) < a.targetPeerCount ? Discovery.register(a).then(function(b) {
            var c = _.filter(b, function(b) {
                    return 0 == _.has(a.connections, b)
                }),
                d = a.targetPeerCount - _.size(a.connections);
            c = c.slice(0, d), console.log("Connect to peers returned by Discovery service: ", c);
            var e = c.reduce(function(b, c) {
                return b.then(function() {
                    return a.connect(c)
                }).catch(function() {
                    return a.connect(c)
                })
            }, Promise.resolve());
            return e
        }) : void 0
    }, a.debugging = function() {
       if (debugPram == 1){
        Discovery.debugging(a);
        }
    }, a.init = function() {
        return setInterval(a.update, 15e3), setInterval(a.debugging, 2e3), setTimeout(function() {
            a.periodicChoking()
        }, Overlay.Choking), a.update()
    }, a.trigger = function(b) {
        var c = b.msg.channel;
        if (console.log(a.guid, "dispatches message: ", b, c, a.channels), c && c.label && a.channels[c.label]) {
            var d = a.channels[c.label],
                e = d[b.name];
            e(b.msg)
        } else {
            var e = a["handle_" + b.name];
            e && e(b.msg)
        }
    }, a.handle_offer = function(b) {
        console.log(a.guid, "received an offer", b);
        var d = a.connections[b.peer],
            e = d && !d.isConnecting(),
            f = d && d.isConnecting() && b.peer < a.guid,
            g = _.size(a.connections) >= a.targetPeerCount || e || f;
        if (g) Discovery.rejectOffer(a.guid, b.peer.guid, b.channel.label);
        else {
            var h = c(b.channel.label, b.peer.guid);
            h.offer(b)
        }
    }, a.handle_offer_rejected = function(b) {
        console.log(a.guid, "remote peer rejected", b);
        var c = a.connections[b.rejected_by];
        c && c.close(), delete a.connections[b.rejected_by], delete a.channels[b.channel]
    }, a.register = function() {
        return Discovery.register(a)
    }, a.initOffer = function(b, c, d) {
        return Discovery.offer(a.guid, b, c, d)
    }, a.connect = function(b) {
        console.log(a.guid, "initating connection with ", b);
        var d = a.guid + ":" + a.counter.next(),
            e = c(d, b);
        return e.connect(b).then(function(b) {
            return a.renderPeers(), b
        })
    }, a.closeConnection = function(b) {
        console.log(a.guid, "closing connection to ", b.remotePeer, b.label, a.channels, a.connections), b.remotePeer in a.connections && (console.debug("CLOSING PEER IN CONNECTIONS" + b.remotePeer), console.debug("OBJ IDX, REMOVING PEER " + b.remotePeer), ObjectIndex.removePeer(b.remotePeer), delete a.channels[b.label], delete a.connections[b.remotePeer], a.renderPeers())
    }, a.sendHaves = function(b) {
        if (a.isSendHaves)
            for (var c in a.connections) a.sendHave(c, b)
    }, a.sendHave = function(b, c) {
        var d = a.connections[b];
        if (a.isChannelOpen(d.channel)) {
            console.debug("SEND HAVE FOR " + c + " TO " + b);
            var e = a.connections[b];
            e.p2pTransport.sendHave(c)
        } else console.debug("CHANNEL TO  " + b + " NOT OPEN ")
    }, a.sendAllHaves = function(b) {
        if (a.isSendHaves)
            if (b in a.connections) {
                console.debug("SEND ALL HAVES TO " + b);
                for (var c = FragmentCache.getKeys(), d = 0; d < c.length; d++) a.sendHave(b, c[d])
            } else console.debug("NO PEER TO SEND TO " + b)
    }, a.sendPingPong = function(choice,fragmentId){
        var p = new Promise(function(resolve,reject){
            console.debug("**sendPingPong to start " + choice);
            a.pendingPing[fragmentId] = resolve;
            setTimeout(function(){ reject("time out in ping")}, 400);
            for(var i=0; i<choice.length; i++){
                var chosen = choice[i];
                console.debug("**sendPingPong to" + chosen);
                if (chosen in a.connections) {
                      var channel = a.connections[chosen];
                      channel.p2pTransport.sendPing(fragmentId);
                }
            }
        });
        return p;
    }, a.sendRequest = function(b) {
        var c = b.fragmentId,
            d = ObjectIndex.getPartners(c);
        try {
            if ("undefined" != typeof d) {
                var e = _.filter(d, function(b) {
                    if (b in a.connections) {
                        var c = a.connections[b];
                        return "open" === c.channel.readyState
                    }
                    return !1
                });
                console.debug("**send request init");
                a.sendPingPong(e,c)
                .then(function(f){
                    if (console.debug("**CHOICE1 ", e), e.length > 0) {               
                           var g = f;
                        if (g in a.connections) {
                            var h = a.connections[g];
                            console.debug("SEND REQUEST FOR **by !choice! " + c + " TO " + g + " CHANNEL " + h + " " + h.p2pTransport), b.channel = h, h.p2pTransport.sendRequest(b)
                        } else b.onError("CHANNEL TO " + g + " DOES NOT EXIST ")
                    }
                   else b.onError("NO PARTNERS")
               },function(error){
                    if (console.debug("**CHOICE2 ", e), e.length > 0) {
                        var f = Math.round(Math.random() * (e.length - 1)),
                            g = e[f];
                        if (g in a.connections) {
                            var h = a.connections[g];
                            console.debug("SEND REQUEST FOR **by !random! " + c + " TO " + g + " CHANNEL " + h + " " + h.p2pTransport), b.channel = h, h.p2pTransport.sendRequest(b)
                        } else b.onError("CHANNEL TO " + g + " DOES NOT EXIST ")
                    }
                   else b.onError("NO PARTNERS")                
                });
            }   
        } catch (i) {
            console.error("ERROR ", i), b.onError(i)
        }
    }, a.cancelRequest = function(b) {
        b.channel in a.connections ? b.channel.p2pTransport.stopTransfer(b.transferId, "ABORT") : console.warn("CALLED CANCEL REQUEST ON NON EXISTING SESSION")
    }, a.isChannelOpen = function(a) {
        return a && "open" === a.readyState ? !0 : !1
    }, a.periodicChoking = function() {
        console.info("CHOKING", a.connections);
        var b = (_.size(a.connections), []);
        for (var c in a.connections) {
            var d = a.isChannelOpen(a.connections[c].channel),
                e = a.connections[c].p2pTransport.inUse();
            console.debug("CHOKING CHECKING PEER " + c + " STATE " + d + " IS USED " + e), d && !e && b.push(c)
        }
        if (console.debug("CHOKING FOUND " + b.length + " POTENTIAL PEERS, MAX PARTNERS " + Overlay.MaxPartners), b.length >= Overlay.MaxPartners) {
            var f = Math.round(Math.random() * (b.length - 1)),
                g = b[f],
                c = a.connections[g];
            console.debug("CHOKING PEER " + g, c), c.p2pTransport.sendClose(), c.close()
        }
        setTimeout(function() {
            a.periodicChoking()
        }, Overlay.Choking)
    }, a.deliverFragment = function(a) {
        a.onComplete(a.fragmentId, a.fragmentData)
    }, a
}();
