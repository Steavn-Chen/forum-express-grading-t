const { Category } = require('../models')

const categoryServices = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        cb(null, {
          categories,
          category
        })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({
      name: req.body.name
    })
      .then(newCategory =>
        cb(null, { category: newCategory })
      )
      .catch(err => cb(err))
  },
  deleteCategories: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.destroy()
      })
      .then(deleteCategory => cb(null, { category: deleteCategory }))
      .catch(err => cb(err))
  }
}

module.exports = categoryServices
