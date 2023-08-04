const { Router } = require('express')
const productsRouter = new Router()
const ProductManagerMongo = require('../dao/productManagerMongo')
const productManager = new ProductManagerMongo

productsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        const limit = req.query.limit

        if (products.length === 0) {
            return res.status(204).send()
        }

        if (limit) {
            const productosLimitados = products.slice(0, parseInt(limit))
            return res.status(200).json({ status: 'success', payload: productosLimitados })
        }
        return res.status(200).json({ status: 'success', payload: products })
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener los productos', message: error.message })
    }
})

productsRouter.get('/:pid', async (req, res) => {
    const pid = req.params.pid
    try {
        const product = await productManager.getProductById(pid)
        return res.status(200).json({ status: 'success', payload: product })
    } catch (error) {
        const commonErrorMessage = 'Error al obtener el producto'
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: commonErrorMessage, message: `El producto con el id ${pid} no se encuentra` })
        }
        return res.status(500).json({ error: commonErrorMessage, message: error.message });
    }
})

productsRouter.post('/', async (req, res) => {
    const newProduct = req.body;
    try {
        await productManager.addProduct(newProduct);
        return res.status(201).json({ status: 'success', message: 'Producto agregado exitosamente' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al agregar el producto', message: error.message });
    }
});

productsRouter.put('/:pid', async (req, res) => {
    const pid = req.params.pid
    const updatedProduct = req.body

    try {
        await productManager.updateProduct(pid, updatedProduct)
        return res.status(200).json({ status: 'success', message: 'Producto actualizado exitosamente' });
    } catch (error) {
        const commonErrorMessage = 'Error al actualizar el producto'
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: commonErrorMessage, message: `El producto con el id ${pid} no se encuentra` })
        }
        if (error.code === 11000) {
            return res.status(404).json({ error: commonErrorMessage, message: `El código ${updatedProduct.code} que ya se encuentra en uso` })
        }
        return res.status(500).json({ error: commonErrorMessage, message: error.message });
    }
})

productsRouter.delete('/:pid', async (req, res) => {
    const pid = req.params.pid
    try {
        await productManager.deleteProduct(pid)
        return res.status(200).json({ status: 'success', message: 'Producto borrado exitosamente' });
    } catch (error) {
        const commonErrorMessage = 'Error al borrar el producto'
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: commonErrorMessage, message: `El producto con el id ${pid} no se encuentra` })
        }
        return res.status(500).json({ error: commonErrorMessage, message: error.message });
    }
})

module.exports = productsRouter