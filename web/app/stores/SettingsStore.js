import alt from "alt-instance";
import SettingsActions from "actions/SettingsActions";
import IntlActions from "actions/IntlActions";
import Immutable from "immutable";
import {merge} from "lodash";
import ls from "common/localStorage";

const CORE_ASSET = "BTS"; // Setting this to BTS to prevent loading issues when used with BTS chain which is the most usual case currently

const STORAGE_KEY = "__graphene__";
let ss = new ls(STORAGE_KEY);

let lang = {
    locale: "en"
};

let marketsList = [
   "BLOCKPAY",
   "BROWNIE.PTS",
   "BTS",
   "BTWTY",
   "CNY",
   "EUR",
   "USD",
   "BTSR",
   "ICOO",
   "OBITS",
   "OPEN.ARDR",
   "OPEN.BTC",
   "OPEN.CNY",
   "OPEN.DASH",
   "OPEN.DCT",
   "OPEN.DGD",
   "OPEN.DOGE",
   "OPEN.BKS",
   "OPEN.ETH",
   "OPEN.EUR",
   "OPEN.EURT",
   "OPEN.GAME",
   "OPEN.GRC",
   "OPEN.HEAT",
   "OPEN.INCNT",
   "OPEN.LISK",
   "OPEN.LTC",
   "OPEN.MAID",
   "OPEN.MKR",
   "OPEN.MUSE",
   "OPEN.NXC",
   "OPEN.OMNI",
   "OPEN.STEEM",
   "OPEN.USD",
   "OPEN.USDT",
   "OPEN.WAVES",
   "SHAREBITS",
   "SOLCERT",
   "HEMPSWEET"
];

function checkBit(bit) {
    if (bit == "BITUSD" || bit == "BITEUR" || bit == "BITCNY" || bit == "BITGOLD" || bit == "BITBTC") {
        return true;
    }
}

class SettingsStore {
    constructor() {
        this.exportPublicMethods({ getSetting: this.getSetting.bind(this) });

        this.defaultSettings = Immutable.Map({
            locale: lang.locale,
            apiServer: "wss://bitshares.openledger.info/ws",
            faucet_address: "https://bitshares.openledger.info",
            unit: CORE_ASSET,
            showSettles: false,
            showAssetPercent: false,
            walletLockTimeout: 60 * 10,
            themes: "olDarkTheme",
            disableChat: false,
            traderMode: false
        });
        // Default markets setup
        this.topMarkets = marketsList;

        // this.preferredBases = Immutable.List([CORE_ASSET, "OPEN.BTC", "USD", "CNY", "BTC"]);
        // Openledger
        this.preferredBases = Immutable.List(["OPEN.BTC", "USD", CORE_ASSET, "OBITS"]);

        function addMarkets(target, base, markets) {
            markets.filter(a => {
                return a !== base;
            }).forEach(market => {
                target.push([`${market}_${base}`, { "quote": market, "base": base }]);
            });
        }

        let defaultMarkets = [];
        this.preferredBases.forEach(base => {
            addMarkets(defaultMarkets, base, this.topMarkets);
        });

        // If you want a default value to be translated, add the translation to settings in locale-xx.js
        // and use an object {translate: key} in the defaults array
        let apiServer = [
            { url: "wss://bitshares.openledger.info/ws", location: "Nuremberg, Germany" },
            { url: "wss://eu.openledger.info/ws", location: "Berlin, Germany" },
            { url: "wss://openledger.hk/ws", location: "Hong Kong" },
            { url: "wss://testnet.bitshares.eu/ws", location: "Public Testnet Server (Frankfurt, Germany)" }
        ];

        let defaults = {
            locale: [
                "en",
                "cn",
                "fr",
                "ko",
                "de",
                "es",
                "tr",
                "ru"
            ],
            apiServer: [],
            unit: [
                CORE_ASSET,
                "USD",
                "CNY",
                "BTC",
                "EUR",
                "GBP"
            ],
            showSettles: [
                { translate: "yes" },
                { translate: "no" }
            ],
            showAssetPercent: [
                { translate: "yes" },
                { translate: "no" }
            ],
            disableChat: [
                { translate: "yes" },
                { translate: "no" }
            ],
            themes: [
                "darkTheme",
                "lightTheme",
                "olDarkTheme"
            ],
            traderMode: [
                    false,
                    true
                ]
                // confirmMarketOrder: [
                //     {translate: "confirm_yes"},
                //     {translate: "confirm_no"}
                // ]
        };

        this.bindListeners({
            onChangeSetting: SettingsActions.changeSetting,
            onChangeViewSetting: SettingsActions.changeViewSetting,
            onChangeMarketDirection: SettingsActions.changeMarketDirection,
            onAddStarMarket: SettingsActions.addStarMarket,
            onRemoveStarMarket: SettingsActions.removeStarMarket,
            onAddStarAccount: SettingsActions.addStarAccount,
            onRemoveStarAccount: SettingsActions.removeStarAccount,
            onAddWS: SettingsActions.addWS,
            onRemoveWS: SettingsActions.removeWS,
            onHideAsset: SettingsActions.hideAsset,
            onClearSettings: SettingsActions.clearSettings,
            onSwitchLocale: IntlActions.switchLocale
        });

        this.settings = Immutable.Map(merge(this.defaultSettings.toJS(), ss.get("settings_v3")));

        this.marketsString = "markets";
        this.staticDefaultMarkets = Immutable.Map(ss.get([], defaultMarkets));
        this.starredMarkets = Immutable.Map(ss.get(this.marketsString, []));
        this.starredAccounts = Immutable.Map(ss.get("starredAccounts"));

        let savedDefaults = ss.get("defaults_v1", {});
        this.defaults = merge({}, defaults, savedDefaults);

        (savedDefaults.connection || []).forEach(api => {
            let hasApi = false;
            if (typeof api === "string") {
                api = { url: api, location: null };
            }
            apiServer.forEach(server => {
                if (server.url === api.url) {
                    hasApi = true;
                }
            });

            if (!hasApi) {
                this.defaults.apiServer.push(api);
            }
        });

        (savedDefaults.apiServer || []).forEach(api => {
            let hasApi = false;
            if (typeof api === "string") {
                api = { url: api, location: null };
            }
            this.defaults.apiServer.forEach(server => {
                if (server.url === api.url) {
                    hasApi = true;
                }
            });

            if (!hasApi) {
                this.defaults.apiServer.push(api);
            }
        });

        for (let i = apiServer.length - 1; i >= 0; i--) {
            let hasApi = false;
            this.defaults.apiServer.forEach(api => {
                if (api.url === apiServer[i].url) {
                    hasApi = true;
                }
            });
            if (!hasApi) {
                this.defaults.apiServer.unshift(apiServer[i]);
            }
        }

        this.viewSettings = Immutable.Map(ss.get("viewSettings_v1"));

        this.marketDirections = Immutable.Map(ss.get("marketDirections"));

        this.hiddenAssets = Immutable.List(ss.get("hiddenAssets", []));
    }

