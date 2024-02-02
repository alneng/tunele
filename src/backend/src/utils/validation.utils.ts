import { Request, Response, NextFunction } from "express";
import { ValidationChain } from "express-validator";
import { DateTime } from "luxon";

export function isValidJsonBody() {
  return function (req: Request, res: Response, next: NextFunction) {
    if (req.is("json")) {
      return next();
    }
    return res.status(400).json({
      errors: [{ type: "field", msg: "Invalid body", location: "body" }],
    });
  };
}

export function isValidPlaylistId(validationObject: ValidationChain) {
  return validationObject.isString().notEmpty().isLength({ min: 22, max: 22 });
}

export function isValidTimezoneString(tz: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const timeZoneQuery = req.query[tz];
    const { timeZone } = req.body;
    const timeZoneValue = timeZoneQuery ?? timeZone ?? "invalid";
    if (!DateTime.local().setZone(timeZoneValue).isValid) {
      return res.status(400).json({
        errors: [{ type: "field", msg: "Invalid timeZone", location: "query" }],
      });
    }
    next();
  };
}

export function isValidUserId(validationObject: ValidationChain) {
  return validationObject.isString().notEmpty().isLength({ min: 21, max: 21 });
}
