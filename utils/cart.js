const addToShoppingCart = (that, product, size, amount) => {
	// add product to cart
	var added = false

	var cart = that.data.cart
	for (var p of cart.products) {
		if (!p.want_size)
			p.want_size = 0
		console.log('product in cart', p.want_size, 'product adding', size)
		if (!!p.want_size && !!size && p.id === product.id && p.want_size.size.id === size.size.id) {
			p.want_amount += amount
			p.checked = true
			cart.amount += amount
			cart.cost += (p.price + size.price_plus) * amount
			added = true
			break
		}
		console.log('cccccdddddddddddddddddddddddddddddddddddddddd')
		if (p.id === product.id && !p.want_size && !size) {
			p.want_amount += amount
			p.checked = true
			cart.amount += amount
			cart.cost += p.price * amount
			added = true
			break
		}
	}

	if (!added) {
		product.want_amount = amount
		product.want_size = size
		product.checked = true
		cart.products.push(product)
		cart.amount += amount
		if (size)
			cart.cost += (product.price + size.price_plus) * product.want_amount
		else
			cart.cost += product.price * product.want_amount
	}
	console.log('cart', cart)
	wx.setStorageSync('cart', cart)
	that.setData({
		cart: cart
	})
}

const syncCart = () => {
	var cart = wx.getStorageSync('cart')
	if (cart === undefined || typeof cart !== "object") {
		cart = {
			products: [],
			amount: 0,
			cost: 0
		}
		wx.setStorageSync('cart', cart)
	}

	cart.cost = 0
	cart.amount = 0
	cart.products.forEach(ele => {
		if (ele.checked) {
			if (ele.want_size)
				cart.cost += (ele.price + ele.want_size.price_plus) * ele.want_amount
			else
				cart.cost += ele.price * ele.want_amount
			cart.amount += ele.want_amount
		}
	})

	return cart
}

export {
	addToShoppingCart,
	syncCart
}
