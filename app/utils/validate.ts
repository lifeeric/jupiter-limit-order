/** @format */

import * as Joi from "joi";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

/**
 * Interfaces
 */
export interface OrderFields {
  owner: PublicKey;
  inAmount: BN;
  inputMint: PublicKey;
  outAmount: BN;
  outputMint: PublicKey;
  base: PublicKey;
  expiredAt?: null;
}

export interface CancelOrder {
  owner: string;
  orderPubKey: string;
}

const createOrderSchema = Joi.object({
  owner: Joi.string().required(),
  inAmount: Joi.number().required(),
  outAmount: Joi.number().required(),
  inputMint: Joi.string().min(40).required(),
  outputMint: Joi.string().min(40).required(),
});

const cancelOrderSchema = Joi.object({
  owner: Joi.string().min(40).required(),
  orderPubKey: Joi.string().min(40).required(),
});

/**
 * Validates request data
 * @param order - request data
 */
export function validateCreateOrderFields(order: OrderFields): void {
  const { error } = createOrderSchema.validate(order, { abortEarly: false });

  if (error) throw new Error(`Request invalid: ${error.message}`);
}

/**
 *
 * @param order - cancel order data
 */
export function validateCancelOrderFields(order: CancelOrder): void {
  const { error } = cancelOrderSchema.validate(order, { abortEarly: false });

  if (error) throw new Error(`Request invalid: ${error.message}`);
}
