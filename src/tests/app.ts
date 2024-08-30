import { createApp } from 'vue'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// import OpenLayersMap from 'vue3-openlayers'
import 'vue3-openlayers/dist/vue3-openlayers.css'

import App from './MyPatternDemo.vue'
const app = createApp(App)

// import AppXsd from './XsdFormAdminDemo.vue'
// const app = createApp(AppXsd)

app.use(Quasar, {
  plugins: {},
})

// app.use(OpenLayersMap)

app.mount('#app')