    getSetting(setting) {
        return this.settings.get(setting);
    }

    onChangeSetting(payload) {
        this.settings = this.settings.set(
            payload.setting,
            payload.value
        );

        ss.set("settings_v3", this.settings.toJS());
        if (payload.setting === "walletLockTimeout") {
            ss.set("lockTimeout", payload.value);
        }
    }

    onChangeViewSetting(payload) {
        for (let key in payload) {
            this.viewSettings = this.viewSettings.set(key, payload[key]);
        }

        ss.set("viewSettings_v1", this.viewSettings.toJS());
    }

    onChangeMarketDirection(payload) {
        for (let key in payload) {
            this.marketDirections = this.marketDirections.set(key, payload[key]);
        }

        ss.set("marketDirections", this.marketDirections.toJS());
    }

    onHideAsset(payload) {
        if (payload.id) {
            if (!payload.status) {
                this.hiddenAssets = this.hiddenAssets.delete(this.hiddenAssets.indexOf(payload.id));
            } else {
                this.hiddenAssets = this.hiddenAssets.push(payload.id);
            }
        }

        ss.set("hiddenAssets", this.hiddenAssets.toJS());
    }

    onAddStarMarket(market) {
        let marketID = market.quote + "_" + market.base;

        if (!this.starredMarkets.has(marketID)) {
            this.starredMarkets = this.starredMarkets.set(marketID, { quote: market.quote, base: market.base });

            ss.set(this.marketsString, this.starredMarkets.toJS());
        } else {
            return false;
        }
    }

    onRemoveStarMarket(market) {
        let marketID = market.quote + "_" + market.base;

        this.starredMarkets = this.starredMarkets.delete(marketID);

        ss.set(this.marketsString, this.starredMarkets.toJS());
    }

    onAddStarAccount(account) {
        if (!this.starredAccounts.has(account)) {
            this.starredAccounts = this.starredAccounts.set(account, { name: account });

            ss.set("starredAccounts", this.starredAccounts.toJS());
        } else {
            return false;
        }
    }

    onRemoveStarAccount(account) {

        this.starredAccounts = this.starredAccounts.delete(account);

        ss.set("starredAccounts", this.starredAccounts.toJS());
    }

    onAddWS(ws) {
        if (typeof ws === "string") {
            ws = { url: ws, location: null };
        }
        this.defaults.apiServer.push(ws);
        ss.set("defaults_v1", this.defaults);
    }

    onRemoveWS(index) {
        if (index !== 0) { // Prevent removing the default apiServer
            this.defaults.apiServer.splice(index, 1);
            ss.set("defaults_v1", this.defaults);
        }
    }

    onClearSettings(resolve) {
        ss.remove("settings_v3");
        this.settings = this.defaultSettings;

        ss.set("settings_v3", this.settings.toJS());

        if (resolve) {
            resolve();
        }
    }

    onSwitchLocale({ locale }) {
        console.log("onSwitchLocale:", locale);

        this.onChangeSetting({ setting: "locale", value: locale });
    }
}

let set_obj = alt.createStore(SettingsStore, "SettingsStore");

set_obj.fiatAssets = [{
    backingCoinType: "USD",
    name: "Dollar",
    supportsMemos: false,
    symbol: "OPEN.USD",
    walletType: "openledger-fiat"
}, {
    backingCoinType: "EUR",
    name: "Euro",
    supportsMemos: false,
    symbol: "OPEN.EUR",
    walletType: "openledger-fiat"
}, {
    backingCoinType: "CNY",
    name: "Dollar",
    supportsMemos: false,
    symbol: "OPEN.CNY",
    walletType: "openledger-fiat"
}];

set_obj.lang = lang;
set_obj.rpc_url = "https://openledger.info/api/";
set_obj.site_registr = "https://openledger.info/v/";
set_obj.checkBit = checkBit;
set_obj.marketsList = marketsList;
set_obj.marketsOpenList = marketsList.filter(e => {
    return e.indexOf("OPEN.") === 0;
}).map(e => e.split("OPEN.").join(""));

export default set_obj
