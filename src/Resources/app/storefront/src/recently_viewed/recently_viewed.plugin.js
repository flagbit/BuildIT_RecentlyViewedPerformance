import Plugin from 'src/plugin-system/plugin.class';
import StorageSingleton from 'src/helper/storage/storage.helper';
import HttpClient from 'src/service/http-client.service';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';

export default class RecentlyViewedPlugin extends Plugin {
	static options = {
		storageName: 'buildit_recently_viewed_storage',
		ttl: 86400000,
		isCookieAllowed: false,
		product: null,
		maxAmount: 12,
		csrfToken: '',
	};

	init() {
		this._client = new HttpClient();
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
		const productMain = document.getElementsByClassName('product-detail');

		this.initViewUpdate();

		if (productMain.length > 0) {
			if (this.options.product) {
				this.addProductToStorage(this.options.product)
			}
		}
	}

	createNewStorageObj(product) {
		const now = new Date();

		return {
			id: product.id,
			parentId: product.parentId || null,
			expiry: now.getTime() + this.options.ttl,
		};
	}

	addProductToStorage(product) {
		const obj = this.createNewStorageObj(product);
		let recentlyViewed = this.getFromStorage();

		const existIdx = recentlyViewed.findIndex(r => r.id === obj.id);

		// remove current always, so we can add it again at last index
		// Keep in mind that the array is reversed. index 0 is the oldest!
		if (existIdx >= 0) {
			recentlyViewed.splice(existIdx, 1);
		}

		// same as above, but for parent
		if (obj.parentId !== null) {
			recentlyViewed = recentlyViewed.filter(r => {
				return r.parentId !== obj.parentId
			});
		}

		if (recentlyViewed.length >= this.options.maxAmount) {
			recentlyViewed.shift();
		}

		recentlyViewed.push(obj);
		this.addToStorage(recentlyViewed);
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
			return value || [];
		}
	}

	onUpdate(eventData) {
		if (eventData.detail[this.options.storageName]) {
			this.hasCookieAllowed = true;
			this.storage.setItem(this.options.storageName, JSON.stringify([]));
		}
	}

	requestWidget(recentlyViewed) {
		const pIds = [];
		for (const product of recentlyViewed) {
			pIds.push(product.id);
		}

		const params = {
			products: pIds
		};

		if (window.csrf.enabled && window.csrf.mode === 'twig') {
			params['_csrf_token'] = this.options.csrfToken;
		}

		this._client.post(
			`/widget/recentlyviewed`,
			JSON.stringify(params),
			this.callback.bind(this),
		);
	}

	initViewUpdate() {
		const recentlyViewed = this.getFromStorage();

		if (recentlyViewed && recentlyViewed.length >= 1) {
			this.requestWidget(recentlyViewed);
		}
	}

	callback(widgetResponse, request) {
		if (request.status === 200) {
			const element = document.getElementById('flagbit-recently-viewed-products-container');
			if (element) {
				element.innerHTML = widgetResponse;
			}
		} else {
			console.error('Recently Viewed Products Slider Error ' + request.status);
		}
	}
}
