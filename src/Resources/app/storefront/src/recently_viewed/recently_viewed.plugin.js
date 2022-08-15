import Plugin from 'src/plugin-system/plugin.class';
import StorageSingleton from 'src/helper/storage/storage.helper';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';

export default class RecentlyViewedPlugin extends Plugin {
	static options = { storageName: 'buildit_recently_viewed_storage', ttl: 86400000, isCookieAllowed: false };

	init() {
		this.setup();
		this.addListeners();
	}

	setup() {
		this.storage = StorageSingleton;
		document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this.onUpdate.bind(this));
	}

	isCookieAllowed() {
		return this.storage.getItem(this.options.storageName) !== null;
	}

	addListeners() {
		if (!this.isCookieAllowed()) {
			return;
		}
		const productMain = document.getElementsByClassName('product-detail');
		if (productMain.length > 0) {
			this.updateView();
			const name = document.querySelector('.product-detail-name').innerText;
			const imageURL = document.querySelector('#tns1-item0')
				? document.querySelector('#tns1-item0 img').src
				: document.querySelector('.product-detail-media img').src;
			const link = document.location.href;
			let price = '';
			if (document.querySelector('meta[itemprop="lowPrice"]')) {
				const priceRaw = document.querySelector('meta[itemprop="lowPrice"]').content.replace(/\D/g, '');
				for (let priceElement of document.querySelectorAll('.product-block-prices-cell div')) {
					if (priceElement.innerHTML.replace(/\D/g, '').includes(priceRaw)) {
						price = this.el.dataset.fromText + ' ' + priceElement.innerHTML.trim();
					}
				}
			} else {
				price = document.querySelector('.product-detail-price').innerText;
			}
			const now = new Date();
			const obj = {
				name: name,
				image: imageURL,
				link: link,
				price: price,
				expiry: now.getTime() + this.options.ttl,
			};

			const recentlyViewed = this.getFromStorage() || [];
			const exists = recentlyViewed.filter(r => r.name === name).length > 0;
			if (!exists || (exists && recentlyViewed.at(-1).name !== name)) {
				if (recentlyViewed.length >= 5) {
					recentlyViewed.shift();
				}
				recentlyViewed.push(obj);
				this.addToStorage(recentlyViewed);
			}

			this.updateView();
		}
	}

	addToStorage(value) {
		return value
			? this.storage.setItem(this.options.storageName, JSON.stringify(value))
			: this.storage.removeItem(this.options.storageName);
	}

	getFromStorage() {
		let value = null;
		const now = new Date();
		if (this.isCookieAllowed()) {
			value = JSON.parse(this.storage.getItem(this.options.storageName));
		}
		const checkedValue = value ? value.filter(v => v.expiry >= now.getTime()) : [];
		if (checkedValue.length < 1) {
			this.addToStorage(null);
			return [];
		} else {
			return value;
		}
	}

	onUpdate(eventData) {
		if (eventData.detail[this.options.storageName]) {
			this.hasCookieAllowed = true;
			this.storage.setItem(this.options.storageName, JSON.stringify([]));
		}
	}

	updateView() {
		const recentlyViewed = this.getFromStorage();
		if (recentlyViewed && recentlyViewed.length >= 1) {
			document.querySelector('.buildit_recently_viewed_tabs').style.display = 'block';
			document
				.querySelector('.product-detail-recently-viewed-text')
				.querySelectorAll('*')
				.forEach(n => n.remove());
			for (let product of recentlyViewed) {
				let entry = document.createElement('div');
				entry.className = 'recently_viewed_wrapper';
				entry.innerHTML = `
                    <a href="${product.link}" title="${product.name}" alt="${product.name}" title="${product.name}">
                        <img src="${product.image}" title="${product.name}" alt="${product.name}" title="${product.name}">
                    </a>
                    <a href="${product.link}" class="product-name" title="${product.name}" alt="${product.name}" title="${product.name}">
                        ${product.name}
                    </a>
                    <p class="product-price">${product.price}</p>`;
				document.querySelector('.product-detail-recently-viewed-text').appendChild(entry);
			}
		} else {
			document.querySelector('.buildit_recently_viewed_tabs').style.display = 'none';
		}
	}
}
