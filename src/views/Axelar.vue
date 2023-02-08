<template>
  <div>
    <p >Make sure to connect to correct network on your Metamask! (One you selected as origin)</p>

    <b-field class="textt" label-position="inside" label="Select origin chain">
      <b-select v-model="key" expanded placeholder="Select" required>
        <option v-for="(item) in items" :key="item">{{item}}</option>
    </b-select>
    </b-field>
    <b-field class="textt" label-position="inside" label="Select destination chain">
      <b-select v-model="keyy" expanded placeholder="Select" required>
        <option v-for="(item) in items" :key="item">{{item}}</option>
      </b-select>
    </b-field>
    <b-field class="textt" label-position="inside" label="Input destination address">
        <b-input expanded @input.native="addrs($event)" v-model="addr"></b-input>
    </b-field>
    <b-field class="textt" label-position="inside" label="Select asset you wish to transfer cross-chain">
      <b-select v-model="token" expanded placeholder="Select" required>
        <option v-for="(token) in tokens" :key="token">{{token}}</option>
      </b-select>
    </b-field>
    <b-field class="textt" label-position="inside" label="Insert token amount">
        <b-input expanded @input.native="summ($event)" v-model="sum"></b-input>
    </b-field>
    <b-button expanded @click="transactGMP()" style="margin-bottom: 1%" label="Transfer assets"></b-button>
    <b-button @click="calcSum()" expanded label="Calculate fees"></b-button>

    <p v-if="(fee!=0)" class="undername">Fee for this cross-chain transfer: {{(fee.fee.amount)}}</p>
    <p v-if="(fee!=0)" class="undername">Total transaction cost with your amount: {{sumWfee}}</p>

    <li style="margin-top: 1%;" v-for="(tx, index) in txCheck" class="undername">
      tx no.{{ index+1 }} - <a :href="txCheck[index]" target="_blank">Axelar testnet scan</a>
    </li>

    <p style="margin-top:20%">Do not forget to add all networks you wish to use into your Metamask. They can be added in link below by clicking metamask logo.</p>
    <a href="https://docs.axelar.dev/dev/build/contract-addresses/testnet" target="_blank">Axelar docs</a>

  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { AxelarAssetTransfer, CHAINS, AxelarQueryAPI, Environment} from '@axelar-network/axelarjs-sdk';
import web3 from 'web3'
import AxelarGatewayContract from '../abi/IAxelarGateway.sol/IAxelarGateway.json';
import IERC20 from '../abi/IERC20.sol/IERC20.json';
import { Contract, ethers } from 'ethers';

declare global{
  interface Window{
    ethereum: any
  }
}

