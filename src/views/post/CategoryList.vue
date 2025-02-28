<template>
  <page-view>
    <a-row :gutter="12">
      <a-col :lg="8" :md="8" :sm="24" :xl="8" :xs="24" class="pb-3">
        <a-card :bodyStyle="{ padding: '16px' }" :head-style="{ padding: '8px 16px!important' }" :title="title">
          <a-form-model ref="categoryForm" :model="form.model" :rules="form.rules" layout="horizontal">
            <a-form-model-item help="* 页面上所显示的名称" label="名称：" prop="name">
              <a-input ref="nameInput" v-model="form.model.name" />
            </a-form-model-item>
            <a-form-model-item help="* 一般为单个分类页面的标识，最好为英文" label="别名：" prop="slug">
              <a-input v-model="form.model.slug" />
            </a-form-model-item>
            <a-form-model-item label="上级目录：" prop="parentId">
              <category-select-tree :categories="list.data" :category-id.sync="form.model.parentId" />
            </a-form-model-item>
            <a-form-model-item help="* 在分类页面可展示，需要主题支持" label="封面图：" prop="thumbnail">
              <AttachmentInput v-model="form.model.thumbnail" title="选择封面图" />
            </a-form-model-item>
            <a-form-model-item help="* 分类密码" label="密码：" prop="password">
              <a-input-password v-model="form.model.password" autocomplete="new-password" />
            </a-form-model-item>
            <a-form-model-item help="* 排序" label="权重：" prop="priority">
              <a-input v-model="form.model.priority" />
            </a-form-model-item>
            <a-form-model-item help="* 分类描述，需要主题支持" label="描述：" prop="description">
              <a-input v-model="form.model.description" :autoSize="{ minRows: 3 }" type="textarea" />
            </a-form-model-item>
            <a-form-model-item>
              <ReactiveButton
                v-if="!isUpdateMode"
                :errored="form.errored"
                :loading="form.saving"
                erroredText="保存失败"
                loadedText="保存成功"
                text="保存"
                type="primary"
                @callback="handleSavedCallback"
                @click="handleCreateOrUpdateCategory"
              ></ReactiveButton>
              <a-button-group v-else>
                <ReactiveButton
                  :errored="form.errored"
                  :loading="form.saving"
                  erroredText="更新失败"
                  loadedText="更新成功"
                  text="更新"
                  type="primary"
                  @callback="handleSavedCallback"
                  @click="handleCreateOrUpdateCategory"
                ></ReactiveButton>
                <a-button type="dashed" @click="form.model = {}">返回添加</a-button>
              </a-button-group>
            </a-form-model-item>
          </a-form-model>
        </a-card>
      </a-col>
      <a-col :lg="16" :md="16" :sm="24" :xl="16" :xs="24" class="pb-3">
        <a-card :bodyStyle="{ padding: '16px' }" title="分类列表">
          <template #extra>
            <ReactiveButton
              :disabled="list.data.length <= 0"
              :errored="formBatch.errored"
              :loading="formBatch.saving"
              erroredText="保存失败"
              loadedText="保存成功"
              text="保存"
              @callback="formBatch.errored = false"
              @click="handleUpdateBatch"
            ></ReactiveButton>
          </template>
          <a-spin :spinning="list.loading">
            <a-empty v-if="list.data.length === 0" />
            <CategoryTreeNode
              v-model="list.treeData"
              @edit="handleEdit"
              @reload="handleListCategories"
              @select="handleSelect"
            />
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </page-view>
</template>

<script>
// components
import { PageView } from '@/layouts'
import CategorySelectTree from '@/components/Category/CategorySelectTree'
import CategoryTreeNode from '@/components/Category/CategoryTreeNode'

// libs
import apiClient from '@/utils/api-client'
import { mixin, mixinDevice } from '@/mixins/mixin.js'

