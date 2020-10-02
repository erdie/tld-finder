import axios from 'axios'

const tldlist = {
  namespaced: true,
  state: {
    tldlist: []
  },
  mutations: {
    SET_ALL_TLD_DATA: (state, data) => {
      state.tldlist = data
    }
  },
  actions: {
    loadTld({commit}) {
      axios
        .get(process.env.VUE_APP_BASE_URL + 'iana-tld.json')
        .then(res =>{
          commit('SET_ALL_TLD_DATA', res.data)
        })
        .catch(error => console.log(error))
    }
  },
}

export default tldlist
