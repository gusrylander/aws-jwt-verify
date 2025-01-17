"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_jwt_verify_1 = require("aws-jwt-verify");
if (process.env.JUST_CHECKING_IF_THE_BELOW_TS_COMPILES_DONT_NEED_TO_RUN_IT) {
    const cognitoVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
        userPoolId: "",
    });
    // This statement should not compile,
    // because `tokenUse` and `clientId` were not provided yet at verifier level.
    // Therefore, it should be mandatory now, to provide the 2nd argument, an object
    // that specifies at least `tokenUse` and `clientId`:
    cognitoVerifier.verify("");
    const genericVerifier = aws_jwt_verify_1.JwtRsaVerifier.create({ issuer: "" });
    // This statement should not compile,
    // because `audience` was not provided yet at verifier level.
    // Therefore, it should be mandatory now, to provide the 2nd argument, an object
    // that specifies at least `audience`:
    genericVerifier.verify("");
}
throw new Error("I shouldn't have compiled!");
