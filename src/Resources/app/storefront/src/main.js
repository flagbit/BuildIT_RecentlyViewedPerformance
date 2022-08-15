import RecentlyViewedPlugin from './recently_viewed/recently_viewed.plugin';

const PluginManager = window.PluginManager;

PluginManager.register('RecentlyViewedPlugin', RecentlyViewedPlugin, '[data-recently-viewed-plugin]');

// Important for the webpack hot module reloading server.
if (module.hot) {
	module.hot.accept();
}
