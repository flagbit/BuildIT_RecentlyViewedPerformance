import Plugin from 'src/plugin-system/plugin.class';
import StorageSingleton from 'src/helper/storage/storage.helper';

export default class RecentlyViewedPlugin extends Plugin {
	static options = { storageName: 'buildit_recently_viewed_storage' };

	init() {
		this.setup();
		this.addListeners();
	}

	setup() {
		this.storage = StorageSingleton;
	}

	addListeners() {
		const productMain = document.getElementsByClassName('product-detail');
		if (productMain.length > 0) {
			const name = document.querySelector('.product-detail-name').innerText;
			const imageURL = document.querySelector('#tns1-item0')
				? document.querySelector('#tns1-item0 img').src
				: document.querySelector('.product-detail-media img').src;
			const link = document.location.href;
			let price = '';
			if (document.querySelector('meta[itemprop="lowPrice"]')) {
				const priceRaw = document.querySelector('meta[itemprop="lowPrice"]').content;
				for (let priceElement of document.querySelectorAll('.product-block-prices-cell div')) {
					if (priceElement.innerHTML.includes(priceRaw)) {
						price = this.el.dataset.fromText + ' ' + priceElement.innerHTML.trim();
					}
				}
			} else {
				price = document.querySelector('.product-detail-price').innerText;
			}

			const obj = { name: name, image: imageURL, link: link, price: price };

			const recentlyViewed = JSON.parse(this.storage.getItem(this.options.storageName)) || [];
			const exists = recentlyViewed.filter(r => r.name === name).length > 0;
			if (!exists || (exists && recentlyViewed.at(-1).name !== name)) {
				if (recentlyViewed.length >= 5) {
					recentlyViewed.shift();
				}
				recentlyViewed.push(obj);
				this.storage.setItem(this.options.storageName, JSON.stringify(recentlyViewed));
			}

			this.updateView();
		}
	}

	updateView() {
		const recentlyViewed = JSON.parse(this.storage.getItem(this.options.storageName));
		if (recentlyViewed.length >= 1) {
			for (let product of recentlyViewed) {
				let entry = document.createElement('div');
				entry.className = 'recently_viewed_wrapper';
				entry.innerHTML = `
                    <a href="${product.link}">
                        <img src="${product.image}">
                    </a>
                    <a href="${product.link}" class="product-name" title="${product.name}">
                        ${product.name}
                    </a>
                    <p class="product-price">${product.price}</p>`;
				document.querySelector('.product-detail-recently-viewed-text').appendChild(entry);
			}
		}
	}
}
