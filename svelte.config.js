const ghPages = process.env.NODE_ENV === 'production';
import adapter from '@sveltejs/adapter-auto';
import {sveltePreprocess} from 'svelte-preprocess';

const config = {
  kit: {
    paths: {
      base: ghPages ? '/grably-frontend' : '',
    },
    adapter: adapter()
  },
  preprocess: sveltePreprocess(),

};

export default config;