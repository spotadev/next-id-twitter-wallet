import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
// import { signMessage } from '@wagmi/core'
import { polygonMumbai } from 'wagmi/chains'

import { WagmiConfig, useAccount } from 'wagmi';
import { Home } from './home/Home';

function App() {

  const environment = process.env.REACT_APP_ENVIRONMENT;
  console.log('environment', environment);

  // 1. Get projectId
  const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
  console.log('projectId', projectId);

  if (!projectId) {
    throw new Error('Please copy .env.sample to .env and set variables');
  }

  // 2. Create wagmiConfig
  // const chains = [polygonMumbai, mainnet, arbitrum]
  const chains = [polygonMumbai];

  const metadata = {
    name: 'Web3Modal',
    description: 'Web3Modal Example',
    url: 'https://web3modal.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }

  const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: metadata })

  // 3. Create modal
  createWeb3Modal({ wagmiConfig, projectId, chains })



  return (
    <WagmiConfig config={wagmiConfig}>
      <Home />
    </WagmiConfig>
  );
}

export default App;
