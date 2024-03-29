(function(n) {
    function q(l) {
        function c(a, b, d) {
            a = "undefined" !== typeof a ? parseInt(a, 10) : c.DEFAULT_CAPACITY;
            1 > a && (a = c.DEFAULT_CAPACITY);
            this.array = d ? null : new ArrayBuffer(a);
            this.view = d ? null : new DataView(this.array);
            this.offset = 0;
            this.markedOffset = -1;
            this.length = 0;
            this.littleEndian = "undefined" != typeof b ? !!b : !1
        }
        var p = null;
        if ("function" === typeof require) try {
            var n = require("buffer"),
                p = n && "function" === typeof n.Buffer && "function" === typeof n.Buffer.isBuffer ? n.Buffer : null
        } catch (q) {}
        c.VERSION = "2.3.1";
        c.DEFAULT_CAPACITY =
            16;
        c.LITTLE_ENDIAN = !0;
        c.BIG_ENDIAN = !1;
        c.Long = l || null;
        c.isByteBuffer = function(a) {
            return a && (a instanceof c || "object" === typeof a && (null === a.array || a.array instanceof ArrayBuffer) && (null === a.view || a.view instanceof DataView) && "number" === typeof a.offset && "number" === typeof a.markedOffset && "number" === typeof a.length && "boolean" === typeof a.littleEndian)
        };
        c.allocate = function(a, b) {
            return new c(a, b)
        };
        c.wrap = function(a, b, d) {
            "boolean" === typeof b && (d = b, b = "utf8");
            if ("string" === typeof a) switch (b) {
                case "base64":
                    return c.decode64(a,
                        d);
                case "hex":
                    return c.decodeHex(a, d);
                case "binary":
                    return c.decodeBinary(a, d);
                default:
                    return (new c(c.DEFAULT_CAPACITY, d)).writeUTF8String(a).flip()
            }
            if (p && p.isBuffer(a)) {
                b = (new Uint8Array(a)).buffer;
                if (b === a) {
                    b = new ArrayBuffer(a.length);
                    for (var e = new Uint8Array(b), f = 0, g = a.length; f < g; ++f) e[f] = a[f]
                }
                a = b
            }
            if (null === a || "object" !== typeof a) throw Error("Cannot wrap null or non-object");
            if (c.isByteBuffer(a)) return c.prototype.clone.call(a);
            a.array ? a = a.array : a.buffer && (a = a.buffer);
            if (!(a instanceof ArrayBuffer)) throw Error("Cannot wrap buffer of type " +
                typeof a + ", " + a.constructor.name);
            b = new c(0, d, !0);
            b.array = a;
            b.view = 0 < b.array.byteLength ? new DataView(b.array) : null;
            b.offset = 0;
            b.length = a.byteLength;
            return b
        };
        c.prototype.LE = function(a) {
            this.littleEndian = "undefined" !== typeof a ? !!a : !0;
            return this
        };
        c.prototype.BE = function(a) {
            this.littleEndian = "undefined" !== typeof a ? !a : !1;
            return this
        };
        c.prototype.resize = function(a) {
            if (1 > a) return !1;
            null === this.array && (this.array = new ArrayBuffer(a), this.view = new DataView(this.array));
            if (this.array.byteLength < a) {
                var b = new Uint8Array(this.array);
                a = new ArrayBuffer(a);
                (new Uint8Array(a)).set(b);
                this.array = a;
                this.view = new DataView(a)
            }
            return this
        };
        c.prototype.slice = function(a, b) {
            if (null == this.array) throw Error(this + " cannot be sliced: Already destroyed");
            "undefined" === typeof a && (a = this.offset);
            "undefined" === typeof b && (b = this.length);
            if (b <= a) {
                var d = b;
                b = a;
                a = d
            }
            if (0 > a || a > this.array.byteLength || 1 > b || b > this.array.byteLength) throw Error(this + " cannot be sliced: Index out of bounds (0-" + this.array.byteLength + " -> " + a + "-" + b + ")");
            d = this.clone();
            d.offset =
                a;
            d.length = b;
            return d
        };
        c.prototype.ensureCapacity = function(a) {
            return null === this.array ? this.resize(a) : this.array.byteLength < a ? this.resize(2 * this.array.byteLength >= a ? 2 * this.array.byteLength : a) : this
        };
        c.prototype.flip = function() {
            this.length = null == this.array ? 0 : this.offset;
            this.offset = 0;
            return this
        };
        c.prototype.mark = function(a) {
            if (null == this.array) throw Error(this + " cannot be marked: Already destroyed");
            a = "undefined" !== typeof a ? parseInt(a, 10) : this.offset;
            if (0 > a || a > this.array.byteLength) throw Error(this +
                " cannot be marked: Offset to mark is less than 0 or bigger than the capacity (" + this.array.byteLength + "): " + a);
            this.markedOffset = a;
            return this
        };
        c.prototype.reset = function() {
            if (null === this.array) throw Error(this + " cannot be reset: Already destroyed");
            0 <= this.markedOffset ? (this.offset = this.markedOffset, this.markedOffset = -1) : this.length = this.offset = 0;
            return this
        };
        c.prototype.clone = function() {
            var a = new c(-1, this.littleEndian, !0);
            a.array = this.array;
            a.view = this.view;
            a.offset = this.offset;
            a.markedOffset =
                this.markedOffset;
            a.length = this.length;
            return a
        };
        c.prototype.copy = function() {
            if (null == this.array) return this.clone();
            var a = new c(this.array.byteLength, this.littleEndian),
                b = new Uint8Array(this.array);
            (new Uint8Array(a.array)).set(b);
            a.offset = this.offset;
            a.markedOffset = this.markedOffset;
            a.length = this.length;
            return a
        };
        c.prototype.remaining = function() {
            return null === this.array ? 0 : this.length - this.offset
        };
        c.prototype.capacity = function() {
            return null != this.array ? this.array.byteLength : 0
        };
        c.prototype.compact =
            function() {
                if (null == this.array) throw Error(this + " cannot be compacted: Already destroyed");
                this.offset > this.length && this.flip();
                if (this.offset === this.length) return this.array = new ArrayBuffer(0), this.view = null, this;
                if (0 === this.offset && this.length === this.array.byteLength) return this;
                var a = new Uint8Array(this.array),
                    b = new ArrayBuffer(this.length - this.offset);
                (new Uint8Array(b)).set(a.subarray(this.offset, this.length));
                this.array = b;
                this.markedOffset = this.markedOffset >= this.offset ? this.markedOffset - this.offset :
                    -1;
                this.offset = 0;
                this.length = this.array.byteLength;
                return this
            };
        c.prototype.destroy = function() {
            null !== this.array && (this.view = this.array = null, this.offset = 0, this.markedOffset = -1, this.length = 0);
            return this
        };
        c.prototype.reverse = function() {
            if (null === this.array) throw Error(this + " cannot be reversed: Already destroyed");
            Array.prototype.reverse.call(new Uint8Array(this.array));
            var a = this.offset;
            this.offset = this.array.byteLength - this.length;
            this.markedOffset = -1;
            this.length = this.array.byteLength - a;
            this.view =
                new DataView(this.array);
            return this
        };
        c.prototype.append = function(a, b) {
            a instanceof c || (a = c.wrap(a));
            if (null === a.array) throw Error(a + " cannot be appended to " + this + ": Already destroyed");
            var d = a.length - a.offset;
            if (0 == d) return this;
            0 > d && (a = a.clone().flip(), d = a.length - a.offset);
            b = "undefined" !== typeof b ? b : (this.offset += d) - d;
            this.ensureCapacity(b + d);
            d = new Uint8Array(a.array);
            (new Uint8Array(this.array)).set(d.subarray(a.offset, a.length), b);
            return this
        };
        c.prototype.prepend = function(a, b) {
            a instanceof c ||
                (a = c.wrap(a));
            if (null === a.array) throw a + " cannot be prepended to " + this + ": Already destroyed";
            var d = a.length - a.offset;
            if (0 == d) return this;
            0 > d && (a = a.clone().flip(), d = a.length - a.offset);
            var e = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            var f = d - b;
            0 < f ? (this.ensureCapacity(this.length + f), this.append(this, d), this.offset += f, this.length += f, this.append(a, 0)) : this.append(a, b - d);
            e && (this.offset -= d);
            return this
        };
        c.prototype.writeInt8 = function(a, b) {
            b = "undefined" != typeof b ? b : (this.offset += 1) -
                1;
            this.ensureCapacity(b + 1);
            this.view.setInt8(b, a);
            return this
        };
        c.prototype.readInt8 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 1) - 1;
            if (a >= this.array.byteLength) throw Error("Cannot read int8 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getInt8(a)
        };
        c.prototype.writeByte = c.prototype.writeInt8;
        c.prototype.readByte = c.prototype.readInt8;
        c.prototype.writeUint8 = function(a, b) {
            b = "undefined" !== typeof b ? b : (this.offset += 1) - 1;
            this.ensureCapacity(b + 1);
            this.view.setUint8(b, a);
            return this
        };
        c.prototype.readUint8 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 1) - 1;
            if (a + 1 > this.array.byteLength) throw Error("Cannot read uint8 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getUint8(a)
        };
        c.prototype.writeInt16 = function(a, b) {
            b = "undefined" !== typeof b ? b : (this.offset += 2) - 2;
            this.ensureCapacity(b + 2);
            this.view.setInt16(b, a, this.littleEndian);
            return this
        };
        c.prototype.readInt16 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 2) - 2;
            if (a + 2 > this.array.byteLength) throw Error("Cannot read int16 from " +
                this + " at " + a + ": Capacity overflow");
            return this.view.getInt16(a, this.littleEndian)
        };
        c.prototype.writeShort = c.prototype.writeInt16;
        c.prototype.readShort = c.prototype.readInt16;
        c.prototype.writeUint16 = function(a, b) {
            b = "undefined" !== typeof b ? b : (this.offset += 2) - 2;
            this.ensureCapacity(b + 2);
            this.view.setUint16(b, a, this.littleEndian);
            return this
        };
        c.prototype.readUint16 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 2) - 2;
            if (a + 2 > this.array.byteLength) throw Error("Cannot read int16 from " + this + " at " + a +
                ": Capacity overflow");
            return this.view.getUint16(a, this.littleEndian)
        };
        c.prototype.writeInt32 = function(a, b) {
            b = "undefined" !== typeof b ? b : (this.offset += 4) - 4;
            this.ensureCapacity(b + 4);
            this.view.setInt32(b, a, this.littleEndian);
            return this
        };
        c.prototype.readInt32 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 4) - 4;
            if (a + 4 > this.array.byteLength) throw Error("Cannot read int32 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getInt32(a, this.littleEndian)
        };
        c.prototype.writeInt = c.prototype.writeInt32;
        c.prototype.readInt = c.prototype.readInt32;
        c.prototype.writeUint32 = function(a, b) {
            b = "undefined" != typeof b ? b : (this.offset += 4) - 4;
            this.ensureCapacity(b + 4);
            this.view.setUint32(b, a, this.littleEndian);
            return this
        };
        c.prototype.readUint32 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 4) - 4;
            if (a + 4 > this.array.byteLength) throw Error("Cannot read uint32 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getUint32(a, this.littleEndian)
        };
        c.prototype.writeFloat32 = function(a, b) {
            b = "undefined" !== typeof b ?
                b : (this.offset += 4) - 4;
            this.ensureCapacity(b + 4);
            this.view.setFloat32(b, a, this.littleEndian);
            return this
        };
        c.prototype.readFloat32 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 4) - 4;
            if (null === this.array || a + 4 > this.array.byteLength) throw Error("Cannot read float32 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getFloat32(a, this.littleEndian)
        };
        c.prototype.writeFloat = c.prototype.writeFloat32;
        c.prototype.readFloat = c.prototype.readFloat32;
        c.prototype.writeFloat64 = function(a, b) {
            b = "undefined" !==
                typeof b ? b : (this.offset += 8) - 8;
            this.ensureCapacity(b + 8);
            this.view.setFloat64(b, a, this.littleEndian);
            return this
        };
        c.prototype.readFloat64 = function(a) {
            a = "undefined" !== typeof a ? a : (this.offset += 8) - 8;
            if (null === this.array || a + 8 > this.array.byteLength) throw Error("Cannot read float64 from " + this + " at " + a + ": Capacity overflow");
            return this.view.getFloat64(a, this.littleEndian)
        };
        c.prototype.writeDouble = c.prototype.writeFloat64;
        c.prototype.readDouble = c.prototype.readFloat64;
        l && (c.prototype.writeInt64 = function(a,
                b) {
                b = "undefined" !== typeof b ? b : (this.offset += 8) - 8;
                "object" === typeof a && a instanceof l || (a = l.fromNumber(a, !1));
                this.ensureCapacity(b + 8);
                this.littleEndian ? (this.view.setInt32(b, a.getLowBits(), !0), this.view.setInt32(b + 4, a.getHighBits(), !0)) : (this.view.setInt32(b, a.getHighBits(), !1), this.view.setInt32(b + 4, a.getLowBits(), !1));
                return this
            }, c.prototype.readInt64 = function(a) {
                a = "undefined" !== typeof a ? a : (this.offset += 8) - 8;
                if (null === this.array || a + 8 > this.array.byteLength) throw this.offset -= 8, Error("Cannot read int64 from " +
                    this + " at " + a + ": Capacity overflow");
                return this.littleEndian ? l.fromBits(this.view.getInt32(a, !0), this.view.getInt32(a + 4, !0), !1) : l.fromBits(this.view.getInt32(a + 4, !1), this.view.getInt32(a, !1), !1)
            }, c.prototype.writeUint64 = function(a, b) {
                b = "undefined" !== typeof b ? b : (this.offset += 8) - 8;
                "object" === typeof a && a instanceof l || (a = l.fromNumber(a, !0));
                this.ensureCapacity(b + 8);
                this.littleEndian ? (this.view.setUint32(b, a.getLowBitsUnsigned(), !0), this.view.setUint32(b + 4, a.getHighBitsUnsigned(), !0)) : (this.view.setUint32(b,
                    a.getHighBitsUnsigned(), !1), this.view.setUint32(b + 4, a.getLowBitsUnsigned(), !1));
                return this
            }, c.prototype.readUint64 = function(a) {
                a = "undefined" !== typeof a ? a : (this.offset += 8) - 8;
                if (null === this.array || a + 8 > this.array.byteLength) throw this.offset -= 8, Error("Cannot read int64 from " + this + " at " + a + ": Capacity overflow");
                return this.littleEndian ? l.fromBits(this.view.getUint32(a, !0), this.view.getUint32(a + 4, !0), !0) : l.fromBits(this.view.getUint32(a + 4, !1), this.view.getUint32(a, !1), !0)
            }, c.prototype.writeLong = c.prototype.writeInt64,
            c.prototype.readLong = c.prototype.readInt64);
        c.MAX_VARINT32_BYTES = 5;
        c.prototype.writeVarint32 = function(a, b) {
            var d = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            a >>>= 0;
            this.ensureCapacity(b + c.calculateVarint32(a));
            var e = this.view,
                f = 0;
            e.setUint8(b, a | 128);
            128 <= a ? (e.setUint8(b + 1, a >> 7 | 128), 16384 <= a ? (e.setUint8(b + 2, a >> 14 | 128), 2097152 <= a ? (e.setUint8(b + 3, a >> 21 | 128), 268435456 <= a ? (e.setUint8(b + 4, a >> 28 & 127), f = 5) : (e.setUint8(b + 3, e.getUint8(b + 3) & 127), f = 4)) : (e.setUint8(b + 2, e.getUint8(b + 2) & 127), f =
                3)) : (e.setUint8(b + 1, e.getUint8(b + 1) & 127), f = 2)) : (e.setUint8(b, e.getUint8(b) & 127), f = 1);
            return d ? (this.offset += f, this) : f
        };
        c.prototype.readVarint32 = function(a) {
            var b = "undefined" === typeof a;
            a = "undefined" !== typeof a ? a : this.offset;
            var d = 0,
                e, f = this.view,
                g = 0;
            do e = f.getUint8(a + d), d < c.MAX_VARINT32_BYTES && (g |= (e & 127) << 7 * d >>> 0), ++d; while (e & 128);
            g |= 0;
            return b ? (this.offset += d, g) : {
                value: g,
                length: d
            }
        };
        c.prototype.writeZigZagVarint32 = function(a, b) {
            return this.writeVarint32(c.zigZagEncode32(a), b)
        };
        c.prototype.readZigZagVarint32 =
            function(a) {
                a = this.readVarint32(a);
                return "object" === typeof a ? (a.value = c.zigZagDecode32(a.value), a) : c.zigZagDecode32(a)
            };
        c.MAX_VARINT64_BYTES = 10;
        l && (c.prototype.writeVarint64 = function(a, b) {
            var d = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            "object" === typeof a && a instanceof l || (a = l.fromNumber(a, !1));
            var e = a.toInt() >>> 0,
                f = a.shiftRightUnsigned(28).toInt() >>> 0,
                g = a.shiftRightUnsigned(56).toInt() >>> 0,
                k = c.calculateVarint64(a);
            this.ensureCapacity(b + k);
            var h = this.view;
            switch (k) {
                case 10:
                    h.setUint8(b +
                        9, g >>> 7 | 128);
                case 9:
                    h.setUint8(b + 8, g | 128);
                case 8:
                    h.setUint8(b + 7, f >>> 21 | 128);
                case 7:
                    h.setUint8(b + 6, f >>> 14 | 128);
                case 6:
                    h.setUint8(b + 5, f >>> 7 | 128);
                case 5:
                    h.setUint8(b + 4, f | 128);
                case 4:
                    h.setUint8(b + 3, e >>> 21 | 128);
                case 3:
                    h.setUint8(b + 2, e >>> 14 | 128);
                case 2:
                    h.setUint8(b + 1, e >>> 7 | 128);
                case 1:
                    h.setUint8(b + 0, e | 128)
            }
            h.setUint8(b + k - 1, h.getUint8(b + k - 1) & 127);
            return d ? (this.offset += k, this) : k
        }, c.prototype.readVarint64 = function(a) {
            var b = "undefined" === typeof a,
                d = a = "undefined" !== typeof a ? a : this.offset,
                c = this.view,
                f, g = 0,
                k = 0,
                h;
            h = c.getUint8(a++);
            f = h & 127;
            if (h & 128 && (h = c.getUint8(a++), f |= (h & 127) << 7, h & 128 && (h = c.getUint8(a++), f |= (h & 127) << 14, h & 128 && (h = c.getUint8(a++), f |= (h & 127) << 21, h & 128 && (h = c.getUint8(a++), g = h & 127, h & 128 && (h = c.getUint8(a++), g |= (h & 127) << 7, h & 128 && (h = c.getUint8(a++), g |= (h & 127) << 14, h & 128 && (h = c.getUint8(a++), g |= (h & 127) << 21, h & 128 && (h = c.getUint8(a++), k = h & 127, h & 128 && (h = c.getUint8(a++), k |= (h & 127) << 7, h & 128)))))))))) throw Error("Data must be corrupt: Buffer overrun");
            c = l.from28Bits(f, g, k, !1);
            return b ? (this.offset =
                a, c) : {
                value: c,
                length: a - d
            }
        }, c.prototype.writeZigZagVarint64 = function(a, b) {
            return this.writeVarint64(c.zigZagEncode64(a), b)
        }, c.prototype.readZigZagVarint64 = function(a) {
            a = this.readVarint64(a);
            return "object" !== typeof a || a instanceof l ? c.zigZagDecode64(a) : (a.value = c.zigZagDecode64(a.value), a)
        });
        c.prototype.writeVarint = c.prototype.writeVarint32;
        c.prototype.readVarint = c.prototype.readVarint32;
        c.prototype.writeZigZagVarint = c.prototype.writeZigZagVarint32;
        c.prototype.readZigZagVarint = c.prototype.readZigZagVarint32;
        c.calculateVarint32 = function(a) {
            a >>>= 0;
            return 128 > a ? 1 : 16384 > a ? 2 : 2097152 > a ? 3 : 268435456 > a ? 4 : 5
        };
        l && (c.calculateVarint64 = function(a) {
            "object" === typeof a && a instanceof l || (a = l.fromNumber(a, !1));
            var b = a.toInt() >>> 0,
                d = a.shiftRightUnsigned(28).toInt() >>> 0;
            a = a.shiftRightUnsigned(56).toInt() >>> 0;
            return 0 == a ? 0 == d ? 16384 > b ? 128 > b ? 1 : 2 : 2097152 > b ? 3 : 4 : 16384 > d ? 128 > d ? 5 : 6 : 2097152 > d ? 7 : 8 : 128 > a ? 9 : 10
        });
        c.zigZagEncode32 = function(a) {
            return ((a |= 0) << 1 ^ a >> 31) >>> 0
        };
        c.zigZagDecode32 = function(a) {
            return a >>> 1 ^ -(a & 1) | 0
        };
        l && (c.zigZagEncode64 =
            function(a) {
                "object" === typeof a && a instanceof l ? a.unsigned && (a = a.toSigned()) : a = l.fromNumber(a, !1);
                return a.shiftLeft(1).xor(a.shiftRight(63)).toUnsigned()
            }, c.zigZagDecode64 = function(a) {
                "object" === typeof a && a instanceof l ? a.unsigned || (a = a.toUnsigned()) : a = l.fromNumber(a, !0);
                return a.shiftRightUnsigned(1).xor(a.and(l.ONE).toSigned().negate()).toSigned()
            });
        c.decodeUTF8Char = function(a, b) {
            var d = a.readUint8(b),
                c, f, g, k, h, l = b;
            if (0 == (d & 128)) b += 1;
            else if (192 == (d & 224)) c = a.readUint8(b + 1), d = (d & 31) << 6 | c & 63, b += 2;
            else if (224 == (d & 240)) c = a.readUint8(b + 1), f = a.readUint8(b + 2), d = (d & 15) << 12 | (c & 63) << 6 | f & 63, b += 3;
            else if (240 == (d & 248)) c = a.readUint8(b + 1), f = a.readUint8(b + 2), g = a.readUint8(b + 3), d = (d & 7) << 18 | (c & 63) << 12 | (f & 63) << 6 | g & 63, b += 4;
            else if (248 == (d & 252)) c = a.readUint8(b + 1), f = a.readUint8(b + 2), g = a.readUint8(b + 3), k = a.readUint8(b + 4), d = (d & 3) << 24 | (c & 63) << 18 | (f & 63) << 12 | (g & 63) << 6 | k & 63, b += 5;
            else if (252 == (d & 254)) c = a.readUint8(b + 1), f = a.readUint8(b + 2), g = a.readUint8(b + 3), k = a.readUint8(b + 4), h = a.readUint8(b + 5), d = (d & 1) << 30 | (c & 63) << 24 |
                (f & 63) << 18 | (g & 63) << 12 | (k & 63) << 6 | h & 63, b += 6;
            else throw Error("Cannot decode UTF8 character at offset " + b + ": charCode (0x" + d.toString(16) + ") is invalid");
            return {
                "char": d,
                length: b - l
            }
        };
        c.encodeUTF8Char = function(a, b, c) {
            var e = c;
            if (0 > a) throw Error("Cannot encode UTF8 character: charCode (" + a + ") is negative");
            if (128 > a) b.writeUint8(a & 127, c), c += 1;
            else if (2048 > a) b.writeUint8(a >> 6 & 31 | 192, c).writeUint8(a & 63 | 128, c + 1), c += 2;
            else if (65536 > a) b.writeUint8(a >> 12 & 15 | 224, c).writeUint8(a >> 6 & 63 | 128, c + 1).writeUint8(a & 63 | 128,
                c + 2), c += 3;
            else if (2097152 > a) b.writeUint8(a >> 18 & 7 | 240, c).writeUint8(a >> 12 & 63 | 128, c + 1).writeUint8(a >> 6 & 63 | 128, c + 2).writeUint8(a & 63 | 128, c + 3), c += 4;
            else if (67108864 > a) b.writeUint8(a >> 24 & 3 | 248, c).writeUint8(a >> 18 & 63 | 128, c + 1).writeUint8(a >> 12 & 63 | 128, c + 2).writeUint8(a >> 6 & 63 | 128, c + 3).writeUint8(a & 63 | 128, c + 4), c += 5;
            else if (2147483648 > a) b.writeUint8(a >> 30 & 1 | 252, c).writeUint8(a >> 24 & 63 | 128, c + 1).writeUint8(a >> 18 & 63 | 128, c + 2).writeUint8(a >> 12 & 63 | 128, c + 3).writeUint8(a >> 6 & 63 | 128, c + 4).writeUint8(a & 63 | 128, c + 5), c += 6;
            else throw Error("Cannot encode UTF8 character: charCode (0x" +
                a.toString(16) + ") is too large (>= 0x80000000)");
            return c - e
        };
        c.calculateUTF8Char = function(a) {
            if (0 > a) throw Error("Cannot calculate length of UTF8 character: charCode (" + a + ") is negative");
            if (128 > a) return 1;
            if (2048 > a) return 2;
            if (65536 > a) return 3;
            if (2097152 > a) return 4;
            if (67108864 > a) return 5;
            if (2147483648 > a) return 6;
            throw Error("Cannot calculate length of UTF8 character: charCode (0x" + a.toString(16) + ") is too large (>= 0x80000000)");
        };
        c.a = function(a) {
            a = "" + a;
            for (var b = 0, d = 0, e = a.length; d < e; ++d) b += c.calculateUTF8Char(a.charCodeAt(d));
            return b
        };
        var m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            m = m + "";
        c.encode64 = function(a) {
            a instanceof c ? a.length < a.offset && (a = a.clone().flip()) : a = c.wrap(a);
            var b, d, e, f, g = a.offset,
                k = 0,
                h = [];
            do b = a.readUint8(g++), d = a.length > g ? a.readUint8(g++) : 0, e = a.length > g ? a.readUint8(g++) : 0, f = b << 16 | d << 8 | e, b = f >> 18 & 63, d = f >> 12 & 63, e = f >> 6 & 63, f &= 63, h[k++] = m.charAt(b) + m.charAt(d) + m.charAt(e) + m.charAt(f); while (g < a.length);
            g = h.join("");
            a = (a.length - a.offset) % 3;
            return (a ? g.slice(0, a - 3) : g) + "===".slice(a ||
                3)
        };
        c.decode64 = function(a, b) {
            if ("string" !== typeof a) throw Error("Illegal argument: Not a string");
            var d, e, f, g, k, h = 0,
                l = new c(Math.ceil(a.length / 3), b);
            do {
                d = m.indexOf(a.charAt(h++));
                e = m.indexOf(a.charAt(h++));
                g = m.indexOf(a.charAt(h++));
                k = m.indexOf(a.charAt(h++));
                if (0 > d || 0 > e || 0 > g || 0 > k) throw Error("Illegal argument: Not a valid base64 encoded string");
                f = d << 18 | e << 12 | g << 6 | k;
                d = f >> 16 & 255;
                e = f >> 8 & 255;
                f &= 255;
                64 == g ? l.writeUint8(d) : 64 == k ? l.writeUint8(d).writeUint8(e) : l.writeUint8(d).writeUint8(e).writeUint8(f)
            } while (h <
                a.length);
            return l.flip()
        };
        c.encodeHex = function(a) {
            a instanceof c ? a.length < a.offset && (a = a.clone().flip()) : a = c.wrap(a);
            if (null === a.array) return "";
            for (var b, d = [], e = a.offset, f = a.length; e < f; ++e) b = a.view.getUint8(e).toString(16).toUpperCase(), 2 > b.length && (b = "0" + b), d.push(b);
            return d.join("")
        };
        c.decodeHex = function(a, b) {
            if ("string" !== typeof a) throw Error("Illegal argument: Not a string");
            if (0 !== a.length % 2) throw Error("Illegal argument: Not a hex encoded string");
            for (var d = new c(a.length / 2, b), e = 0, f = a.length; e <
                f; e += 2) d.writeUint8(parseInt(a.substring(e, e + 2), 16));
            return d.flip()
        };
        c.encodeBinary = function(a) {
            a instanceof c ? a.length < a.offset && (a = a.clone().flip()) : a = c.wrap(a);
            var b = [],
                d = a.view,
                e = a.offset;
            for (a = a.length; e < a; ++e) b.push(String.fromCharCode(d.getUint8(e)));
            return b.join("")
        };
        c.decodeBinary = function(a, b) {
            if ("string" !== typeof a) throw Error("Illegal argument: Not a string");
            for (var d = a.length, e = new ArrayBuffer(d), f = new DataView(e), g, k = 0; k < d; ++k) {
                if (255 < (g = a.charCodeAt(k))) throw Error("Illegal argument: Not a binary string (char code " +
                    g + ")");
                f.setUint8(k, g)
            }
            g = new c(d, b, !0);
            g.array = e;
            g.view = f;
            g.length = d;
            return g
        };
        c.prototype.writeUTF8String = function(a, b) {
            var d = "undefined" === typeof b,
                e = b = "undefined" !== typeof b ? b : this.offset,
                f = c.a(a);
            this.ensureCapacity(b + f);
            for (var f = 0, g = a.length; f < g; ++f) b += c.encodeUTF8Char(a.charCodeAt(f), this, b);
            return d ? (this.offset = b, this) : b - e
        };
        c.prototype.readUTF8String = function(a, b) {
            var d = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            for (var e, f = "", g = b, k = 0; k < a; ++k) e = c.decodeUTF8Char(this, b),
                b += e.length, f += String.fromCharCode(e["char"]);
            return d ? (this.offset = b, f) : {
                string: f,
                length: b - g
            }
        };
        c.prototype.readUTF8StringBytes = function(a, b) {
            var d = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            var e, f = "",
                g = b;
            for (a = b + a; b < a;) e = c.decodeUTF8Char(this, b), b += e.length, f += String.fromCharCode(e["char"]);
            if (b != a) throw Error("Actual string length differs from the specified: " + ((b > a ? "+" : "") + b - a) + " bytes");
            return d ? (this.offset = b, f) : {
                string: f,
                length: b - g
            }
        };
        c.prototype.writeLString = function(a, b) {
            a =
                "" + a;
            var d = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            var e = c.encodeUTF8Char(a.length, this, b),
                e = e + this.writeUTF8String(a, b + e);
            return d ? (this.offset += e, this) : e
        };
        c.prototype.readLString = function(a) {
            var b = "undefined" === typeof a;
            a = "undefined" !== typeof a ? a : this.offset;
            var d = c.decodeUTF8Char(this, a);
            a = this.readUTF8String(d["char"], a + d.length);
            return b ? (this.offset += d.length + a.length, a.string) : {
                string: a.string,
                length: d.length + a.length
            }
        };
        c.prototype.writeVString = function(a, b) {
            a = "" + a;
            var d =
                "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            var e = this.writeVarint32(c.a(a), b),
                e = e + this.writeUTF8String(a, b + e);
            return d ? (this.offset += e, this) : e
        };
        c.prototype.readVString = function(a) {
            var b = "undefined" === typeof a;
            a = "undefined" !== typeof a ? a : this.offset;
            var c = this.readVarint32(a);
            a = this.readUTF8StringBytes(c.value, a + c.length);
            return b ? (this.offset += c.length + a.length, a.string) : {
                string: a.string,
                length: c.length + a.length
            }
        };
        c.prototype.writeCString = function(a, b) {
            var c = "undefined" === typeof b;
            b = "undefined" !== typeof b ? b : this.offset;
            var e = this.writeUTF8String("" + a, b);
            this.writeUint8(0, b + e);
            return c ? (this.offset += e + 1, this) : e + 1
        };
        c.prototype.readCString = function(a) {
            var b = "undefined" === typeof a;
            a = "undefined" !== typeof a ? a : this.offset;
            var d, e = "",
                f = a;
            do d = c.decodeUTF8Char(this, a), a += d.length, 0 != d["char"] && (e += String.fromCharCode(d["char"])); while (0 != d["char"]);
            return b ? (this.offset = a, e) : {
                string: e,
                length: a - f
            }
        };
        c.prototype.writeJSON = function(a, b, c) {
            c = "function" === typeof c ? c : JSON.stringify;
            return this.writeLString(c(a),
                b)
        };
        c.prototype.readJSON = function(a, b) {
            b = "function" === typeof b ? b : JSON.parse;
            var c = this.readLString(a);
            return "string" === typeof c ? b(c) : {
                data: b(c.string),
                length: c.length
            }
        };
        c.prototype.toColumns = function(a) {
            if (null === this.array) return "DESTROYED";
            a = "undefined" !== typeof a ? parseInt(a, 10) : 16;
            1 > a && (a = 16);
            for (var b = "", c = [], e, f = this.view, b = 0 == this.offset && 0 == this.length ? b + "|" : 0 == this.length ? b + ">" : 0 == this.offset ? b + "<" : b + " ", g = 0, k = this.array.byteLength; g < k; ++g) {
                if (0 < g && 0 == g % a) {
                    for (; b.length < 3 * a + 1;) b += "   ";
                    c.push(b);
                    b = " "
                }
                e = f.getUint8(g).toString(16).toUpperCase();
                2 > e.length && (e = "0" + e);
                b += e;
                b = g + 1 == this.offset && g + 1 == this.length ? b + "|" : g + 1 == this.offset ? b + "<" : g + 1 == this.length ? b + ">" : b + " "
            }
            " " != b && c.push(b);
            g = 0;
            for (k = c.length; g < k; ++g)
                for (; c[g].length < 3 * a + 1;) c[g] += "   ";
            for (var h = 0, b = "", g = 0, k = this.array.byteLength; g < k; ++g) 0 < g && 0 == g % a && (c[h] += " " + b, b = "", h++), e = f.getUint8(g), b += 32 < e && 127 > e ? String.fromCharCode(e) : ".";
            "" != b && (c[h] += " " + b);
            return c.join("\n")
        };
        c.prototype.printDebug = function(a) {
            "function" !== typeof a && (a =
                console.log.bind(console));
            a((null != this.array ? "ByteBuffer(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",length=" + this.length + ",capacity=" + this.array.byteLength + ")" : "ByteBuffer(DESTROYED)") + "\n-------------------------------------------------------------------\n" + this.toColumns() + "\n")
        };
        c.prototype.toHex = function(a) {
            var b = "",
                d = this.view,
                e, f;
            if (a) {
                if (null === this.array) return "DESTROYED";
                b = 0 == this.offset && 0 == this.length ? b + "|" : 0 == this.length ? b + ">" : 0 == this.offset ? b + "<" : b + " ";
                e = 0;
                for (f = this.array.byteLength; e <
                    f; ++e) a = d.getUint8(e).toString(16).toUpperCase(), 2 > a.length && (a = "0" + a), b += a, b = e + 1 === this.offset && e + 1 === this.length ? b + "|" : e + 1 == this.offset ? b + "<" : e + 1 == this.length ? b + ">" : b + " ";
                return b
            }
            return c.encodeHex(this)
        };
        c.prototype.toBinary = function() {
            return c.encodeBinary(this)
        };
        c.prototype.toBase64 = function() {
            return null === this.array || this.offset >= this.length ? "" : c.encode64(this)
        };
        c.prototype.toUTF8 = function() {
            return null === this.array || this.offset >= this.length ? "" : this.readUTF8StringBytes(this.length - this.offset,
                this.offset).string
        };
        c.prototype.toString = function(a) {
            switch (a || "") {
                case "utf8":
                    return this.toUTF8();
                case "base64":
                    return this.toBase64();
                case "hex":
                    return this.toHex();
                case "binary":
                    return this.toBinary();
                case "debug":
                    return this.toHex(!0);
                default:
                    return null === this.array ? "ByteBuffer(DESTROYED)" : "ByteBuffer(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",length=" + this.length + ",capacity=" + this.array.byteLength + ")"
            }
        };
        c.prototype.toArrayBuffer = function(a) {
            if (null === this.array) return null;
            var b = this.clone();
            b.offset > b.length && b.flip();
            var c = !1;
            if (0 < b.offset || b.length < b.array.byteLength) b.compact(), c = !0;
            return a && !c ? b.copy().array : b.array
        };
        p && (c.prototype.toBuffer = function() {
            if (null === this.array) return null;
            var a = this.offset,
                b = this.length;
            if (a > b) var c = a,
                a = b,
                b = c;
            return new p((new Uint8Array(this.array)).subarray(a, b))
        });
        return c
    }
    "undefined" !== typeof module && module.exports ? module.exports = q(require("long")) : "undefined" !== typeof define && define.amd ? define("ByteBuffer", ["Math/Long"], function(l) {
            return q(l)
        }) :
        (n.dcodeIO || (n.dcodeIO = {}), n.dcodeIO.ByteBuffer = q(n.dcodeIO.Long))
})(this);
