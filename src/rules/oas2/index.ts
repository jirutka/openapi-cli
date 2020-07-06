import { OasSpec } from "../common/spec";
import { InfoDescription } from "../common/info-description";
import { InfoContact } from "../common/info-contact";
import { InfoLicense } from "../common/info-license-url";
import { InfoLicenseUrl } from "../common/license-url";

import { BooleanParameterPrefixes } from "./boolean-parameter-prefixes";
import { TagDescription } from "../common/tag-description";
import { TagsAlphabetical } from "../common/tags-alphabetical";
import { PathsKebabCase } from "../common/paths-kebab-case";
import { NoEnumTypeMismatch } from "../common/no-enum-type-mismatch";
import { NoPathTrailingSlash } from "../common/no-path-trailing-slash";
import { Operation2xxResponse } from "../common/operation-2xx-response";
import { OperationIdUnique } from "../common/operation-operationId-unique";
import { OperationParametersUnique } from "../common/operation-parameters-unique";
import { PathParamsDefined } from "../common/path-params-defined";
import { OperationTagDefined } from "../common/operation-tag-defined";
import { PathDeclarationMustExist } from "../common/path-declaration-must-exist";
import { OperationIdUrlSafe } from "../common/operation-operationId-url-safe";
import { OperationDescription } from "../common/operation-description";
import { PathNotIncludeQuery } from "../common/path-not-include-query";
import { ParameterDescription } from "../common/parameter-description";
import { OperationSingularTag } from "../common/operation-singular-tag";
import { OperationSecurityDefined } from "../common/operation-security-defined";
import { NoUnresolvedRefs } from "../no-unresolved-refs";
import { PathHttpVerbsOrder } from "../common/path-http-verbs-order";
import { Oas2Rule } from "../../visitors";

export const rules = {
  'info-description': InfoDescription as Oas2Rule,
  'info-contact': InfoContact as Oas2Rule,
  'info-license': InfoLicense as Oas2Rule,
  'info-license-url': InfoLicenseUrl as Oas2Rule,

  'tag-description': TagDescription as Oas2Rule,
  'tags-alphabetical': TagsAlphabetical as Oas2Rule,

  'paths-kebab-case': PathsKebabCase as Oas2Rule,
  'no-enum-type-mismatch': NoEnumTypeMismatch as Oas2Rule,

  'boolean-parameter-prefixes': BooleanParameterPrefixes as Oas2Rule,
  'no-path-trailing-slash': NoPathTrailingSlash as Oas2Rule,
  'operation-2xx-response': Operation2xxResponse as Oas2Rule,

  'operation-operationId-unique': OperationIdUnique as Oas2Rule,
  'operation-parameters-unique': OperationParametersUnique as Oas2Rule,
  'path-parameters-defined': PathParamsDefined as Oas2Rule,
  'operation-tag-defined': OperationTagDefined as Oas2Rule,

  'path-declaration-must-exist': PathDeclarationMustExist as Oas2Rule,
  'operationId-valid-in-url': OperationIdUrlSafe as Oas2Rule,

  'operation-description': OperationDescription as Oas2Rule,
  'operation-operationId-url-safe': OperationIdUrlSafe as Oas2Rule,
  'path-not-include-query': PathNotIncludeQuery as Oas2Rule,
  'path-params-defined': PathParamsDefined as Oas2Rule,
  'parameter-description': ParameterDescription as Oas2Rule,
  'operation-singular-tag': OperationSingularTag as Oas2Rule,
  'operation-security-defined': OperationSecurityDefined as Oas2Rule,
  'no-unresolved-refs': NoUnresolvedRefs as Oas2Rule,

  'path-http-verbs-order': PathHttpVerbsOrder as Oas2Rule,
  spec: OasSpec as Oas2Rule,
}

export const preprocessors = {
}
export const decorators = {
}