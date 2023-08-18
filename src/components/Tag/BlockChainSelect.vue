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
        this.selectedTagNames = this.tagIds.map(tagId => this.tagIdMap[tagId].name)
      }
    },
    tagIds: {
      handler(newValue) {
        if (!this.tags.length) {
          return
        }
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
        { name: 'IC', value: 'IC' },
        { name: 'Ethereum', value: 'homestead' },
        // { name: 'Goerli', value: 'goerli', test: true },
        { name: 'Polygon', value: 'matic' },
        // { name: 'Polygon Mumbai', value: 'maticmum', test: true },
        { name: 'BNB Smart Chain', value: 'bsc' },
        // { name: 'Binance Smart Chain Testnet', value: 'bsc-testnet', test: true },
        { name: 'Arbitrum One', value: 'arbitrum' },
        // { name: 'Arbitrum Goerli', value: 'arbitrum-goerli', test: true },
        { name: 'Avalanche', value: 'avalanche' },
        // { name: 'Avalanche Fuji', value: 'avalanche-fuji', test: true },
        { name: 'Optimism', value: 'optimism' }
        // { name: 'Optimism-Goerli', value: 'optimism-goerli', test: true },
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
        const tagIds = this.selectedTagNames.map(tagName => this.tagNameMap[tagName].value)
        this.$emit('change', tagIds)
        return
      }

      const createPromises = tagNamesToCreate.map(tagName => apiClient.tag.create({ name: tagName }))

      axios.all(createPromises).then(
        axios.spread(() => {
          this.handleListTags(() => {
            this.$log.debug('Tag name map', this.tagNameMap)
            // Get all tag id
            const tagIds = this.selectedTagNames.map(tagName => this.tagNameMap[tagName].value)
            this.$emit('change', tagIds)
          })
        })
      )
    }
  }
}
</script>
