"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
//
// Utility to encode RSA public keys (a pair of modulus (n) and exponent (e)) into DER-encoding, per ASN.1 specification.
Object.defineProperty(exports, "__esModule", { value: true });
exports.deconstructPublicKeyInDerFormat = exports.constructPublicKeyInDerFormat = void 0;
const error_js_1 = require("./error.js");
/** Enum with possible values for supported ASN.1 classes */
var Asn1Class;
(function (Asn1Class) {
    Asn1Class[Asn1Class["Universal"] = 0] = "Universal";
})(Asn1Class || (Asn1Class = {}));
/** Enum with possible values for supported ASN.1 encodings */
var Asn1Encoding;
(function (Asn1Encoding) {
    Asn1Encoding[Asn1Encoding["Primitive"] = 0] = "Primitive";
    Asn1Encoding[Asn1Encoding["Constructed"] = 1] = "Constructed";
})(Asn1Encoding || (Asn1Encoding = {}));
/** Enum with possible values for supported ASN.1 tags */
var Asn1Tag;
(function (Asn1Tag) {
    Asn1Tag[Asn1Tag["BitString"] = 3] = "BitString";
    Asn1Tag[Asn1Tag["ObjectIdentifier"] = 6] = "ObjectIdentifier";
    Asn1Tag[Asn1Tag["Sequence"] = 16] = "Sequence";
    Asn1Tag[Asn1Tag["Null"] = 5] = "Null";
    Asn1Tag[Asn1Tag["Integer"] = 2] = "Integer";
})(Asn1Tag || (Asn1Tag = {}));
/**
 * Encode an ASN.1 identifier per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.1.2
 *
 * @param identifier - The ASN.1 identifier
 * @returns The buffer
 */
function encodeIdentifier(identifier) {
    const identifierAsNumber = (identifier.class << 7) |
        (identifier.primitiveOrConstructed << 5) |
        identifier.tag;
    return Buffer.from([identifierAsNumber]);
}
/**
 * Encode the length of an ASN.1 type per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.1.3
 *
 * @param length - The length of the ASN.1 type
 * @returns The buffer
 */
function encodeLength(length) {
    if (length < 128) {
        return Buffer.from([length]);
    }
    const integers = [];
    while (length > 0) {
        integers.push(length % 256);
        length = length >> 8;
    }
    integers.reverse();
    return Buffer.from([128 | integers.length, ...integers]);
}
/**
 * Encode a buffer (that represent an integer) as integer per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.3
 *
 * @param buffer - The buffer that represent an integer to encode
 * @returns The buffer
 */
function encodeBufferAsInteger(buffer) {
    return Buffer.concat([
        encodeIdentifier({
            class: Asn1Class.Universal,
            primitiveOrConstructed: Asn1Encoding.Primitive,
            tag: Asn1Tag.Integer,
        }),
        encodeLength(buffer.length),
        buffer,
    ]);
}
/**
 * Encode an object identifier (a string such as "1.2.840.113549.1.1.1") per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.19
 *
 * @param oid - The object identifier to encode
 * @returns The buffer
 */
function encodeObjectIdentifier(oid) {
    const oidComponents = oid.split(".").map((i) => parseInt(i));
    const firstSubidentifier = oidComponents[0] * 40 + oidComponents[1];
    const subsequentSubidentifiers = oidComponents
        .slice(2)
        .reduce((expanded, component) => {
        const bytes = [];
        do {
            bytes.push(component % 128);
            component = component >> 7;
        } while (component);
        return expanded.concat(bytes.map((b, index) => (index ? b + 128 : b)).reverse());
    }, []);
    const oidBuffer = Buffer.from([
        firstSubidentifier,
        ...subsequentSubidentifiers,
    ]);
    return Buffer.concat([
        encodeIdentifier({
            class: Asn1Class.Universal,
            primitiveOrConstructed: Asn1Encoding.Primitive,
            tag: Asn1Tag.ObjectIdentifier,
        }),
        encodeLength(oidBuffer.length),
        oidBuffer,
    ]);
}
/**
 * Encode a buffer as bit string per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.6
 *
 * @param buffer - The buffer to encode
 * @returns The buffer
 */
function encodeBufferAsBitString(buffer) {
    const bitString = Buffer.concat([Buffer.from([0]), buffer]);
    return Buffer.concat([
        encodeIdentifier({
            class: Asn1Class.Universal,
            primitiveOrConstructed: Asn1Encoding.Primitive,
            tag: Asn1Tag.BitString,
        }),
        encodeLength(bitString.length),
        bitString,
    ]);
}
/**
 * Encode a sequence of DER-encoded items per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.9
 *
 * @param sequenceItems - The sequence of DER-encoded items
 * @returns The buffer
 */
function encodeSequence(sequenceItems) {
    const concatenated = Buffer.concat(sequenceItems);
    return Buffer.concat([
        encodeIdentifier({
            class: Asn1Class.Universal,
            primitiveOrConstructed: Asn1Encoding.Constructed,
            tag: Asn1Tag.Sequence,
        }),
        encodeLength(concatenated.length),
        concatenated,
    ]);
}
/**
 * Encode null per ASN.1 spec (DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.8
 *
 * @returns The buffer
 */
