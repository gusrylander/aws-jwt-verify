"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_jwt_verify_1 = require("aws-jwt-verify");
const awsJwtModule = __importStar(require("aws-jwt-verify"));
const https = __importStar(require("aws-jwt-verify/https"));
const assert_1 = require("aws-jwt-verify/assert");
const error_1 = require("aws-jwt-verify/error");
aws_jwt_verify_1.JwtRsaVerifier.create({
    jwksUri: "https://example.com/keys/jwks.json",
    issuer: "https://example.com/",
});
awsJwtModule.JwtRsaVerifier.create({
    jwksUri: "https://example.com/keys/jwks.json",
    issuer: "https://example.com/",
});
if (typeof https.fetchJson !== "function") {
    process.exit(1);
}
let verifier;
const verifyProps = {
    tokenUse: "id",
};
verifyProps; // cast should work
const verifierParams = {
    userPoolId: "eu-west-1_abcdefgh",
    ...verifyProps,
};
if (process.env.JUST_CHECKING_IF_THE_BELOW_TS_COMPILES_DONT_NEED_TO_RUN_IT) {
    verifier = aws_jwt_verify_1.CognitoJwtVerifier.create(verifierParams);
    verifier.verifySync("ey...", {
        clientId: "abc",
    });
}
if (process.env.JUST_CHECKING_IF_THE_BELOW_TS_COMPILES_DONT_NEED_TO_RUN_IT) {
    const otherVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
        userPoolId: "",
        clientId: "",
    });
    otherVerifier.verifySync("", {
        tokenUse: "id",
    });
}
let multiVerifier;
const multiVerifyProps = {
    clientId: "xyz",
    tokenUse: "access",
};
multiVerifyProps; // cast should work
const multiVerifierParams = {
    userPoolId: "eu-west-1_abcdefgh",
    ...multiVerifyProps,
};
if (process.env.JUST_CHECKING_IF_THE_BELOW_TS_COMPILES_DONT_NEED_TO_RUN_IT) {
    multiVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create(multiVerifierParams);
    multiVerifier.verifySync("ey...");
}
(0, assert_1.assertStringEquals)("test foo", "foo", "foo", error_1.JwtInvalidIssuerError);
console.log("TypeScript import succeeded!");