export default {
  components: { PageView, CategorySelectTree, CategoryTreeNode },
  mixins: [mixin, mixinDevice],
  data() {
    return {
      list: {
        data: [],
        treeData: [],
        loading: false
      },
      form: {
        model: {},
        saving: false,
        errored: false,
        rules: {
          name: [
            { required: true, message: '* 分类名称不能为空', trigger: ['change'] },
            { max: 255, message: '* 分类名称的字符长度不能超过 255', trigger: ['change'] }
          ],
          slug: [{ max: 255, message: '* 分类别名的字符长度不能超过 255', trigger: ['change'] }],
          thumbnail: [{ max: 1023, message: '* 封面图链接的字符长度不能超过 1023', trigger: ['change'] }],
          description: [{ max: 100, message: '* 分类描述的字符长度不能超过 100', trigger: ['change'] }]
        }
      },
      formBatch: {
        saving: false,
        errored: false
      }
    }
  },
  computed: {
    title() {
      if (this.isUpdateMode) {
        return '修改分类'
      }
      return '添加分类'
    },
    isUpdateMode() {
      return !!this.form.model.id
    }
  },
  created() {
    this.handleListCategories()
  },
  methods: {
    async handleListCategories() {
      try {
        this.list.loading = true

        const { data } = await apiClient.category.list({})
        this.list.data = data
        this.list.treeData = this.convertDataToTree(data)
      } catch (e) {
        this.$log.error('Failed to get categories', e)
      } finally {
        this.list.loading = false
      }
    },

    convertDataToTree(categories) {
      const hashMap = {}
      const treeData = []
      categories.forEach(category => (hashMap[category.id] = { ...category, children: [] }))
      categories.forEach(category => {
        const current = hashMap[category.id]
        if (category.parentId) {
          hashMap[category.parentId].children.push(current)
        } else {
          treeData.push(current)
        }
      })

      // set hasPassword field for tree node
      const setHasPasswordField = (categories, hasPassword = false) => {
        categories.forEach(category => {
          category.hasPassword = !!category.password || hasPassword
          if (category.children && category.children.length) {
            setHasPasswordField(category.children, category.hasPassword)
          }
        })
      }
      setHasPasswordField(treeData)
      return treeData
    },

    async handleEdit(category) {
      try {
        const { data } = await apiClient.category.get(category.id)
        this.$refs.categoryForm.clearValidate()
        this.form.model = data

        this.$refs.nameInput.focus()
      } catch (e) {
        this.$log.error('Failed to get category', e)
      }
    },

    handleSelect(category) {
      this.form.model = {
        parentId: category.id
      }
      this.$refs.nameInput.focus()
    },

    /**
     * Create or update a category.
     */
    handleCreateOrUpdateCategory() {
      const _this = this
      _this.$refs.categoryForm.validate(valid => {
        if (valid) {
          _this.form.saving = true
          if (_this.isUpdateMode) {
            apiClient.category
              .update(_this.form.model.id, _this.form.model)
              .catch(() => {
                this.form.errored = true
              })
              .finally(() => {
                setTimeout(() => {
                  _this.form.saving = false
                }, 400)
              })
          } else {
            apiClient.category
              .create(this.form.model)
              .catch(() => {
                this.form.errored = true
              })
              .finally(() => {
                setTimeout(() => {
                  _this.form.saving = false
                }, 400)
              })
          }
        }
      })
    },

    async handleUpdateBatch() {
      // tree to flat list
      const toFlatList = (data, parentId = 0) => {
        if (!data || data.length === 0) return []
        return data.reduce((prev, current, index) => {
          current.priority = index + 1
          current.parentId = parentId
          const children = current.children.length > 0 ? toFlatList(current.children, current.id) : []
          return [...prev, current, ...children]
        }, [])
      }

      const categoriesToStage = toFlatList(this.list.treeData)

      try {
        this.formBatch.saving = true
        await apiClient.category.updateInBatch(categoriesToStage)
      } catch (e) {
        this.formBatch.errored = true
        this.$log.error('Failed to update categories', e)
      } finally {
        setTimeout(() => {
          this.formBatch.saving = false
          this.handleListCategories()
        }, 400)
      }
    },

    handleSavedCallback() {
      if (this.form.errored) {
        this.form.errored = false
      } else {
        const _this = this
        _this.form.model = {}
        _this.handleListCategories()
      }
    },

    handleQueryCategoryPosts(category) {
      this.$router.push({ name: 'PostList', query: { categoryId: category.id } })
    }
  }
}
</script>
