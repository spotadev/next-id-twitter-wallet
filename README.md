# Instructions

NOTE:  17/01/2024 This code works and is considered complete.

I created this example as was having problems with the next.id API complaining that my signature 
was incorrect.  Therefore I took the code out of another react project and created this isolated
react project so that devs from next.id can more easily understand the code and let me know if
there are issues with the code.

## What is this project about?

Next.id has API which allow you to associate social medial handles with a Decentralised ID (DID).

This is example code showing how to associate a twitter X social media handle with a next.id DID.

It uses Meta Mask wallet to do the required signing so that the user does not need to manage their
own private key.

The public key is recovered from meta mask using the viem library.

The viem library also signs the verify payload response to produce the data required to build the
twitter tweet.  Once the tweet has been sent manually by the user, they click share and get the
tweet number from the URL.  They paste that number in a box so that the tweet can be verified.

So the user steps are:

(i) Paste twitter X handle into the box without the @ symbol

(ii) Press Next

(iv) Meta Mask will pop up a couple of times asking to sign stuff

(v) The text to paste into a tweet will be shown.

(vi) Paste the twitter text into a tweet and send it.

(vii) Click Share for the tweet and take the ID from the URL and paste it in the box.  Then press
      verify.

  If all is well you will be shown a message that the x handle was added to your DID.

  Else you will be shown an error message.



## Copy env.local.sample

Copy env.local.sample to env.local

Go to:  

  https://cloud.walletconnect.com/sign-in

Get your project id and set it in the REACT_APP_WALLET_CONNECT_PROJECT_ID

So YOUR env.local will look something like:

    REACT_APP_ENVIRONMENT=local.env
    REACT_APP_WALLET_CONNECT_PROJECT_ID=replace_with_your_project_id
    REACT_APP_PROOF_SERVICE_BASE_URL=https://proof-service.nextnext.id

## Install Meta Mask

Install Meta Mask in your browser:

  https://metamask.io/download/

## Add polygonMumbai to Meta Mask

If you do not already have polygonMumbai configured in your MetaMask

In meta mask:

  click 3 dots
  Go to Settings
  Go to Networks
  Click Add Network

Configure as follows:
 
    Network Name:        Polygon Mumbai Testnet
    New RPC Url:         https://rpc.ankr.com/polygon_mumbai
    Chain ID:            80001
    Currency Symbol:     MATIC
    Block explorer URL:  https://mumbai.polygonscan.com/

## Build and Run

npm install

npm run start

Open in browser:

  http://localhost:3000/


## Browser instructions

(i) Paste twitter X handle into the box without the @ symbol

(ii) Press Next

(iv) Meta Mask will pop up a couple of times asking to sign stuff

(v) The text to paste into a tweet will be shown.

(vi) Paste the twitter text into a tweet and send it.

(vii) Click Share for the tweet and take the ID from the URL and paste it in the box.  Then press
      verify.

  If all is well you will be shown a message that the x handle was added to your DID.

  Else you will be shown an error message.
