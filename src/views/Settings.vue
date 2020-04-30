<template>
  <div class="main">
    <div class="container">
      <h1>Impostazioni</h1>
      <hr>
      <h4 class="title is-4">Seleziona Sidechain da gestire</h4>
      <div v-if="!isLoading">
        <b-select v-model="sidechain" placeholder="Select a sidechain">
            <option
                v-for="option in sidechains"
                :value="option.address"
                :key="option.address">
                {{ option.name }}
            </option>
        </b-select><br>
        <b-button type="is-primary" v-on:click="selectChain" size="is-medium">CAMBIA SIDECHAIN</b-button>
      </div>
      <div v-if="isLoading">Carico sidechain proprietarie dell'account..</div>
      <br>
      <h4 class="title is-4">Effettua backup archivio</h4>
      <p>
        Questo backup ti servirà per importare in un momento successivo l'intero archivio.<br>
        <span style="color:#f00">Attenzione, effettuate regolarmente il backup così da evitare la perdita di dati.</span>
      </p><br>
      <vue-csv-downloader
        :data="users"
        :fields="fields"
      > 
        <b-button type="is-primary" size="is-medium">SCARICA BACKUP</b-button>
      </vue-csv-downloader>
      <hr>
      <h4 class="title is-4">Cancella intero archivio</h4>
      <p>
        L'intero archivio verrà cancellato, potrai importare un backup dalla gestione utenti.<br>
        <span style="color:#f00">Attenzione, l'attuale archivio verrà perso, procedere con cautela.</span>
      </p><br>
      <b-button type="is-primary" v-on:click="deleteArchive" size="is-medium">CANCELLA ARCHIVIO</b-button>
    </div>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core")
import User from '../libs/user.js'
import ScryptaDB from '../libs/db.js'
import VueCsvDownloader from 'vue-csv-downloader';

export default {
  components: {
      VueCsvDownloader,
  },
  data() {
    return {
      db: new ScryptaDB(true, ['users', 'settings']),
      scrypta: new ScryptaCore(true),
      users: [],
      sidechain: '',
      isLoading: true,
      sidechains: [],
      fields: ['id', 'sid', 'filter', 'name', 'identifier'],
      user: {
        owner: {
          '-': {
            genesis: {
              name: '-',
              symbol: '-'
            }
          }
        },
        chain: '-',
        identity: {
          address: '',
          wallet: ''
        }
      }
    };
  },
  async mounted() {
    const app = this;
    app.user = await User.auth()
    app.users = await app.db.get('users')
    app.sidechain = localStorage.getItem('chain')
    app.fetchSidechains()
  },
  methods: {
    async deleteArchive(){
      const app = this
      app.$buefy.dialog.prompt({
        message: `Inserisci la password del wallet`,
        inputAttrs: {
          type: "password"
        },
        trapFocus: false,
        onConfirm: async password => {
          let key = await app.scrypta.readKey(password, app.user.identity.wallet);
          if (key !== false) {
            await app.db.destroy('users')
            app.$buefy.toast.open({
              message: "Archivio cancellato correttamente!",
              type: "is-success"
            });
          }else{
            app.$buefy.toast.open({
              message: "Password errata!",
              type: "is-danger"
            });
          }
        }
      })
    },
    selectChain(){
      const app = this
      localStorage.setItem('chain', app.sidechain)
      app.$buefy.toast.open({
        message: "Sidechain selezionata!",
        type: "is-success"
      });
    },
    fetchSidechains(){
      const app = this
      app.scrypta.post('/sidechain/scan/address', { dapp_address: app.user.identity.address }).then(async response => {
        let sidechains = []
        for(let x in response.data){
          let sidechain = response.data[x]
          let details = await app.scrypta.post('/sidechain/get', {sidechain_address: sidechain.sidechain })
          let parsed = {
            name: details.sidechain[0].data.genesis.name + ' (' + details.sidechain[0].data.genesis.symbol + ')',
            address: details.sidechain[0].address,
            symbol: details.sidechain[0].data.genesis.symbol,
            supply: details.sidechain[0].data.genesis.supply + ' ' + details.sidechain[0].data.genesis.symbol,
            owner: details.sidechain[0].data.genesis.owner,
            balance: sidechain.balance
          }
          if(parsed.owner === app.user.identity.address){
            sidechains.push(parsed)
          }
        }
        app.sidechains = sidechains
        app.isLoading = false
      })
    }
  }
};
</script>