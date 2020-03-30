<template>
  <div id="app">
    <div v-if="wallet">
      <b-navbar>
          <template slot="brand">
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              <img src="/logo.png" />
            </b-navbar-item>
          </template>
          <template slot="start">
            <b-navbar-item href="/#/">Home</b-navbar-item>
            <b-navbar-item href="/#/settings">Impostazioni</b-navbar-item>
            <b-navbar-item href="/#/card">Controlla card</b-navbar-item>
            <b-navbar-item href="/#/history">Storico transazioni</b-navbar-item>
          </template>

          <template slot="end">
            <b-navbar-item tag="div">
              <div class="buttons">
                <a v-on:click="logout" class="button is-primary">
                  <strong>Logout</strong>
                </a>
              </div>
            </b-navbar-item>
          </template>
        </b-navbar>
      <router-view/>
    </div>
    <div class="container" v-if="!wallet">
      <div class="text-center" style="margin-top:10vh">
        <img src="/planum.png" width="15%" /><br><br>
        <h1>Effettua il login con un account<br>proprietario di una sidechain Planum</h1><br>
        <p>Per poter amministrare una sidechain devi collegarti come proprietario</p>
        <b-upload v-model="file" v-on:input="loadWalletFromFile" drag-drop>
          <section class="section">
            <div class="content has-text-centered">
              <p>Trascina il tuo file .sid qui o clicca per caricare.</p>
            </div>
          </section>
        </b-upload>
      </div>
    </div>
    <div class="text-center">
      <hr>
      <br />Scrypta Planum Admin is an<br>
      <a
        href="https://github.com/scryptachain/scrypta-planum-admin"
        target="_blank"
      >open-source</a> project by
      <a href="https://scrypta.foundation" target="_blank">Scrypta Foundation</a>.
      <br />
      <br />
    </div>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core");

export default {
  data() {
    return {
      scrypta: new ScryptaCore(true),
      address: "",
      wallet: "",
      isLogging: true,
      showScanModal: false,
      file: [],
      isCreating: false,
      isUpdating: false,
      showCreateModal: false,
      password: "",
      passwordrepeat: ""
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await app.scrypta.importBrowserSID();
    app.wallet = await app.scrypta.returnDefaultIdentity();
    if (app.wallet.length > 0) {
      let SIDS = app.wallet.split(":");
      app.address = SIDS[0];
      let identity = await app.scrypta.returnIdentity(app.address);
      app.wallet = identity;
      app.isLogging = false;
    } else {
      app.isLogging = false;
    }
  },
  methods: {
    hideScanModal() {
      const app = this
      app.showScanModal = false
    },
    onDecode (decodedString) {
      const app = this
      app.showScanModal = false
      var dataKey = decodedString

      app.$buefy.dialog.prompt({
        message: `Enter wallet password`,
        inputAttrs: {
          type: "password"
        },
        trapFocus: false,
        onConfirm: async password => {
          let key = await app.scrypta.readKey(password, dataKey);
          if (key !== false) {
            app.scrypta.importPrivateKey(key.prv, password);
            localStorage.setItem("SID", dataKey);
            location.reload();
          } else {
            app.$buefy.toast.open({
              message: "Wrong password!",
              type: "is-danger"
            });
          }
        }
      });
    },
    showScan(){
      const app = this
      app.showScanModal = true
    },
    loadWalletFromFile() {
      const app = this;
      const file = app.file;
      const reader = new FileReader();
      reader.onload = function() {
        var dataKey = reader.result;

        app.$buefy.dialog.prompt({
          message: `Enter wallet password`,
          inputAttrs: {
            type: "password"
          },
          trapFocus: false,
          onConfirm: async password => {
            let key = await app.scrypta.readKey(password, dataKey);
            if (key !== false) {
              app.scrypta.importPrivateKey(key.prv, password);
              localStorage.setItem("SID", dataKey);
              location.reload();
            } else {
              app.$buefy.toast.open({
                message: "Wrong password!",
                type: "is-danger"
              });
            }
          }
        });
      };
      reader.readAsText(file);
    },
    showCreate() {
      const app = this;
      app.showCreateModal = true;
    },
    logout() {
      localStorage.setItem("SID", "");
      location.reload();
    },
    async createUser() {
      const app = this;
      if (app.password !== "") {
        if (app.passwordrepeat === app.password) {
          app.isCreating = true;
          setTimeout(async function() {
            let id = await app.scrypta.createAddress(app.password, true);
            let identity = await app.scrypta.returnIdentity(id.pub);
            app.address = id.pub;
            app.wallet = identity;
            localStorage.setItem("SID", id.walletstore);
            app.showCreateModal = false;
            app.password = "";
            app.passwordrepeat = "";
            let tx = await app.scrypta.post("/init", {
              address: id.pub,
              airdrop: true
            });
            if (tx.airdrop_tx === false) {
              app.$buefy.toast.open({
                message: "Sorry, airdrop was not successful!",
                type: "is-danger"
              });
            }
            app.isCreating = false;
          }, 500);
        } else {
          app.$buefy.toast.open({
            message: "Passwords doesn't matches.",
            type: "is-danger"
          });
        }
      } else {
        app.$buefy.toast.open({
          message: "Write a password first!",
          type: "is-danger"
        });
      }
    }
  }
};
</script>
