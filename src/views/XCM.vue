<template>
    <div id="app">
      
      <div class="box" style="margin-top: 5%;  font-family: 'Orbitron', cursive;">
        You are logged in as {{$store.state.account}}.
      </div>
      
      <b-field class="textt" label-position="inside" label="Select Scenario">
        <b-select expanded v-model="scenario" required>
          <option v-for="(scenario) in scenarios" :key="scenario">{{scenario}}</option>
        </b-select>
      </b-field>

      <b-field class="textt" label-position="inside" label="Select Network">
        <b-select expanded v-model="relay" required>
          <option v-for="(relay) in relays" :key="relay">{{relay}}</option>
        </b-select>
      </b-field>

      <b-field v-if="(scenario=='Parachain -> Parachain' || scenario == 'Relay chain -> Parachain') " class="textt" label-position="inside" label="Select destination parachain">
        <b-select expanded v-model="nodeid" placeholder="Select parachain 1" required>
          <option v-for="(item) in items" :key="item">{{item}}</option>
        </b-select>
      </b-field>

      <b-field  v-if="scenario=='Parachain -> Relay chain'" class="textt" label-position="inside" label="Select origin parachain">
        <b-select expanded v-model="nodeid" placeholder="Select parachain 1" required>
          <option v-for="(item) in items" :key="item">{{item}}</option>
        </b-select>
      </b-field>
      

      <b-field  v-if="scenario=='Parachain -> Parachain'" class="textt" label-position="inside" label="Select origin parachain">
        <b-select expanded v-model="nodeid2" placeholder="Select parachain 1" required>
          <option v-for="(item) in items" :key="item">{{item}}</option>
        </b-select>
      </b-field>
      
      <b-field v-if="scenario=='Parachain -> Parachain' || scenario== 'Parachain -> Relay chain'" class="textt" label-position="inside" label="Input origin node WSS port">
          <b-input expanded @input.native="wss($event)" v-model="wss"></b-input>
      </b-field>

      <b-field class="textt" label-position="inside" label="Input recipient address (Key20 or Id32)">
        <b-input expanded @input.native="addrs($event)" v-model="addr"></b-input>
      </b-field>
      
      <b-field v-if="nodeid!=''" class="textt" label-position="inside" label="Input currency symbol or id">
        <b-input expanded @input.native="cur($event)" v-model="currency"></b-input>
      </b-field>

      <b-field class="textt" label-position="inside" label="Input currency amount">
          <b-input expanded @input.native="unit($event)" v-model="amount"></b-input>
      </b-field>
      
      <b-button class="buttonn" expanded  @click="sendXCM($store.state.account)">Send transaction</b-button>
          
    </div>
  </template>
  
  <script lang="ts">
    import { ApiPromise, WsProvider } from '@polkadot/api'
    import { defineComponent } from '@vue/composition-api'
    import '@polkadot/api-augment';
    import { web3FromAddress } from "@polkadot/extension-dapp"
    import {Builder} from '@paraspell/sdk'
    import * as paraspell from '@paraspell/sdk'

    export default defineComponent({
      data() {
        return {
          wss: "" as string,
          nodeid: "" as any,  
          nodeid2: "" as any,
          scenario: "" as string, //Scenario for xcm
          scenarios: [] as Array<string>, //Scenarios
          relay: "" as string, //Stores relay
          relays: [] as Array<string>, //Stores relay chains
          items: [] as Array<any>,   //Stores Parachains connected to Relay chain
          key: "" as string,   //Selected destination parachain
          addr: "" as string,   //Recipient address is stored here
          amount: 0 as number,   //Required amount to be transfered is stored here
          type: "" as string,
          currency: "" as string,
          accTypes: [] as Array<string>,

        };
      },
      mounted: async function () {
        this.$notify({ text: `Fetching Parachains connected to Relay chains. Please wait for success notification.`, duration: 6000,speed: 100})
            this.items.push("Statemint","Acala","Astar","BifrostPolkadot","Centrifuge", "Clover", "ComposableFinance","Darwinia",
            "HydraDX","Interlay","Kylin","Litentry","Moonbeam","Parallel","Statemine","Encointer","Altair","Aplitude","Basilisk",
            "BifrostKusama","Pioneer","Calamari","CrustShadow","Crab","Dorafactory","Imbue","Integritee","InvArchTinker","Karura",
            "Kico","Kintsugi","Listen","Litmus","Mangata","Moonriver","ParallelHeiko","Picasso","Pichiu","Quartz","Robonomics","Shiden",
            "Turing")


        this.scenarios.push("Parachain -> Relay chain")
        this.scenarios.push("Parachain -> Parachain")
        this.scenarios.push("Relay chain -> Parachain")

        this.relays.push("Kusama")
        this.relays.push("Polkadot")

      },
      methods: {

        // eslint-disable-next-line 
        async cur(value: any){
          this.currency=value.target.value
        },

        //Used to store recipient address
        // eslint-disable-next-line 
        async addrs(value: any){
          this.addr=value.target.value
        },

        async wss(value: any){
          this.wss=value.target.value
        },

        //Used to store user required transfer amount
        // eslint-disable-next-line 
        async unit(value: any){
          this.amount=value.target.value
        },
        //Used to create XCM transfer
        async sendXCM(address: string) {
          if(this.nodeid == "") 
          {
            this.$notify({ title: 'Error', text: 'You need to select parachain first.', type: 'error', duration: 3000,speed: 100})
          }
          else 
          {
            if(this.addr=="" )
            {
              this.$notify({ title: 'Error', text: 'You need to input recipient first.', type: 'error', duration: 3000,speed: 100})
            }
            
            else{
                  let wsProvider
                  let call
                  var counter = 0
                  //Scenario 1 Relay to para
                  if(this.scenario == "Relay chain -> Parachain"){
                    //Data we need:
                    //Destination node
                    //Network
                    //Asset id
                    //Address
                    //Amount



                    if(this.relay == "Polkadot"){
                      wsProvider = new WsProvider('wss://polkadot.api.onfinality.io/public-ws');
                      const api = await ApiPromise.create({ provider: wsProvider });
                      const injector = await web3FromAddress(address); // finds an injector for an address

                      Builder(api)
                        .to('Basilisk')       // Destination node
                        .amount(this.amount)       // Token amount
                        .address(this.addr)     // AccountId32 or AccountKey20 address
                        .build()              // Function called to build call
                        .signAndSend(address, { signer: injector.signer }, ({ status, txHash }) => {
                        if(counter == 0){    
                          this.$notify({ text: `Transaction hash is ${txHash.toHex()}`, duration: 10000,speed: 100})
                          counter++
                        }
                        if (status.isFinalized) {
                          this.$notify({ text: `Transaction finalized at blockHash ${status.asFinalized}`, type: 'success',duration: 10000,speed: 100})
                        }
                      });
                    }
                    else if(this.relay == "Kusama"){
                      wsProvider = new WsProvider('wss://public-rpc.pinknode.io/kusama');
                      const api = await ApiPromise.create({ provider: wsProvider });
                      const injector = await web3FromAddress(address); // finds an injector for an address

                      Builder(api)
                        .to(this.nodeid)       // Destination node
                        .amount(this.amount)       // Token amount
                        .address(this.addr)     // AccountId32 or AccountKey20 address
                        .build()              // Function called to build call
                        .signAndSend(address, { signer: injector.signer }, ({ status, txHash }) => {
                        if(counter == 0){    
                          this.$notify({ text: `Transaction hash is ${txHash.toHex()}`, duration: 10000,speed: 100})
                          counter++
                        }
                        if (status.isFinalized) {
                          this.$notify({ text: `Transaction finalized at blockHash ${status.asFinalized}`, type: 'success',duration: 10000,speed: 100})
                        }
                      });
                    }
                    else{
                      this.$notify({ title: 'Error', text: 'Please select relay chain.', type: 'error', duration: 3000,speed: 100})
                    } 
                  }
                  else if(this.scenario == "Parachain -> Parachain"){
                    wsProvider = new WsProvider(this.wss);
                    const api = await ApiPromise.create({ provider: wsProvider });
                    const injector = await web3FromAddress(address); // finds an injector for an address
                    
                    Builder(api)
                    .from(this.nodeid)           // Origin node
                    .to(this.nodeid2)           // Destination node
                    .currency(this.currency)          // Token symbol if needed (if not just insert random string, it will not be considered)
                    .currencyId(0)   // CurrencyID if needed (if not just insert random number, it will not be considered)
                    .amount(this.amount)           // Token amount
                    .address(this.addr)         // AccountId32 or AccountKey20 address
                    .build()                  // Function called to build call
                    .signAndSend(address, { signer: injector.signer }, ({ status, txHash }) => {
                    if(counter == 0){    
                      this.$notify({ text: `Transaction hash is ${txHash.toHex()}`, duration: 10000,speed: 100})
                      counter++
                    }
                    if (status.isFinalized) {
                      this.$notify({ text: `Transaction finalized at blockHash ${status.asFinalized}`, type: 'success',duration: 10000,speed: 100})
                    }
                    });
                  }
                  else if(this.scenario == "Parachain -> Relay chain"){
                    wsProvider = new WsProvider(this.wss);
                    const api = await ApiPromise.create({ provider: wsProvider });
                    const injector = await web3FromAddress(address); // finds an injector for an address

                    Builder(api)
                    .from(this.nodeid)            // Origin node
                    .currency(this.currency)          // Token symbol if needed (if not just insert random string, it will not be considered)
                    .currencyId(0)   // CurrencyID if needed (if not just insert random number, it will not be considered)
                    .amount(this.amount)           // Token amount
                    .address(this.addr)         // AccountId32 address
                    .build()                  // Function called to build call
                    .signAndSend(address, { signer: injector.signer }, ({ status, txHash }) => {
                    if(counter == 0){    
                      this.$notify({ text: `Transaction hash is ${txHash.toHex()}`, duration: 10000,speed: 100})
                      counter++
                    }
                    if (status.isFinalized) {
                      this.$notify({ text: `Transaction finalized at blockHash ${status.asFinalized}`, type: 'success',duration: 10000,speed: 100})
                    }
                    });

                  }
                  else {
                    this.$notify({ title: 'Error', text: 'Please select scenario.', type: 'error', duration: 3000,speed: 100})
                  }
            }
          }
        }
      }
    })
  </script>
  
  <style scoped>
    @import url("https://fonts.googleapis.com/css2?family=Anybody:wght@300&family=BIZ+UDGothic&family=Pacifico&display=swap");
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
