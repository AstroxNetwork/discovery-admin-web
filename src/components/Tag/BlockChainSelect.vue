<template>
  <a-select
    v-model="selectedTagNames"
    :token-separators="[',', '|']"
    allowClear
    class="w-full"
    mode="tags"
    placeholder="选择或输入标签"
    @change="handleChange"
  >
    <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.name">{{ tag.name }}</a-select-option>
  </a-select>
</template>

<script>
import apiClient from '@/utils/api-client'
import axios from 'axios'
// import { queryNetworkList } from '@/utils/http/oper'

export default {
  name: 'BlockChainSelect',
  model: {
    prop: 'tagIds',
    event: 'change'
  },
  props: {
    tagIds: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      tags: [],
      selectedTagNames: []
    }
  },
  created() {
    this.handleListTags()
  },
  watch: {
    tags(newValue) {
      if (newValue) {
        console.log('tags', this.tagIds)
        this.selectedTagNames = this.tagIds.map(tagId => this.tagIdMap[tagId].name)
      }
    },
    tagIds: {
      handler(newValue) {
        if (!this.tags.length) {
          return
        }
        console.log('tagsIds', this.tagIds)
        this.selectedTagNames = newValue.map(tagId => this.tagIdMap[tagId].name)
      },
      deep: true
    }
  },
  computed: {
    tagIdMap() {
      const tagIdMap = {}
      this.tags.forEach(tag => {
        tagIdMap[tag.id] = tag
      })
      return tagIdMap
    },
    tagNameMap() {
      const tagNameMap = {}
      this.tags.forEach(tag => {
        tagNameMap[tag.name] = tag
      })
      return tagNameMap
    }
  },
  methods: {
    handleListTags(callback) {
      console.log('blockchain handleListTags')
      this.tags = [
        { name: 'IC', id: 'IC' },
        { name: 'Ethereum', id: 'homestead' },
        // { name: 'Goerli', id: 'goerli', test: true },
        { name: 'Polygon', id: 'matic' },
        // { name: 'Polygon Mumbai', id: 'maticmum', test: true },
        { name: 'BNB Smart Chain', id: 'bsc' },
        // { name: 'Binance Smart Chain Testnet', id: 'bsc-testnet', test: true },
        { name: 'Arbitrum One', id: 'arbitrum' },
        // { name: 'Arbitrum Goerli', id: 'arbitrum-goerli', test: true },
        { name: 'Avalanche', id: 'avalanche' },
        // { name: 'Avalanche Fuji', id: 'avalanche-fuji', test: true },
        { name: 'Optimism', id: 'optimism' },
        { name: 'Linea', id: 'linea' },
        { name: 'zkSync Era', id: 'zksync' },
        { name: 'Base Mainnet', id: 'base-mainnet' }
        // { name: 'Optimism-Goerli', id: 'optimism-goerli', test: true },
        // { name: 'localhost', value: 'localhost', test: true }
      ]
      if (callback) {
        callback()
      }
      // queryNetworkList({ pageNum: 1, pageSize: 1000, status: '1' }).then(response => {
      //   this.tags = response.data.list
      //   if (callback) {
      //     callback()
      //   }
      // })

      // apiClient.tag.list({ sort: 'name,asc', more: true }).then(response => {
      //   this.tags = response.data
      //   if (callback) {
      //     callback()
      //   }
      // })
    },
    handleChange() {
      const tagNamesToCreate = this.selectedTagNames.filter(tagName => !this.tagNameMap[tagName])

      this.$log.debug('Tag names to create', tagNamesToCreate)

      if (!tagNamesToCreate.length) {
        const tagIds = this.selectedTagNames.map(tagName => this.tagNameMap[tagName].id)
        this.$emit('change', tagIds)
        return
      }

      const createPromises = tagNamesToCreate.map(tagName => apiClient.tag.create({ name: tagName }))

      axios.all(createPromises).then(
        axios.spread(() => {
          this.handleListTags(() => {
            this.$log.debug('Tag name map', this.tagNameMap)
            // Get all tag id
            const tagIds = this.selectedTagNames.map(tagName => this.tagNameMap[tagName].id)
            this.$emit('change', tagIds)
          })
        })
      )
    }
  }
}
</script>
