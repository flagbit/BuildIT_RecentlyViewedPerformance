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
		/*
		if (!this.isCookieAllowed()) {
			return;
		}
		*/
		const productMain = document.getElementsByClassName('product-detail');
		if (productMain.length > 0) {
			this.updateView();
			let name = '';
			if(document.querySelector('.product-detail-name')){
				name = document.querySelector('.product-detail-name').innerText;
			}else{
				name = document.querySelector('.product-detail-headline').innerText;
			}
			let flavour = '';
			if(document.querySelector('.product-detail-configurator-select-input')){
				flavour = document.querySelector('.product-detail-configurator-select-input option[selected="selected"]').innerText;
			}
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
				flavour: flavour,
				image: imageURL,
				link: link,
				price: price,
				expiry: now.getTime() + this.options.ttl,
			};

			const recentlyViewed = this.getFromStorage() || [];
			const exists = recentlyViewed.filter(r => r.name === name).length > 0;
			if (!exists || (exists && recentlyViewed.at(-1).name !== name)) {
				if (recentlyViewed.length >= 12) {
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
			document.querySelector('.flagbit-recently-viewed-products').style.display = 'block';
			document
				.querySelector('.recently-viewed-products-slider .swiper-wrapper')
				.querySelectorAll('*')
				.forEach(n => n.remove());
			for (let product of recentlyViewed.reverse()) {
				let entry = document.createElement('div');
				entry.className = 'recently-viewed-products-slide products-slider-slide swiper-slide';
				entry.innerHTML = `
				<div class="slide-content">
					<div class="card product-box box-standard">
						<div class="card-body">
							<div class="product-image-wrapper">
								<a href="${product.link}" title="${product.name}" class="product-image-link is-standard">
									<img src="${product.image}" alt="${product.name}" title="${product.name}" loading="lazy" />
								</a>
							</div>
							<div class="product-info">
								<div class="header">
									<a href="${product.link}" class="product-name h4" title="${product.name}">
										${product.name}
									</a>
									<div class="product-variant-characteristics">
                                        <div class="product-variant-characteristics-text">
                                            <span class="product-variant-characteristics-option">${product.flavour}</span>
                                        </div>
                                    </div>
								</div>
								<div class="footer">
									<div class="product-price-info">
										<div class="product-price-wrapper">
											<span class="h4 product-price">${product.price}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>`;
				document.querySelector('.recently-viewed-products-slider .swiper-wrapper').appendChild(entry);
			}
		} else {
			document.querySelector('.flagbit-recently-viewed-products').style.display = 'none';
		}
	}
}
