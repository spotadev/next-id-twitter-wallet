import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
// import { createWalletClient, custom } from 'viem';
// import { polygonMumbai as polygonMumbaiViewm } from 'viem/chains';
import axios from 'axios';
import appStyle from '../App.module.css';
import { RecoverPublicKeyParameters, hashMessage, recoverPublicKey } from 'viem';
import { signMessage } from '@wagmi/core'

export interface PostContent {
  default: string;
  en_US: string;
  zh_CN: string;
}

export interface ProofPayloadResponse {
  post_content: PostContent;
  sign_payload: string;
  uuid: string;
  created_at: string;
}

export function Home() {
  const [xHandle, setXHandle] = useState<string | null>();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [proofPayloadResponse, setProofPayloadResponse] = useState<ProofPayloadResponse | null>();
  const [firstLineTweet, setFirstLineTweet] = useState<string | null>(null);
  const [signedMessageBase64Tweet, setSignedMessageBase64Tweet] = useState<string | null>(null);
  const [lastLineTweet, setLastLineTweet] = useState<string | null>(null);
  const [tweetNumber, setTweetNumber] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [verifiedProof, setVerifiedProof] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { open, close } = useWeb3Modal();

  // 4. Configure viem walletClient so we can sign
  const _window: any = window;

  // const walletClient = createWalletClient({
  //   chain: polygonMumbaiViewm,
  //   transport: custom(_window.ethereum)
  // })

  const getConnectWalletJSX = () => {
    if (isConnected) {
      return (
        <>
          <div>
            <span style={{ fontWeight: 'bold' }}>Wallet Address:</span>
          </div>
          <div style={{ paddingTop: '20px' }}>
            ${address}
          </div>
          <div style={{ paddingTop: '20px' }}>
            <button onClick={() => disconnect()}>Disconnect Wallet</button>
          </div >
        </>
      );
    }
    else {
      return (
        <div>
          Connect to Wallet - PENDING
          &nbsp;&nbsp;
          <button onClick={() => open()}>Connect / Disconnect Wallet</button>
          &nbsp;&nbsp;
          <button onClick={() => open({ view: 'Networks' })}>Select Network</button>
        </div>
      )
    }
  }

  const getProofPayloadResponse =
    async (twitterHandle: string, publicKey: string): Promise<ProofPayloadResponse> => {
      // const baseUrl = 'https://proof-service.next.id';
      const baseUrl = process.env.REACT_APP_PROOF_SERVICE_BASE_URL;

      if (!baseUrl) {
        throw new Error('Could not read env properties');
      }

      const url = baseUrl + '/v1/proof/payload';

      let config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const request =
      {
        "action": "create",
        "platform": "twitter",
        "identity": twitterHandle,
        "public_key": publicKey
      };

      let { data, status } =
        await axios.post<ProofPayloadResponse>(url, request, config);

      if (status === 200) {
        return data;
      } else if (status === 404) {
        throw new Error('Not Found: 404');
      } else {
        throw new Error('Fauled to get ProofPayloadResponse: ' + status);
      }
    }

  const getNextIdProofPayload =
    async (
      twitterHandle: string
    ): Promise<ProofPayloadResponse> => {
      const message = 'next.id rocks';

      const signature = await signMessage({ message: message });

      // const [account] = await walletClient.getAddresses()

      // const signature = await walletClient.signMessage({
      //   account,
      //   message: message
      // });

      const messageHash = hashMessage(message);
      console.log('message', message);
      console.log('signature', signature);
      console.log('messageHash', messageHash);

      const recoveredPublicKey = await recoverPublicKey({
        hash: messageHash,
        signature: signature
      })

      setPublicKey(recoveredPublicKey);

      const proofPayloadResponse: ProofPayloadResponse =
        await getProofPayloadResponse(twitterHandle, recoveredPublicKey);

      console.log('recoveredPublicKey', recoveredPublicKey);
      console.log('proofPayloadResponse', proofPayloadResponse);
      return proofPayloadResponse;
    }

  const createTweet = (
    signedMessage: string | undefined, proofPayloadResponse: ProofPayloadResponse
  ): { firstLine: string, signedMessageBase64: string, lastLine: string } | null => {
    if (signedMessage) {
      const signedMessageBase64 = signedMessage;
      console.log('signedMessageBase64[', signedMessageBase64);
      const firstLine = `🎭 Verifying my Twitter ID @${xHandle} for @NextDotID.`;
      const lastLine = 'Next.ID YOUR DIGITAL IDENTITIES IN ONE PLACE';
      return { firstLine, signedMessageBase64, lastLine };
    }
    else {
      return null;
    }
  }

  const buildDataForTweet = async (proofPayloadResponse: ProofPayloadResponse) => {
    if (!proofPayloadResponse) {
      throw Error('proofPayloadResponse not populated');
    }

    const message = proofPayloadResponse.sign_payload;

    // const [account] = await walletClient.getAddresses()

    // const signedPayload = await walletClient.signMessage({
    //   account,
    //   message: message
    // });

    const signedPayload = await signMessage({ message: message });

    console.log('signedPayload', signedPayload);

    const signatureWithoutPrefix = signedPayload.slice(2);
    const buffer = Buffer.from(signatureWithoutPrefix, 'hex');
    const base64String = buffer.toString('base64');
    console.log('base64String', base64String);

    const result: { firstLine: string, signedMessageBase64: string, lastLine: string } | null =
      createTweet(base64String, proofPayloadResponse);

    if (result) {
      const { firstLine, signedMessageBase64, lastLine } = result;
      setFirstLineTweet(firstLine);
      setSignedMessageBase64Tweet(signedMessageBase64);
      setLastLineTweet(lastLine);
    }
  }

  const next = async () => {
    if (xHandle) {
      const proofPayloadResponse: ProofPayloadResponse =
        await getNextIdProofPayload(xHandle);

      console.log('proofPayloadResponse', proofPayloadResponse);
      setProofPayloadResponse(proofPayloadResponse);
      await buildDataForTweet(proofPayloadResponse);
    }
  }

  const verifyProof = async (
    xHandle: string,
    publicKey: string,
    numberAtEndTweetUrl: string,
    uuid: string
  ): Promise<void> => {
    // const baseUrl = 'https://proof-service.next.id';
    const baseUrl = process.env.REACT_APP_PROOF_SERVICE_BASE_URL;
    const url = baseUrl + '/v1/proof';

    if (!baseUrl) {
      throw new Error('Could not read env properties');
    }

    let config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const createdAt: string = new Date().getTime() + '';

    const request =
    {
      "action": "create",
      "platform": "twitter",
      "identity": xHandle,
      "public_key": publicKey,
      "proof_location": numberAtEndTweetUrl,
      "extra": {},
      "uuid": uuid,
      "created_at": createdAt
    };

    let { status } = await axios.post<{}>(url, request, config);

    if (status === 201) {
      console.log('Verified');
    } else {
      throw new Error(`Failed to verify proof. Status: ${status}`);
    }
  }

  const verify = async () => {
    if (tweetNumber) {
      if (!proofPayloadResponse || !xHandle || !publicKey) {
        const errrorMessage =
          'Expecting all of these to be populated: ' +
          `proofPayloadResponse: ${proofPayloadResponse}, ` +
          `xHandle: ${xHandle}, publicKey: ${publicKey}`;

        throw new Error(errrorMessage);
      }

      const uuid = proofPayloadResponse?.uuid;

      try {
        await verifyProof(xHandle, publicKey, tweetNumber, uuid);
        setVerifiedProof(true);
      }
      catch (error) {
        setVerifiedProof(false);
        setErrorMessage(
          'Tweet did not pass validation. The twitter handle was not added to your next.id DID');
      }
    }
  }

  const getDIDAddedJSX = () => {
    if (verifiedProof) {
      return (
        <p>
          Your xhandle has been added to your next.id DID
        </p>
      );
    } else if (errorMessage) {
      return (
        <div style={{ color: 'red' }}>${errorMessage}</div>
      );
    }
    else {
      return '';
    }
  }

  const getTweetJSX = () => {
    if (proofPayloadResponse) {
      return (
        <>
          <div>
            <span style={{ fontWeight: 'bold' }}>Step 2: </span>
            Send Tweet and Paste URL - IN PROGRESS
          </div>
          <div style={{ paddingTop: '20px' }}>
            Please copy the text in the pink box below into a tweet and send it:
          </div>
          <div style={{ marginTop: '20px', backgroundColor: 'pink', height: '120px', wordWrap: 'break-word' }}>
            {firstLineTweet}
            <br />
            Sig: {signedMessageBase64Tweet}
            <br /><br />
            {lastLineTweet}
          </div >
          <div style={{ paddingTop: '20px' }}>
            Once you have sent the tweet. Click the share tweet, and paste the id number in the
            tweet url into the box below and press the Verify Button.
          </div>
          <div style={{ paddingTop: '20px' }}>
            <input
              style={{ width: '80%' }}
              className={appStyle.input}
              placeholder="Tweet Number"
              value={tweetNumber} onChange={(event) => setTweetNumber(event.target.value)} />
            &nbsp;&nbsp;
            <button disabled={xHandle?.length == 0} className={appStyle.button}
              onClick={verify}>Verify</button>
          </div>
          {getDIDAddedJSX()}
        </>
      );
    }
    return '';
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Next.id DID management for adding twitter x handle to Next.id DID</h1>
      <h2>Intro</h2>
      <p>
        This code uses Meta Mask so make sure you have installed it.
      </p>
      <p>
        This code also uses the PolygonMumbai (testnet) Network so make sure you have it configured
        in your metamask.
      </p>
      <p>
        The README.md file has instructions on how to do the above. It also has instructions
        on how to configure your .env.local file and how do get an ID needed for connecting
        to your wallet.
      </p>
      <h2>Instructions</h2>
      <p>
        Click on the button below to connect your Meta Mask wallet:
      </p>
      {getConnectWalletJSX()}
      <p>
        Once you are connected above, enter your X Twitter handle below without the @ symbol
        and press Next.
      </p>
      <p>
        <input
          className={appStyle.input}
          placeholder="Enter: X / Twitter Handle (mandatory)"
          value={xHandle ? xHandle : ''} onChange={(event) => setXHandle(event.target.value)} />
        &nbsp;&nbsp;
        <button className={appStyle.button} onClick={next}>Next</button>
      </p>
      {getTweetJSX()}
    </div>
  );
}