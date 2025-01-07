import { HDNodeWallet, Mnemonic } from 'ethers'

const NUM_ADDRESSES = 24

// const wallet = Wallet.createRandom()

const phrase = 'sort false live enroll sense chronic token suspect appear icon front club';
const mnemonic = Mnemonic.fromPhrase(phrase);


for (let i = 0; i < NUM_ADDRESSES; i++) {
  const path = `m/44'/60'/0'/0/${i}`;
  const hdWallet = HDNodeWallet.fromMnemonic(mnemonic, path);
  console.log(`Address at index ${i} (${path}):`, hdWallet.address)
}