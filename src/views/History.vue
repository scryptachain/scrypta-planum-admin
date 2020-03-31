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
          <b-table
            v-if="transactions.length > 0"
            :data="transactions"
            :paginated="isPaginated"
            :per-page="perPage"
            :current-page.sync="currentPage"
            :pagination-simple="isPaginationSimple"
            :pagination-position="paginationPosition"
            :default-sort-direction="defaultSortDirection"
            :sort-icon="sortIcon"
            :sort-icon-size="sortIconSize"
            default-sort="user.first_name"
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page">

            <template slot-scope="props">

                <b-table-column label="Indirizzo di partenza" width="40" sortable searchable>
                  <span v-if="props.row.from === user.identity.address">
                    AMMINISTRATORE
                  </span>
                  <span v-if="props.row.from !== user.identity.address && props.row.from !== user.address">
                    {{ props.row.from }}
                  </span>
                </b-table-column>

                <b-table-column label="Indirizzo di destinazione" searchable sortable>
                  <span v-if="props.row.to === user.identity.address">
                    AMMINISTRATORE
                  </span>
                  <span v-if="props.row.to === user.address">
                    <span v-if="user.name !== ''">{{ user.name }}</span>
                    <span v-if="user.name === ''">Utente</span>
                  </span>
                  <span v-if="props.row.to !== user.identity.address && props.row.to !== user.address">
                    {{ props.row.to }}
                  </span>
                </b-table-column>

                <b-table-column label="Ammontare" searchable sortable>
                    {{ props.row.amount }} {{ user.owner[user.chain].genesis.symbol }}
                </b-table-column>

                <b-table-column label="Identificativo transazione" sortable>
                    {{ props.row.sxid.substr(0,4) }}...{{ props.row.sxid.substr(-4) }}
                </b-table-column>

                <b-table-column label="Blocco" searchable sortable>
                    {{ props.row.block }}
                </b-table-column>
            </template>
          </b-table>
          <p v-if="transactions.length === 0">Non ci sono ancora transazioni.</p>
          <vue-csv-downloader
            :data="transactions"
            :fields="fields"
          > 
            <b-button v-if="transactions.length > 0" type="is-primary" style="float:left; margin-top:-60px;" size="is-normal">SCARICA BACKUP</b-button>
          </vue-csv-downloader>
        </div>
      </div>
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
      isPaginated: true,
      isPaginationSimple: false,
      paginationPosition: 'bottom',
      defaultSortDirection: 'asc',
      sortIcon: 'arrow-up',
      sortIconSize: 'is-small',
      currentPage: 1,
      perPage: 15,
      transactions: [],
      fields: ['sxid', 'from', 'to', 'amount', 'block'],
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
    let response = await app.scrypta.post('/sidechain/scan', { sidechain_address: app.user.chain })
    let transactions = [];
    for (let x in response.data) {
      let value = 0;
      let to = "";
      for (let y in response.data[x].transaction.outputs) {
        if (y != response.data[x]["address"]) {
          value += response.data[x].transaction.outputs[y];
          to = y;
        }
      }
      if(to === ""){
        for (let y in response.data[x].transaction.outputs) {
          value += response.data[x].transaction.outputs[y];
          to = y;
        }
      }
      let from = "";
      if (response.data[x].transaction["inputs"][0]['vout'] === 'genesis') {
        from = 'GENESIS'
      }else if(response.data[x].transaction["inputs"][0]['vout'] === 'reissue') {
        from = 'REISSUE'
      }else{
        from = response.data[x]["address"]
      }
      if(from !== undefined){
        let Block
        if(response.data[x].block > 0){
          Block = response.data[x].block
        }else{
          Block = 'unconfirmed'
        }
        let transaction = {
          sxid: response.data[x].sxid,
          amount: value,
          from: from,
          to: to,
          block: Block
        };
        transactions.push(transaction);
      }
    }
    app.transactions = transactions;
  }
};
</script>