function encodeNull() {
    return Buffer.concat([
        encodeIdentifier({
            class: Asn1Class.Universal,
            primitiveOrConstructed: Asn1Encoding.Primitive,
            tag: Asn1Tag.Null,
        }),
        encodeLength(0),
    ]);
}
/**
 * RSA encryption object identifier constant
 *
 * From: https://tools.ietf.org/html/rfc8017
 *
 * pkcs-1    OBJECT IDENTIFIER ::= {
 *     iso(1) member-body(2) us(840) rsadsi(113549) pkcs(1) 1
 * }
 *
 * -- When rsaEncryption is used in an AlgorithmIdentifier,
 * -- the parameters MUST be present and MUST be NULL.
 * --
 * rsaEncryption    OBJECT IDENTIFIER ::= { pkcs-1 1 }
 *
 * See also: http://www.oid-info.com/get/1.2.840.113549.1.1.1
 */
const ALGORITHM_RSA_ENCRYPTION = encodeSequence([
    encodeObjectIdentifier("1.2.840.113549.1.1.1"),
    encodeNull(), // parameters
]);
/**
 * Transform an RSA public key, which is a pair of modulus (n) and exponent (e),
 *  into a buffer per ASN.1 spec (DER-encoding)
 *
 * @param n - The modulus of the public key as buffer
 * @param e - The exponent of the public key as buffer
 * @returns The buffer, which is the public key encoded per ASN.1 spec (DER-encoding)
 */
function constructPublicKeyInDerFormat(n, e) {
    return encodeSequence([
        ALGORITHM_RSA_ENCRYPTION,
        encodeBufferAsBitString(encodeSequence([encodeBufferAsInteger(n), encodeBufferAsInteger(e)])),
    ]);
}
exports.constructPublicKeyInDerFormat = constructPublicKeyInDerFormat;
/**
 * Decode an ASN.1 identifier (a number) into its parts: class, primitiveOrConstructed, tag
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.1.2
 *
 * @param identifier - The identifier
 * @returns An object with properties class, primitiveOrConstructed, tag
 */
function decodeIdentifier(identifier) {
    if (identifier >> 3 === 0b11111) {
        throw new error_js_1.Asn1DecodingError("Decoding of identifier with tag > 30 not implemented");
    }
    return {
        class: identifier >> 6,
        primitiveOrConstructed: (identifier >> 5) & 0b001,
        tag: identifier & 0b11111, // bit 1-5
    };
}
/**
 * Decode an ASN.1 block of length value combinations,
 * and return the length and byte range of the first length value combination.
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.1.3 - 8.1.5
 *
 * @param blockOfLengthValues - The ASN.1 length value
 * @returns The length and byte range of the first included length value
 */
function decodeLengthValue(blockOfLengthValues) {
    if (!(blockOfLengthValues[0] & 0b10000000)) {
        return {
            length: blockOfLengthValues[0],
            firstByteOffset: 1,
            lastByteOffset: 1 + blockOfLengthValues[0],
        };
    }
    const nrLengthOctets = blockOfLengthValues[0] & 0b01111111;
    const length = Buffer.from(blockOfLengthValues.slice(1, 1 + 1 + nrLengthOctets)).readUIntBE(0, nrLengthOctets);
    return {
        length,
        firstByteOffset: 1 + nrLengthOctets,
        lastByteOffset: 1 + nrLengthOctets + length,
    };
}
/**
 * Decode an ASN.1 sequence into its constituent parts, each part being an identifier-length-value triplet
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.9
 *
 * @param sequenceValue - The ASN.1 sequence value
 * @returns Array of identifier-length-value triplets
 */
function decodeSequence(sequence) {
    const { tag } = decodeIdentifier(sequence[0]);
    if (tag !== Asn1Tag.Sequence) {
        throw new error_js_1.Asn1DecodingError(`Expected a sequence to decode, but got tag ${tag}`);
    }
    const { firstByteOffset, lastByteOffset } = decodeLengthValue(sequence.slice(1));
    const sequenceValue = sequence.slice(1 + firstByteOffset, 1 + 1 + lastByteOffset);
    const parts = [];
    let offset = 0;
    while (offset < sequenceValue.length) {
        // Silence false postive: accessing an octet in a Buffer at a particular index
        // is to be done with index operator: [index]
        // eslint-disable-next-line security/detect-object-injection
        const identifier = decodeIdentifier(sequenceValue[offset]);
        const next = decodeLengthValue(sequenceValue.slice(offset + 1));
        const value = sequenceValue.slice(offset + 1 + next.firstByteOffset, offset + 1 + next.lastByteOffset);
        parts.push({ identifier, length: next.length, value });
        offset += 1 + next.lastByteOffset;
    }
    return parts;
}
/**
 * Decode an ASN.1 sequence that is wrapped in a bit string
 * (Which is the way RSA public keys are encoded in ASN.1 DER-encoding)
 * See https://www.itu.int/ITU-T/studygroups/com17/languages/X.690-0207.pdf chapter 8.6 and 8.9
 *
 * @param bitStringValue - The ASN.1 bit string value
 * @returns Array of identifier-length-value triplets
 */
function decodeBitStringWrappedSequenceValue(bitStringValue) {
    const wrappedSequence = bitStringValue.slice(1);
    return decodeSequence(wrappedSequence);
}
/**
 * Decode an ASN.1 DER-encoded public key, into its modulus (n) and exponent (e)
 *
 * @param publicKey - The ASN.1 DER-encoded public key
 * @returns Object with modulus (n) and exponent (e)
 */
function deconstructPublicKeyInDerFormat(publicKey) {
    const [, pubkeyinfo] = decodeSequence(publicKey);
    const [n, e] = decodeBitStringWrappedSequenceValue(pubkeyinfo.value);
    return { n: n.value, e: e.value };
}
exports.deconstructPublicKeyInDerFormat = deconstructPublicKeyInDerFormat;
