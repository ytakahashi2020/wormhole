import type { Chain, Network, TokenId } from "@wormhole-foundation/sdk";
import { TokenTransfer, Wormhole, amount, isTokenId, wormhole } from "@wormhole-foundation/sdk";

// Import the platform-specific packages

import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
// import type { SignerStuff } from "../../../../src/helpers/index.js";
import { getSigner, waitLog, SignerStuff } from "./helpers";

export const maxDuration = 60;
export async function POST(request) {
  try {
    // リクエストボディをJSONとしてパース
    const body = await request.text();
    const { amt } = JSON.parse(body); // JSON にパース
    console.log("Amount received:", amt);

    // Init Wormhole object, passing config for which network
    // to use (e.g. Mainnet/Testnet) and what Platforms to support
    const wh = await wormhole("Testnet", [evm, solana]);
    // Grab chain Contexts -- these hold a reference to a cached rpc client
    const sendChain = wh.getChain("Solana");
    const rcvChain = wh.getChain("Avalanche");

    // Shortcut to allow transferring native gas token
    const token = Wormhole.tokenId(sendChain.chain, "native");

    console.log("token", token);

    // const amt = "0.01";

    const automatic = false;

    const nativeGas = automatic ? "0.01" : undefined;

    const source = await getSigner(sendChain);
    const destination = await getSigner(rcvChain);

    console.log("source", source.address);
    console.log("source", source.chain.chain);

    const decimals = isTokenId(token)
      ? Number(await wh.getDecimals(token.chain, token.address))
      : sendChain.config.nativeTokenDecimals;

    // Set this to true if you want to perform a round trip transfer
    const roundTrip: boolean = false;

    // Set this to the transfer txid of the initiating transaction to recover a token transfer
    // and attempt to fetch details about its progress.
    let recoverTxid = undefined;
    // recoverTxid = "0xa4e0a2c1c994fe3298b5646dfd5ce92596dc1a589f42e241b7f07501a5a5a39f";

    // Finally create and perform the transfer given the parameters set above
    const xfer = !recoverTxid
      ? // Perform the token transfer
        await tokenTransfer(
          wh,
          {
            token,
            amount: amount.units(amount.parse(amt, decimals)),
            source,
            destination,
            delivery: {
              automatic,
              nativeGas: nativeGas ? amount.units(amount.parse(nativeGas, decimals)) : undefined,
            },
          },
          roundTrip,
        )
      : // Recover the transfer from the originating txid
        await TokenTransfer.from(wh, {
          chain: source.chain.chain,
          txid: recoverTxid,
        });

    const receipt = await waitLog(wh, xfer);

    console.log("================");
    // Log out the results
    console.log("receipt", receipt);

    console.log("================");

    // BigInt の値を文字列に変換し、receipt オブジェクトを簡素化
    const simplifiedReceipt = {
      from: receipt.from,
      to: receipt.to,
      state: receipt.state,
      originTxs: receipt.originTxs.map((tx) => ({
        chain: tx.chain,
        txid: tx.txid,
      })),
      destinationTxs: receipt.destinationTxs.map((tx) => ({
        chain: tx.chain,
        txid: tx.txid,
      })),
    };

    console.log("Simplified receipt:", simplifiedReceipt);

    // レスポンスとして受け取ったデータを返す
    return new Response(JSON.stringify({ message: "Data received", receipt: simplifiedReceipt }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // エラーハンドリング
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: "Error processing request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

async function tokenTransfer<N extends Network>(
  wh: Wormhole<N>,
  route: {
    token: TokenId;
    amount: bigint;
    source: SignerStuff<N, Chain>;
    destination: SignerStuff<N, Chain>;
    delivery?: {
      automatic: boolean;
      nativeGas?: bigint;
    };
    payload?: Uint8Array;
  },
  roundTrip?: boolean,
): Promise<TokenTransfer<N>> {
  // EXAMPLE_TOKEN_TRANSFER
  // Create a TokenTransfer object to track the state of the transfer over time
  const xfer = await wh.tokenTransfer(
    route.token,
    route.amount,
    route.source.address,
    route.destination.address,
    route.delivery?.automatic ?? false,
    route.payload,
    route.delivery?.nativeGas,
  );

  const quote = await TokenTransfer.quoteTransfer(
    wh,
    route.source.chain,
    route.destination.chain,
    xfer.transfer,
  );
  console.log(quote);

  if (xfer.transfer.automatic && quote.destinationToken.amount < 0)
    throw "The amount requested is too low to cover the fee and any native gas requested.";

  // 1) Submit the transactions to the source chain, passing a signer to sign any txns
  console.log("Starting transfer");
  const srcTxids = await xfer.initiateTransfer(route.source.signer);
  console.log(`Started transfer: `, srcTxids);

  // If automatic, we're done
  if (route.delivery?.automatic) return xfer;

  // 2) Wait for the VAA to be signed and ready (not required for auto transfer)
  console.log("Getting Attestation");
  const attestIds = await xfer.fetchAttestation(60_000);
  console.log(`Got Attestation: `, attestIds);

  // 3) Redeem the VAA on the dest chain
  console.log("Completing Transfer");
  const destTxids = await xfer.completeTransfer(route.destination.signer);
  console.log(`Completed Transfer: `, destTxids);
  // EXAMPLE_TOKEN_TRANSFER

  // If no need to send back, dip
  if (!roundTrip) return xfer;

  const { destinationToken: token } = quote;
  return await tokenTransfer(wh, {
    ...route,
    token: token.token,
    amount: token.amount,
    source: route.destination,
    destination: route.source,
  });
}
