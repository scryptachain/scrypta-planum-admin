<template>
  <div class="main">
    <div class="container">
      <div v-if="user.chain !== '-' && user.owner[user.chain] !== undefined">
        <v-gravatar :email="user.identity.address" style="float:left; margin-right:20px; width:75px; height:75px;"/>
        <h1>Dashboard</h1>
        <h3>{{ user.owner[user.chain].genesis.name }} ({{ user.owner[user.chain].genesis.symbol }})</h3>
        <hr>
      </div>
      <div class="columns">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ users.length }}
              </p>
              <p class="subtitle">
                Totale utenti
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                0
              </p>
              <p class="subtitle">
                Utenti attivi
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                0
              </p>
              <p class="subtitle">
                Token in circolazione
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core")
import User from '../libs/user.js'
import ScryptaDB from '../libs/db.js'

export default {
  data() {
    return {
      db: new ScryptaDB(true, ['users', 'settings']),
      scrypta: new ScryptaCore(true),
      users: [],
      user: {
        owner: {
          '-': {
            genesis: {
              name: '-',
              symbol: '-'
            }
          }
        },
        chain: '',
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
  },
  methods: {

  }
};
</script>