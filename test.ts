import {Vue} from 'nuxt-property-decorator'
import Header from '../components/shared/header/header.vue'
import MainFooter from '../components/shared/footer/footer.vue'
import BlockDistributor from '~/components/shared/product-item/block-distributor.vue'
import PageBreadcrumbs from '~/components/shared/breadcrumbs.vue'
import BannerGroup from '~/components/listings/banner-group.vue'
import ListingLoader from '~/components/listings/listing-loader.vue'
import {Publishable} from '~/plugins/vrc-api-client/src/model/publishable'
import {Product} from '~/plugins/vrc-api-client/src/model/product'
import {ProductsDistribution} from '~/model/products'
import {GTMListing} from '~/plugins/events-manager/src/model/google-tag-manager'
import {ListingLoaderType} from '~/model/listing-loader'
import {BlockSeparator} from '~/model/block-separator'
import {BlockNativeAd} from '~/model/block-native-ad'
import PublishingFilterEnum = Publishable.PublishingFilterEnum

export default Vue.extends({
  components: { BlockDistributor, Header, MainFooter, PageBreadcrumbs, BannerGroup, ListingLoader },
  data () {
    return {
      listingLoaderType: ListingLoaderType.FILTERED,
      showListingLoader: true,
      blocks: [] as Array<Product | BlockSeparator | BlockNativeAd>,
      productsDistribution: ProductsDistribution.DOUBLE,
      gtmListingCode: GTMListing.FAVOURITES,
      showGroupOfBanners: false
    }
  },
  watch: {
    $route () {
      this.getFavouriteProducts()
    }
  },
  mounted () {
    this.getFavouriteProducts()
  },
  methods: {
    async getFavouriteProducts () {
      try {
        this.$nextTick(() => { this.showListingLoader = true })
        this.blocks = []
        const favourites = await this.$vrc().users().favourites(PublishingFilterEnum.ANY, this.$criterions().getProductListFilter())
        this.blocks = this.$blocks().addNeededBlocks(favourites.published.concat(favourites.tonight).concat(favourites.planned).concat(favourites.expired))
        this.showListingLoader = false
        this.showGroupOfBanners = this.blocks.length === 0
        this.$store.commit('criterion/SET_VISIBLE', {
          thematics: favourites.thematics,
          labels: favourites.labels,
          destinations: favourites.destinations,
          language: this.$store.state.user.profile.language
        })
        this.$UtilsMixin().scrollToTop()
        await this.$map().setMapMarkers(this.blocks)
      } catch (err) {
        this.showListingLoader = false
        this.showGroupOfBanners = true
        await this.$map().setMapMarkers([])
        console.error('getFavouriteProducts \n', err)
      }
    }
  },
  head () {
    return {
      title: `${this.$t('meta.default.title')}`,
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex, follow' },
        { hid: 'description', name: 'description', content: `${this.$t('meta.default.description')}` }
      ]
    }
  }
})