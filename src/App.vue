<template>
  <div id="app">
    <b-navbar style="margin-bottom: 5%;">
      <template #start>
        <h1 style="margin-top: 1% ; margin-right: 5%;" class="name" >lumimoon</h1>
        <b-navbar-item  class="top undername" tag="router-link" to="/" type="is-link">Home</b-navbar-item>
        <b-navbar-item class="top undername" tag="router-link" to="/axl" type="is-link">GMP Transfer</b-navbar-item>
        <b-navbar-item class="top undername" tag="router-link" to="/xcm" type="is-link">XCM Transfer</b-navbar-item>
        <b-navbar-item class="top undername" tag="router-link" to="/xcmtransactor" type="is-link">XCM Transactor</b-navbar-item>

      </template>
      <template #end>
        <vue-metamask ref="metamask" :initConnect="false"></vue-metamask>
        
        <b-navbar-dropdown hoverable arrowless boxed class="top" style= "border-style: solid; border-radius: 5px;" label="Log in with" >Pick option you wish to log in with.
          <b-navbar-item @click="isCardModalActive = true"><b-icon style="margin-right:5px;" size="is-small" pack="fas" icon="wallet" custom-class="fa-bounce"></b-icon>My wallet</b-navbar-item>
          <b-navbar-item size="is-large" type="is-text" class="namee" @click="connect">{{name}}<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png"  width="25" height="25"></b-navbar-item>
          <b-navbar-item @click.native="loginn('Alice')"><b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Alice</b-navbar-item>
          <b-navbar-item @click.native="loginn('Bob')"><b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Bob</b-navbar-item>
          <b-navbar-item @click.native="loginn('Charlie')"><b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Charlie</b-navbar-item>
          <b-navbar-item @click.native="loginn('Dave')"><b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Dave</b-navbar-item>
          <b-navbar-item @click.native="loginn('Eve')"><b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Eve</b-navbar-item>
          <b-navbar-item @click.native="loginn('Ferdie')"> <b-icon style="margin-right:5px" size="is-small" pack="fas" icon="clipboard-user"></b-icon>Ferdie</b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>
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

export default defineComponent({
  components: {
            VueMetamask,
  },
  data() {
    return {
      name: "",

    };
  },
  methods:{
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

