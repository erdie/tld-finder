<template>
  <section class="container">
    <section class="sub__header">
      <div v-if="this.lightMode === false" class="sub__header__text">
        <p>Too dark? <a href="#">turn the light on</a></p>
        <img src="@/assets/icons/light-off.svg" alt="tld finder">
      </div>
      <div v-else class="sub__header__text">
        <p>Too bright? <a href="#">Dim the light</a></p>
        <img src="@/assets/icons/light-on.svg" alt="tld finder">
      </div>
      <input type="checkbox" class="theme-switch" v-model="lightMode"/>
    </section>
    <section class="banner">
      <a href="https://www.domainesia.com/?aff=12712" target="_blank"><img src="https://dnva.me/7af12" alt="DomaiNesia"></a>
    </section>
    <section class="header">
      <div class="header__brand">
        <img v-if="this.lightMode === false" src="@/assets/img/tld-finder.svg" alt="tld finder">
        <img v-else src="@/assets/img/tld-finder-dark.svg" alt="tld finder">
        <p>Find the top-level domains in the world and the organizations who manage it.</p>
        <small>({{ this.tldlist.length}} domain registered in <a href="https://www.iana.org/domains/root/db" target="_blank" rel="noreferrer noopener">IANA</a>)</small>
      </div>
      <div class="header__search">
        <input type="text" class="input__search" v-model="searchQuery" name="header__search" id="header__search" placeholder="Search something">
      </div>
    </section>
    <section class="result">
      <div class="result__group" v-for="getTld in filterList" :key="getTld.id">
        <div class="card">
          <div class="card__header">
            <div>
              <h2>{{getTld.domain}}</h2>
            </div>
            <div class="card__label" :class="getTld.type">
              <p>{{getTld.type}}</p>
            </div>
          </div>
          <div class="card__body">
            <p>{{getTld.tldManager}}</p>
          </div>
        </div>
      </div>
      <div v-if="filterList == 0" class="result__not-found">
        <p>Data not found</p>
      </div>
      <div v-if="filterList.length > 9" class="result__load-button">
        <button class="btn btn__primary" @click="loadMore">
          Load More
        </button>
        <small>{{this.totalSize}} data loaded</small>
      </div>
    </section>
  </section>
</template>

<script>
// import axios from "axios";
import { mapState } from 'vuex'

export default {
  name: "Search",
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_URL,
      getTldDataList: [],
      searchQuery: '',
      loadMoreSize: 10,
      totalSize: 0,
      lightMode: false,
    };
  },
  methods: {
    loadMore() {
      this.totalSize = this.loadMoreSize + this.filterList.length;
    }
  },
  computed: {
    ...mapState('tldlist', ['tldlist']),
    filterData() {
      let filtering = this.tldlist;
      // let filtering = this.$store.state.data;
      if (this.searchQuery){
          filtering = filtering.filter((getData) => {
            return getData.domain.toLowerCase().includes(this.searchQuery.toLowerCase())
            || getData.type.toLowerCase().includes(this.searchQuery.toLowerCase())
            || getData.tldManager.toLowerCase().includes(this.searchQuery.toLowerCase())
          });
      }
      return filtering;
    },
    filterList() {
      let sliceData = this.filterData;
      return sliceData.slice(0, this.totalSize);
    }
  },
  created() {
    this.$store.dispatch('tldlist/loadTld')
  },
  watch: {
    lightMode: function () {
        let htmlElement = document.documentElement;

        if (this.lightMode) {
            localStorage.setItem("theme", 'light');
            htmlElement.setAttribute('theme', 'light');
        } else {
            localStorage.setItem("theme", 'dark');
            htmlElement.setAttribute('theme', 'dark');
        }
    }
  },
  mounted() {
    this.loadMore();
    let bodyElement = document.body;
    bodyElement.classList.add("app-background");
    // check for active theme
    let htmlElement = document.documentElement;
    let theme = localStorage.getItem("theme");

    if (theme === 'dark') {
      htmlElement.setAttribute('theme', 'light')
      this.lightMode = true
    } else {
      htmlElement.setAttribute('theme', 'dark');
      this.lightMode = false
    }
  }
};
</script>

<style lang="sass" scoped>
.btn
  padding: 10px 20px
  border-radius: 5px
  outline: none
  border: none
  cursor: pointer
.btn__primary
  background-color: #FF9F0A
  color: white
  font-weight: 600
.sub__header
  text-align: right
  color: white
  display: flex
  align-items: center
  justify-content: flex-end
  margin: 15px 0
  .sub__header__text
    display: flex
    align-items: center
    flex-direction: row
  p
    margin: 0
    vertical-align: middle
    font-size: 14px
  img
    width: 22px
    height: 22px
    cursor: pointer
  a
    color: #0A84FF
.banner
  a
    img
      max-width: 100%
.header
  margin: 10px auto 40px auto
  .header__brand
    text-align: center
    img
      margin: 10px auto
    small
      margin-bottom: 10px
      display: block
  .header__search
    display: flex
    flex: 1
    position: relative
    input
      padding: 10px 15px 10px 40px
      font-size: 18px
      outline: none
      border-radius: 5px
      border: none
      width: 100%
  .header__search:before
    content: ""
    // background-image: url("~@/assets/icons/search.svg")
    background-size: 20px 20px
    width: 20px
    height: 20px
    position: absolute
    top: 10px
    left: 10px
    z-index: 2
    opacity: 0.6
.result
  .btn
    margin: 20px auto
    display: block
    font-size: 16px
  .result__group
    .card
      width: 100%
      border-radius: 5px
      margin: 10px 0
      .card__header
        display: flex
        flex-direction: row
        align-items: center
        justify-content: space-between
        padding: 5px 15px
        h2, p
          margin: 0
        .card__label
          padding: 2px 10px
          border-radius: 5px
          font-size: 13px
          font-weight: 600
          p
            margin: 0
            color: white
        .sponsored
          background-color: #FF453A
        .generic
          background-color: #0A84FF
        .country-code
          background-color: #34C759
        .generic-restricted
          background-color: #5E5CE6
      .card__body
        padding: 10px 15px
        p
          margin: 0
  .result__load-button
    text-align: center
    small
      display: block
      margin: 0 0 20px 0
</style>