export default defineComponent({
  data() {
    return {
      items: [] as Array<string>,   
      tokens: [] as Array<string>,
      token: "" as string,
      keyy: "" as string,
      key: "" as string,
      sum: 0 as number,
      fee: 0 as any,
      sumWfee: 0 as unknown as BigInt,
      addr: "" as string,
      isMetamaskSupported: false,
      txCheck: [] as Array<string>,
      txHash: "" as string
    };
  },
  mounted: async function () {

    this.items.push("Moonbeam")
    this.items.push("Avalanche")
    this.items.push("Fantom")
    this.items.push("Polygon")
    this.items.push("ethereum-2")

    this.tokens.push("uaxl")
    this.tokens.push("wmatic-wei")
    this.tokens.push("wftm-wei")
    this.tokens.push("eth-wei")
    this.tokens.push("wavax-wei")
    this.tokens.push("wdev-wei")
    this.tokens.push("uausdc")
    this.tokens.push("wbnb-wei")
  },
  methods: {
        // eslint-disable-next-line 
        async summ(value: any){
          this.sum=value.target.value
        },
        // eslint-disable-next-line 
        async addrs(value: any){
          this.addr=value.target.value
        },

        async valadd(val1: number, val2: number){
          this.sumWfee = BigInt(0)
          this.sumWfee =  BigInt(val1)+  BigInt(val2)
        },

        async calcFee(){
          if(this.key=="" || this.keyy=="" || this.token=="" || this.sum==0){
            this.$notify({ text: 'You did not specify details required!', type: 'error', duration: 4000,speed: 100})
          }
          else{
            this.$notify({ text: 'We are currently calculating fees for your transaction.', duration: 6000,speed: 100})

            const axelarQuery = new AxelarQueryAPI({
            environment: Environment.TESTNET,
            });

            var chainFrom = CHAINS.TESTNET.MOONBEAM
            var chainTo = CHAINS.TESTNET.AVALANCHE

            //SENDER CHAIN
            if(this.key == "Moonbeam"){
              chainFrom = CHAINS.TESTNET.MOONBEAM
            }
            else if(this.key == "Avalanche"){
              chainFrom = CHAINS.TESTNET.AVALANCHE
            }
            else if(this.key == "Polygon"){
              chainFrom = CHAINS.TESTNET.POLYGON
            }
            else if(this.key == "Fantom"){
              chainFrom = CHAINS.TESTNET.FANTOM
            }
            else if(this.key == "Ethereum"){
              chainFrom = CHAINS.TESTNET.ETHEREUM
            }

            //DESTINATION CHAIN
            if(this.keyy == "Moonbeam"){
              chainTo = CHAINS.TESTNET.MOONBEAM
            }
            else if(this.keyy == "Avalanche"){
              chainTo = CHAINS.TESTNET.AVALANCHE
            }
            else if(this.keyy == "Polygon"){
              chainTo = CHAINS.TESTNET.POLYGON
            }
            else if(this.keyy == "Fantom"){
              chainTo = CHAINS.TESTNET.FANTOM
            }
            else if(this.keyy == "Ethereum"){
              chainTo = CHAINS.TESTNET.ETHEREUM
            }


            const fee = await axelarQuery.getTransferFee(
              chainFrom,
              chainTo,
              this.token,
              this.sum
            );
            
            return fee
          }
        },

        async transactGMP(){
          var err= 0;
          if(this.key=="" || this.keyy=="" || this.token=="" || this.sum==0 || this.addr=="")
          {
            this.$notify({ text: 'You did not specify details required!', type: 'error', duration: 4000,speed: 100})
          }
          else{

            //Verify provided addr
            try {
              web3.utils.toChecksumAddress(this.addr)
            } catch(e) { 
              this.$notify({ text: `Address you provided is not valid ETH style address.`, type: 'error', duration: 4000,speed: 100})
              err = 1;
            }
            if (err == 0 ){
              //MAGIC

              //Init SDK
              const axelarAssetTransfer = new AxelarAssetTransfer({
                environment: Environment.TESTNET,
              });

              //GET FEES
              const fees = await this.calcFee()

              //GET DEPOSIT ADDR
              if(this.sum > Number(fees?.fee?.amount)){
                this.$notify({ text: 'Your deposit address is getting ready.', duration: 6000,speed: 100})

                //Pull up our address
                const account = new ethers.providers.Web3Provider(window.ethereum);
                const signer = account.getSigner()

                //Get chains for RPC and Gateways
                let chains = require('../constants/testnet.json') 
                let assets = require('../constants/assets.json')
                
                var chain: any
                var asset: any

                //Select our chain
                if(this.key == "Moonbeam"){
                  chain = chains.find((chain: any) => chain.name === 'Moonbeam') as any;
                }
                else if(this.key == "Avalanche"){
                  chain = chains.find((chain: any) => chain.name === 'Avalanche') as any;
                }
                else if(this.key == "ethereum-2"){
                  chain = chains.find((chain: any) => chain.name === 'Ethereum') as any;
                }
                else if(this.key == "Polygon"){
                  chain = chains.find((chain: any) => chain.name === 'Polygon') as any;
                }
                else if(this.key == "Fantom"){
                  chain = chains.find((chain: any) => chain.name === 'Fantom') as any;
                }         

                //Select correct symbol for our token
                asset = assets.find((asset: any) => asset.name === this.token) as any;

                const chainName = chain.name
                const asstSym = asset[chainName]

                //Get our gateway
                const srcGatewayContract = new Contract(chain.gateway, AxelarGatewayContract.abi, signer);

                //We get gateway contract for our selected currency and create contract
                const srcTokenAddress = await srcGatewayContract.tokenAddresses(asstSym);
                const srcErc20 = new Contract(srcTokenAddress, IERC20.abi, signer);

                const depositAddress = await axelarAssetTransfer.getDepositAddress(
                  this.key, // source chain
                  this.keyy, // destination chain
                  this.addr, // destination address
                  this.token // denom of asset. See note (2) below
                );                

                //PREPARE TX TO PROVIDED ACC

                this.$notify({ text: 'Metamask should shortly prompt you to approve transfer.', duration: 6000,speed: 100})

                //WE NEED ERC20 CONTRACT INTERACTION HERE
                const txHash = await srcErc20
                    .transfer(depositAddress, this.sum)
                    .then((tx: any) => tx.wait())
                    .then((receipt: any) => receipt.transactionHash);

                console.log(txHash)
                //LET USER CHECK TX IN THE EXPLORER
                this.$notify({ text: 'Your transaction was completed, check it out in Axelar testnet scan.', type:"success", duration: 6000,speed: 100})

                this.txCheck.push("https://testnet.axelarscan.io/transfer/" + txHash)

                //MAGIC OVER.
              }
              else{
                this.$notify({ text: `Your transfer was unable to be processed due to insufficient sum provided. Calculate your sum with fees first and try to assign again.`, type: 'error', duration: 10000,speed: 100})
              }

            } 
            else{
              this.$notify({ text: `Your transfer was unable to be processed due to some issue, check details you provided.`, type: 'error', duration: 10000,speed: 100})
            }

          }
        },

        async calcSum(){
          if(this.key=="" || this.keyy=="" || this.token=="" || this.sum==0){
            this.$notify({ text: 'You did not specify details required!', type: 'error', duration: 4000,speed: 100})
          }
          else{
            this.$notify({ text: 'Your estimate is generating!', type:"success", duration: 4000,speed: 100})

            const axelarQuery = new AxelarQueryAPI({
            environment: Environment.TESTNET,
            });

            var chainFrom = CHAINS.TESTNET.MOONBEAM
            var chainTo = CHAINS.TESTNET.AVALANCHE

            //SENDER CHAIN
            if(this.key == "Moonbeam"){
              chainFrom = CHAINS.TESTNET.MOONBEAM
            }
            else if(this.key == "Avalanche"){
              chainFrom = CHAINS.TESTNET.AVALANCHE
            }
            else if(this.key == "Polygon"){
              chainFrom = CHAINS.TESTNET.POLYGON
            }
            else if(this.key == "Fantom"){
              chainFrom = CHAINS.TESTNET.FANTOM
            }
            else if(this.key == "Ethereum"){
              chainFrom = CHAINS.TESTNET.ETHEREUM
            }

            //DESTINATION CHAIN
            if(this.keyy == "Moonbeam"){
              chainTo = CHAINS.TESTNET.MOONBEAM
            }
            else if(this.keyy == "Avalanche"){
              chainTo = CHAINS.TESTNET.AVALANCHE
            }
            else if(this.keyy == "Polygon"){
              chainTo = CHAINS.TESTNET.POLYGON
            }
            else if(this.keyy == "Fantom"){
              chainTo = CHAINS.TESTNET.FANTOM
            }
            else if(this.keyy == "Ethereum"){
              chainTo = CHAINS.TESTNET.ETHEREUM
            }

            //MAGIC FOR CALCULATING FEES FOR USER
            const fee = await axelarQuery.getTransferFee(
              chainFrom,
              chainTo,
              this.token,
              this.sum
            );
            this.fee = fee
            this.valadd(this.sum, this.fee.fee.amount)

          }
        }
  }
})
</script>
<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background-color: white;
    margin-top: 20px;
    margin-left: 20%;
    margin-right: 20%;
  }
  .mainLogo {
    width: 10%;
  }
  .name {
    color: black;
    font-family: 'Zen Dots', cursive;
    font-size: 40px;
  }
  .undername {
    color: black;
    font-family: 'Orbitron', sans-serif;
    font-size: 16px;

  }
  .together {
    display:block
  }
  .flex__container {
    display: flex;
    flex-direction: column;
  }
  .top {
    margin-top: 8px;
  }
</style>

