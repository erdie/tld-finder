<template>
  <section>
    <Search />
  </section>
</template>

<script>
import Search from "@/components/Search.vue";

export default {
  name: "Home",
  components: {
    Search
  },
  metaInfo: {
    title: 'TLD Finder',
    titleTemplate: 'TLD Finder',
    meta: [
      { charset: 'utf-8' },
      { hid: 'description', name: 'description', content: 'Find the top-level domains in the world and the organizations who manage it.' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://tld-finder.erdi.my.id',
      },
      {
        property: 'og:title',
        content: 'TLD Finder',
      },
      {
        property: 'og:description',
        content: 'Find the top-level domains in the world and the organizations who manage it.',
      },
      {
        property: 'og:image',
        content: 'https://tld-finder.erdi.my.id/tld-finder-og.png',
      },
      // {
      //     property: 'fb:app_id',
      //     content: '988591554889425',
      // },
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        property: 'twitter:url',
        content: 'https://tld-finder.erdi.my.id',
      },
      {
        property: 'twitter:title',
        content: 'TLD Finder',
      },
      {
        property: 'twitter:description',
        content: 'Find the top-level domains in the world and the organizations who manage it.',
      },
      {
        property: 'twitter:image',
        content: 'https://tld-finder.erdi.my.id/tld-finder-og.png',
      },
    ]
  },
};
</script>
