<template>
  <div class="main">
    <div class="container">
      <div v-if="user.chain !== '-' && user.owner[user.chain] !== undefined">
        <h1>Storico transazioni</h1>
        <h3>{{ user.owner[user.chain].genesis.name }} ({{ user.owner[user.chain].genesis.symbol }})</h3>
        <hr>
      </div>
      <div class="columns">
        <div class="column">
        
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