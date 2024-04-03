/** @format */

/**
 * @module routes/order
 */

import { Request, Response, Router } from "express";
import {
  LimitOrderProvider,
  CreateOrderParams,
  OrderHistoryItem,
  ownerFilter,
} from "@jup-ag/limit-order-sdk";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";

import {
  validateCreateOrderFields,
  validateCancelOrderFields,
  OrderFields,
  CancelOrder,
} from "../utils/validate";

const router: Router = Router();

/**
 * set PRC URL and create connection
 */
const SOLANA_RPC_ENDPOINT: string = "https://nyc83.nodes.rpcpool.com";
const connection = new Connection(SOLANA_RPC_ENDPOINT);
const limitOrder = new LimitOrderProvider(connection);

/**
 * Handles creation of a new order.
 * @route POST /orders
 */
router.post("/createOrder", async (req: Request, res: Response) => {
  try {
    const reqData: OrderFields = req.body;
    const { owner, inAmount, outAmount, inputMint, outputMint }: OrderFields =
      reqData;

    /**
     * Validate Reqest body
     */
    validateCreateOrderFields(reqData);

    const base = Keypair.generate();

    let orderData: OrderFields = {
      owner: owner,
      inAmount: new BN(inAmount), // 1 USDC
      inputMint: new PublicKey(inputMint), // USDC mainnet mint
      outAmount: new BN(outAmount), // 1 SOL
      outputMint: new PublicKey(outputMint), // SOL mint
      base: base.publicKey,
      expiredAt: null,
    };

    const { tx, orderPubKey } = await limitOrder.createOrder(
      orderData as CreateOrderParams
    );

    // @ts-ignore: owner
    const trx = await sendAndConfirmTransaction(connection, tx, [owner, base]);

    console.log(`[✅] Order placed successfully TRX: ${trx}`);

    res.json({
      message: `Order placed successfully TRX: ${trx}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: (error as Error).message || "Unknown error" });
  }
});

/**
 * Queries a user's orders.
 * @route GET /orders/:owner
 */
router.get("/order/:owner", async (req: Request, res: Response) => {
  try {
    const owner = req.params.owner;

    console.log("[owner]", new PublicKey(owner));

    const openOrder = await limitOrder.getOrders([
      ownerFilter(new PublicKey(owner)),
    ]);

    const orderHistory: OrderHistoryItem[] = await limitOrder.getOrderHistory({
      wallet: owner,
      take: 20, // optional, default is 20, maximum is 100
      // lastCursor: order.id // optional, for pagination
    });

    res.json({ ...orderHistory });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: (error as Error).message || "Unknown error" });
  }
});

/**
 * cancel an existing order.
 * @route cancel /orders/{orderId}

 */
router.delete("/cancel/:orderId", async (req: Request, res: Response) => {
  try {
    const order = req.body;

    validateCancelOrderFields(order);

    const { owner, orderPubKey } = order;

    const txid = await limitOrder.cancelOrder({
      owner: owner,
      orderPubKey: orderPubKey,
    });

    res.json({ wasCancelled: true });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: (error as Error).message || "Unknown error" });
  }
});

export default router;
