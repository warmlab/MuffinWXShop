const addToShoppingCart = (product, size, amount) => {
	// add product to cart
	var added = false
	var  price
	if (product.in_promote)
		price = product.promote_price
	else
		price = product.price

	var cart = syncCart()
	for (var p of cart.products) {
		if (!p.want_size)
			p.want_size = 0
		if (!p.want_amount)
			p.want_amount = 0
		console.log('product in cart', p.want_size, 'product adding', size)
		if (!!p.want_size && !!size && p.id === product.id && p.want_size.size.id === size.size.id) {
			p.want_amount += amount
			p.checked = true
			cart.amount += amount
			cart.cost += (price + size.price_plus) * amount
			added = true
			break
		}

		if (p.id === product.id && !p.want_size && !size) {
			p.want_amount += amount
			p.checked = true
			p.in_promote = !!product.in_promote
			cart.amount += amount
			cart.cost += price * amount
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
			cart.cost += (price + size.price_plus) * product.want_amount
		else
			cart.cost += price * product.want_amount
	}

	console.log('cart', cart)
	wx.setStorageSync('cart', cart)
	//that.setData({
	//	cart: cart
	//})
}

const syncCart = () => {
	var cart = wx.getStorageSync('cart')
	if (cart === undefined || typeof cart !== "object") {
		cart = {
			products: [],
			amount: 0,
			cost: 0,
			checked_num: 0
		}
		wx.setStorageSync('cart', cart)
	}

	cart.cost = 0
	cart.amount = 0
	cart.checked_num = 0
	cart.products.forEach(ele => {
		var price
		if (ele.in_promote)
			price = ele.promote_price
		else
			price = ele.price
		if (ele.checked) {
			if (ele.want_size)
				cart.cost += (price + ele.want_size.price_plus) * ele.want_amount
			else
				cart.cost += price * ele.want_amount
			cart.amount += ele.want_amount
			cart.checked_num++
		}
	})

	return cart
}

export {
	addToShoppingCart,
	syncCart
}
