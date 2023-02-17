<template>
  <div id="app">
    <b-navbar style="margin-bottom: 5%;">
      <template #start>
        <h1 style="margin-top: 1% ; margin-right: 15%;" class="name" >lumimoon</h1>
        <b-navbar-item  class="top undername" tag="router-link" to="/" type="is-link">Home</b-navbar-item>
        <b-navbar-item class="top undername" tag="router-link" to="/axl" type="is-link">GMP Transfer</b-navbar-item>
        <b-navbar-item class="top undername" tag="router-link" to="/xcm" type="is-link">XCM Transfer</b-navbar-item>

      </template>
      <template #end>
        <vue-metamask ref="metamask" :initConnect="false"></vue-metamask>
        
        <b-navbar-dropdown hoverable arrowless boxed class="top" style= "border-style: solid; border-radius: 5px;" label="Log in with" >Pick option you wish to log in with.
          <b-navbar-item @click="isCardModalActive = true"><b-icon style="margin-right:5px;" size="is-small" pack="fas" icon="wallet" custom-class="fa-bounce"></b-icon>My wallet</b-navbar-item>
          <b-navbar-item type="is-text" @click="connect"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png"  width="20" height="20">{{name}}</b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>
    <b-modal v-model="isCardModalActive" :width="640" scroll="keep">
      <b-message 
        title="Info" 
        type="is-info" 
        aria-close-label="Close message">Select account you wish to login with and then close this popup by clicking anywhere around these boxes.
      </b-message>
      <b-select placeholder="Select account" expanded style="text-align: center;" @input.native="accountLogin($event)" required>
        <option v-for="(dropdown, index) in dropdown" :key="index">{{dropdown}}</option>
      </b-select>
    </b-modal>
    <div id="demo">
        <vue-metamask 
            userMessage="msg" 
            @onComplete="onComplete"
        >
        </vue-metamask>
    </div>
    <router-view/>
    <notifications/>

  </div>
  
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import VueMetamask from 'vue-metamask';
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp"
import '@polkadot/api-augment';
import store from './store';

export default defineComponent({
  components: {
            VueMetamask,
  },
  data() {
    return {
      name: "",
      login: "",   //Currently logged account
      accounts: [],  //List of names - To be also used on Log in button
      addresses: [], //List of addresses
      injected: [],  //Collected injected wallets
      dropdown: [],  //Dropdown of names & addresses
      isCardModalActive: false   //Used to determine whether wallet login popup is or is not active
    };
  },
  mounted: async function () {
      //Connect injected wallets that are available
      const extensions = await web3Enable("PolkadotJS")
      if(extensions.length == 0) {
        this.$notify({ title: 'Error', text: 'You do not have PolkadotJS extension make sure to install one if you want to use your wallet.', type: 'error', duration: 8000,speed: 100})
        return
      }
      //Collect injected wallets
      this.injected = await web3Accounts()
      //Used to extract address and name from injected wallet login
      for (let i=0 ;i<this.injected.length; i++){
        this.accounts.push(JSON.stringify(this.injected[i]["meta"]["name"]))
        this.addresses.push(JSON.stringify(this.injected[i]["address"]))
        this.dropdown.push(this.accounts[i] + this.addresses[i])
      }
    },
  methods:{
      //Used to save logged account for XCM screens
      async loginn(value){
        this.login=value
        store.commit('saveAccount', this.login)
      },  
      async accountLogin(value){
        var accSplit = value.target.value.split('"')
        this.loginn(accSplit[3])
      },
    onComplete(data){
      console.log('data:', data);
      if (data.metaMaskAddress == "")
      {
        this.$notify({ text: 'There was an error connecting your wallet! Please allow metamask by opening extension manually and refresh page after that!', type:"error", duration: 10000,speed: 100})
      }
      {
        this.$notify({ text: 'Your wallet is connected!', type:"success", duration: 4000,speed: 100})
        this.name = data.metaMaskAddress.slice(0,8)+"..";
      }    
    },
    connect() {
      this.$refs.metamask.init();

    }
  },
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
  .namee {
    color: black;
    font-family: 'Zen Dots', cursive;
    font-size: 20px;
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

